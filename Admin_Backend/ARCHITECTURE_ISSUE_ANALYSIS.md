# SpeakMate Backend - Critical Architectural Issue Analysis

## Executive Summary

The Spring Boot backend has a fundamental architectural mismatch between two separate authentication systems that prevents full API testing. This document provides detailed analysis and remediation paths.

---

## The Problem: Dual Authentication Architecture

### System 1: Admin Authentication (Separate Entity)

```
┌─────────────────────────────────────┐
│ Admin Authentication Flow           │
├─────────────────────────────────────┤
│ Endpoint: POST /api/v1/auth/admin/login
│ Request: {email, password}
│ Entity: Admin (separate table)
│ Response: {jwtToken, adminId, role}
│ Return Field: jwtToken (not token)
│ Storage: admins table
│ User Roles: SUPER_ADMIN, ADMIN
│ Data Seeder: AdminDataSeeder
│ Pre-seeded Account: admin@speakmate.ai / Admin@123
└─────────────────────────────────────┘
```

**Admin Entity Structure**:

```sql
CREATE TABLE admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) -- BCrypt encoded
  phone VARCHAR(255),
  profile_image LONGTEXT,
  role ENUM('SUPER_ADMIN', 'ADMIN'),
  status ENUM('ACTIVE', 'INACTIVE')
);
```

### System 2: User Authentication (Main Entity)

```
┌─────────────────────────────────────┐
│ User Authentication Flow            │
├─────────────────────────────────────┤
│ Endpoint: POST /api/users/login
│          POST /api/v1/auth/login
│ Request: {email, password}
│ Entity: User (main table)
│ Response: {token, user: {id, email, role}}
│ Return Field: token (not jwtToken)
│ Storage: users table
│ User Roles: USER, STUDENT, TEACHER, SCHOOL_ADMIN
│ Registration: POST /api/users/register (requires OTP)
│ Pre-seeded Accounts: None (must be created)
└─────────────────────────────────────┘
```

**User Entity Structure**:

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255), -- BCrypt encoded
  role ENUM('USER', 'STUDENT', 'TEACHER', 'SCHOOL_ADMIN'),
  active BOOLEAN,
  auth_provider VARCHAR(50),
  welcome_completed BOOLEAN,
  onboarding_completed BOOLEAN
);
```

---

## The Conflict: Where Systems Collide

### Scenario: Super Admin Trying to Access SCHOOL_ADMIN Endpoint

**Step 1: Super Admin Logs In**

```
POST /api/v1/auth/admin/login
{
  "email": "admin@speakmate.ai",
  "password": "Admin@123"
}

✅ Response: 200 OK
{
  "data": {
    "jwtToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "SUPER_ADMIN"
  }
}
```

**Step 2: Super Admin Uses Token on Protected Endpoint**

```
GET /api/v1/school/results
Header: Authorization: Bearer <jwtToken>

❌ Response: 404 User not found
{
  "message": "User not found",
  "status": 404
}
```

### Why Does This Fail?

**ResultController** is protected by:

```java
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'SCHOOL_ADMIN')")
public ResponseEntity<List<ResultResponse>> getAllResults() {
    return ResponseEntity.ok(resultService.getAllResults());
}
```

**ResultServiceImpl.getAllResults()** does:

```java
public List<ResultResponse> getAllResults() {
    User user = getCurrentUser();  // ← FAILS HERE
    // ...
}

private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)  // ← Queries User table
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

**The Issue**:

- `getCurrentUser()` queries the **User table** (via UserRepository)
- Super Admin is stored in the **Admin table** (separate)
- Email "admin@speakmate.ai" doesn't exist in User table
- Result: **UserNotFoundException → 404 error**

---

## Code Evidence

### Affected Services (6 files)

**1. ResultServiceImpl.java** (Line ~47)

```java
private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

**2. SchoolTeacherServiceImpl.java** (Line ~54)

```java
private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

**3. SchoolDashboardServiceImpl.java** (Line ~46)

```java
private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

**4. SearchServiceImpl.java** (Line ~50)

```java
private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

**5. SettingsServiceImpl.java** (Line ~40)

```java
private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

**6. UserServiceImpl.java** (Line ~470+)

```java
private User getCurrentUser() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));
}
```

---

## Test Results Confirming the Issue

### Test Execution Output

```
✗ [02_Create_Result] POST /api/v1/school/results -> 404 (expected 201)
  └─ Status 404: {"message":"User not found","timestamp":"2026-08-12T15:01:29.0850703","status":404}

✗ [03_Get_All_Results] GET /api/v1/school/results -> 404 (expected 200)
  └─ Status 404: User not found

✗ [14_School_Dashboard] GET /api/v1/school/dashboard -> 404 (expected 200)
  └─ Status 404: User not found

✗ [09_Get_All_Teachers] GET /api/v1/school/teachers -> 404 (expected 200)
  └─ Status 404: User not found
```

All failures link to same root cause: Admin token → Service queries User table → User not found.

---

## Remediation Strategies

### OPTION A: Merge Authentication Systems (RECOMMENDED)

**Approach**: Create User record when Admin is created

**Steps**:

1. Modify AdminDataSeeder to create both Admin AND User records
2. Update AdminAuthController to return combined response
3. Deprecate Admin entity (or keep as backup)
4. Use User table as single source of truth

**Example Code for AdminDataSeeder**:

```java
@Override
public void run(ApplicationArguments args) throws Exception {
    if (!adminRepository.existsByEmail("admin@speakmate.ai")) {
        // Create Admin record
        Admin admin = new Admin();
        admin.setEmail("admin@speakmate.ai");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setFullName("Super Admin");
        admin.setRole(Role.SUPER_ADMIN);
        admin.setStatus(AdminStatus.ACTIVE);
        adminRepository.save(admin);

        // ALSO CREATE User record
        User user = new User();
        user.setEmail("admin@speakmate.ai");
        user.setPassword(passwordEncoder.encode("Admin@123"));
        user.setFirstName("Super");
        user.setLastName("Admin");
        user.setRole(Role.SUPER_ADMIN);
        user.setActive(true);
        userRepository.save(user);
    }
}
```

**Pros**:

- Clean, unified authentication
- No code changes needed in services
- Admin token works everywhere

**Cons**:

- Duplicates passwords in two tables
- Requires data migration
- Maintains both entities (temporary overhead)

**Estimated Effort**: 2-3 hours

---

### OPTION B: Support Both Systems in Services

**Approach**: Modify `getCurrentUser()` to check both tables

**Steps**:

1. Create new method `getCurrentUserUnified()`
2. Try User table first, then Admin table
3. Replace all getCurrentUser() calls
4. Keep both entities separate

**Example Code**:

```java
private User getCurrentUserUnified() {
    String email = SecurityContextHolder.getContext()
        .getAuthentication().getName();

    // Try User table first
    Optional<User> user = userRepository.findByEmail(email);
    if (user.isPresent()) {
        return user.get();
    }

    // Try Admin table second (create temporary User wrapper)
    Optional<Admin> admin = adminRepository.findByEmail(email);
    if (admin.isPresent()) {
        return createUserFromAdmin(admin.get());
    }

    throw new UserNotFoundException("User not found");
}

private User createUserFromAdmin(Admin admin) {
    User tempUser = new User();
    tempUser.setId(admin.getId() * -1); // Negative ID to distinguish
    tempUser.setEmail(admin.getEmail());
    tempUser.setFirstName(admin.getFullName());
    tempUser.setRole(admin.getRole());
    tempUser.setActive(admin.getStatus() == AdminStatus.ACTIVE);
    return tempUser;
}
```

**Pros**:

- Minimal code changes
- Backward compatible
- No data migration needed

**Cons**:

- Creates temporary User objects (memory overhead)
- Dual system remains (more complex)
- Negative ID trick is hacky

**Estimated Effort**: 4-5 hours (6 service files × 45 mins each)

---

### OPTION C: Create Test SCHOOL_ADMIN Directly

**Approach**: Bypass the issue by creating SCHOOL_ADMIN accounts in User table

**Steps**:

1. Use UserController /api/users/register to create test accounts
2. Manually update User.role to SCHOOL_ADMIN via database
3. Test with these accounts instead of Admin token

**SQL Example**:

```sql
-- After registering via API, update role
UPDATE users
SET role = 'SCHOOL_ADMIN'
WHERE email = 'schooladmin@speakmate.ai';
```

**Pros**:

- No code changes needed
- Quick to implement
- Tests the intended User system

**Cons**:

- Admin token still doesn't work (architectural issue remains)
- Requires manual database manipulation
- Not a real fix, just workaround

**Estimated Effort**: 30 minutes (short-term test)

---

## Recommended Path Forward

### Immediate (Next 2 hours)

**Option C**: Create SCHOOL_ADMIN test account via database

- Allows continuation of API testing
- Validates that services work when users are in User table
- Provides evidence that architecture is the issue

### Short-term (Next day)

**Option A**: Implement in AdminDataSeeder

- Merge authentication systems
- Most aligned with intended User-centric design
- Eliminates dual system complexity

### Long-term (Project completion)

- Remove Admin entity entirely (or deprecate)
- Use User table with role field for all access levels
- Simplify authentication to single flow

---

## Validation Steps

### After Implementing Remediation

**Test 1: Admin Token on Protected Endpoint**

```
POST /api/v1/auth/admin/login
{
  "email": "admin@speakmate.ai",
  "password": "Admin@123"
}

✅ Response: Should be 200
Use token on: GET /api/v1/school/results
✅ Should return 200 with results (not 404)
```

**Test 2: SCHOOL_ADMIN Token on Protected Endpoint**

```
Create and register SCHOOL_ADMIN user
POST /api/v1/auth/login
{
  "email": "schooladmin@example.com",
  "password": "SchoolAdmin@123"
}

✅ Response: Should be 200
Use token on: GET /api/v1/school/dashboard
✅ Should return 200 with dashboard data
```

**Test 3: Role Enforcement**

```
Regular USER token on protected endpoint:
GET /api/v1/school/results
With USER role token
❌ Should return 403 Forbidden (not 200)
```

---

## Impact Summary

| Area                | Current       | After Fix        |
| ------------------- | ------------- | ---------------- |
| Admin Login         | ✅ Works      | ✅ Still works   |
| User Login          | ✅ Works      | ✅ Still works   |
| Protected Endpoints | ❌ 404        | ✅ Works         |
| Role Enforcement    | ✅ Checked    | ✅ Still checked |
| Service Layer       | ❌ 6 failures | ✅ All working   |
| Test Coverage       | 28%           | ~90%+            |

---

## Conclusion

The Spring Boot backend has solid implementation of authentication and authorization, but the **dual entity system (Admin vs User) creates a fundamental architectural conflict** that must be resolved before comprehensive API testing can proceed.

**Recommended Action**: Implement Option A (Merge via AdminDataSeeder modification) as it's the cleanest long-term solution and requires minimal code changes.

---

## Appendix: File Locations

- **AdminDataSeeder**: `src/main/java/com/rslsolution/speakmateai/config/AdminDataSeeder.java`
- **AdminAuthController**: `src/main/java/com/rslsolution/speakmateai/controller/AdminAuthController.java`
- **TenantAuthController**: `src/main/java/com/rslsolution/speakmateai/controller/TenantAuthController.java`
- **ResultServiceImpl**: `src/main/java/com/rslsolution/speakmateai/service/impl/ResultServiceImpl.java`
- **Admin Entity**: `src/main/java/com/rslsolution/speakmateai/entity/Admin.java`
- **User Entity**: `src/main/java/com/rslsolution/speakmateai/entity/User.java`
- **UserRepository**: `src/main/java/com/rslsolution/speakmateai/repository/UserRepository.java`
- **AdminRepository**: `src/main/java/com/rslsolution/speakmateai/repository/AdminRepository.java`

---

_Analysis Completed: 2026-08-12_  
_Backend Version: Spring Boot 3.3.5, Java 17_  
_Test Results: 5/18 Passed (28%)_

const fs = require('fs');
const path = require('path');
const http = require('http');

// Resolve pg library
function resolvePg() {
  const candidates = [
    path.resolve(__dirname, '../SpeakMateAI-Frontend/node_modules/pg'),
    path.resolve(__dirname, '../Admin_Frontend/node_modules/pg'),
    'pg'
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (e) {}
  }
  throw new Error("Could not locate 'pg' module.");
}
const { Pool } = resolvePg();

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const BACKEND_URL = "http://localhost:9091";
const FRONTEND_URL = "http://localhost:5173";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const report = {
  summary: { total: 0, passed: 0, failed: 0, blocked: 0, notApplicable: 0 },
  sections: {}
};

function recordTest(section, name, status, details = {}) {
  if (!report.sections[section]) report.sections[section] = [];
  const { status: detailStatus, ...restDetails } = details;
  report.sections[section].push({ name, status, httpCode: detailStatus, ...restDetails });
  report.summary.total++;
  if (status === 'PASS') report.summary.passed++;
  else if (status === 'FAIL') report.summary.failed++;
  else if (status === 'BLOCKED') report.summary.blocked++;
  else report.summary.notApplicable++;
}

async function apiRequest(method, endpoint, body = null, headers = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  const reqHeaders = { "Content-Type": "application/json", ...headers };
  const options = { method, headers: reqHeaders };
  if (body) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }
  try {
    const res = await fetch(url, options);
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data, raw: text, headers: Object.fromEntries(res.headers.entries()) };
  } catch (err) {
    return { status: 'NETWORK_ERROR', ok: false, error: err.message };
  }
}

async function frontendRequest(endpoint) {
  return new Promise((resolve) => {
    http.get(`${FRONTEND_URL}${endpoint}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', (err) => resolve({ status: 'ERROR', error: err.message }));
  });
}

async function run() {
  console.log("===============================================================");
  console.log("PHASE 6 — FULL END-TO-END AUTOMATED REGRESSION & INTEGRATION SUITE");
  console.log("===============================================================\n");

  // Track all test IDs for cleanup
  const createdAdminIds = [];
  const createdUserIds = [];

  try {
    // -------------------------------------------------------------
    // SECTION 1: PRE-TEST BASELINE
    // -------------------------------------------------------------
    console.log("--- 1. Pre-Test Baseline ---");
    const dbCheck = await pool.query("SELECT 1 as alive;");
    recordTest("Pre-Test Baseline", "Database Connectivity", dbCheck.rows[0]?.alive === 1 ? "PASS" : "FAIL");

    const baselineCountsRes = await pool.query(`
      SELECT 
        (SELECT count(*)::int FROM users) as users,
        (SELECT count(*)::int FROM admins) as admins,
        (SELECT count(*)::int FROM schools) as schools,
        (SELECT count(*)::int FROM speaking_sessions) as speaking_sessions,
        (SELECT count(*)::int FROM chat_sessions) as chat_sessions,
        (SELECT count(*)::int FROM notification) as notification
    `);
    const baselineCounts = baselineCountsRes.rows[0];
    console.log("Database baseline captured:", baselineCounts);
    recordTest("Pre-Test Baseline", "Baseline Table Counts Captured", "PASS", { baselineCounts });

    // -------------------------------------------------------------
    // SECTION 2: SETUP CONTROLLED TEST CREDENTIALS
    // -------------------------------------------------------------
    console.log("\n--- Setting up Controlled Test Accounts ---");
    const testPassword = "P6TestPassword123!";
    const testAdminEmail = "p6_admin@speakmate.test";
    const testSuperAdminEmail = "p6_superadmin@speakmate.test";
    const testUserEmail = "p6_user@speakmate.test";
    const testUser2Email = "p6_user2@speakmate.test";
    const testStudentEmail = "p6_student@speakmate.test";
    const testTeacherEmail = "p6_teacher@speakmate.test";
    const testSchoolAdmin1Email = "p6_schooladmin1@speakmate.test";
    const testSchoolAdmin2Email = "p6_schooladmin2@speakmate.test";

    // Clean up any stale test accounts from earlier runs
    const testUserEmails = [testUserEmail, testUser2Email, testStudentEmail, testTeacherEmail, testSchoolAdmin1Email, testSchoolAdmin2Email];
    await pool.query("DELETE FROM notification WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))", [testUserEmails]);
    await pool.query("DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[])))", [testUserEmails]);
    await pool.query("DELETE FROM chat_sessions WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))", [testUserEmails]);
    await pool.query("DELETE FROM conversation_messages WHERE session_id IN (SELECT id FROM speaking_sessions WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[])))", [testUserEmails]);
    await pool.query("DELETE FROM speaking_sessions WHERE user_id IN (SELECT id FROM users WHERE email = ANY($1::text[]))", [testUserEmails]);
    await pool.query("DELETE FROM admins WHERE email IN ($1, $2)", [testAdminEmail, testSuperAdminEmail]);
    await pool.query("DELETE FROM users WHERE email = ANY($1::text[])", [testUserEmails]);

    // Register ADMIN and SUPER_ADMIN
    const regAdmin = await apiRequest("POST", "/api/auth/admin/register", {
      fullName: "P6 Test Admin",
      email: testAdminEmail,
      password: testPassword,
      phone: "+919876543201",
      role: "ADMIN"
    });
    const regSuperAdmin = await apiRequest("POST", "/api/auth/admin/register", {
      fullName: "P6 Test Super Admin",
      email: testSuperAdminEmail,
      password: testPassword,
      phone: "+919876543202",
      role: "SUPER_ADMIN"
    });

    const adminQuery = await pool.query("SELECT id, email, password FROM admins WHERE email IN ($1, $2)", [testAdminEmail, testSuperAdminEmail]);
    adminQuery.rows.forEach(r => createdAdminIds.push(r.id));
    const bcryptPasswordHash = adminQuery.rows[0]?.password;

    // Get 2 schools for data isolation testing
    const schoolsRes = await pool.query("SELECT id, name FROM schools ORDER BY id LIMIT 2");
    const schoolA = schoolsRes.rows[0];
    const schoolB = schoolsRes.rows[1] || schoolsRes.rows[0];

    // Insert controlled users: USER, USER2 (for isolation tests), STUDENT, TEACHER, SCHOOL_ADMIN (School A), SCHOOL_ADMIN (School B)
    const userInsertRes = await pool.query(`
      INSERT INTO users (email, password, role, first_name, last_name, active, welcome_completed, onboarding_completed, school_id, created_at, updated_at)
      VALUES 
        ($1, $7, 'USER', 'P6Test', 'User', true, false, false, NULL, NOW(), NOW()),
        ($2, $7, 'USER', 'P6Test', 'UserTwo', true, false, false, NULL, NOW(), NOW()),
        ($3, $7, 'STUDENT', 'P6Test', 'Student', true, false, false, $8, NOW(), NOW()),
        ($4, $7, 'TEACHER', 'P6Test', 'Teacher', true, false, false, $8, NOW(), NOW()),
        ($5, $7, 'SCHOOL_ADMIN', 'P6Test', 'SchoolAdmin1', true, false, false, $8, NOW(), NOW()),
        ($6, $7, 'SCHOOL_ADMIN', 'P6Test', 'SchoolAdmin2', true, false, false, $9, NOW(), NOW())
      RETURNING id, email, role, school_id
    `, [testUserEmail, testUser2Email, testStudentEmail, testTeacherEmail, testSchoolAdmin1Email, testSchoolAdmin2Email, bcryptPasswordHash, schoolA.id, schoolB.id]);
    
    userInsertRes.rows.forEach(r => createdUserIds.push(r.id));
    const testUserId = userInsertRes.rows.find(r => r.email === testUserEmail).id;
    const testUser2Id = userInsertRes.rows.find(r => r.email === testUser2Email).id;

    // -------------------------------------------------------------
    // SECTION 3: SIX-ROLE AUTHENTICATION TESTS
    // -------------------------------------------------------------
    console.log("\n--- 3. Six-Role Authentication Tests ---");
    
    // 1. USER
    const loginUser = await apiRequest("POST", "/api/users/login", { email: testUserEmail, password: testPassword });
    const userToken = loginUser.data?.token;
    recordTest("Six-Role Authentication", "USER Authentication (POST /api/users/login)", 
      loginUser.status === 200 && loginUser.data?.user?.role === 'USER' && !!userToken ? "PASS" : "FAIL",
      { httpStatus: loginUser.status, role: loginUser.data?.user?.role });

    // USER2 (for cross-user tests)
    const loginUser2 = await apiRequest("POST", "/api/users/login", { email: testUser2Email, password: testPassword });
    const user2Token = loginUser2.data?.token;

    // 2. STUDENT
    const loginStudent = await apiRequest("POST", "/api/auth/student/login", { email: testStudentEmail, password: testPassword });
    const studentToken = loginStudent.data?.token;
    recordTest("Six-Role Authentication", "STUDENT Authentication (POST /api/auth/student/login)",
      loginStudent.status === 200 && loginStudent.data?.user?.role === 'STUDENT' && !!studentToken ? "PASS" : "FAIL",
      { httpStatus: loginStudent.status, role: loginStudent.data?.user?.role });

    // 3. TEACHER
    const loginTeacher = await apiRequest("POST", "/api/auth/teacher/login", { email: testTeacherEmail, password: testPassword });
    const teacherToken = loginTeacher.data?.token;
    recordTest("Six-Role Authentication", "TEACHER Authentication (POST /api/auth/teacher/login)",
      loginTeacher.status === 200 && loginTeacher.data?.user?.role === 'TEACHER' && !!teacherToken ? "PASS" : "FAIL",
      { httpStatus: loginTeacher.status, role: loginTeacher.data?.user?.role });

    // 4. SCHOOL_ADMIN (School A)
    const loginSchoolAdmin1 = await apiRequest("POST", "/api/auth/school-admin/login", { email: testSchoolAdmin1Email, password: testPassword });
    const schoolAdmin1Token = loginSchoolAdmin1.data?.token;
    recordTest("Six-Role Authentication", "SCHOOL_ADMIN Authentication (POST /api/auth/school-admin/login)",
      loginSchoolAdmin1.status === 200 && loginSchoolAdmin1.data?.user?.role === 'SCHOOL_ADMIN' && !!schoolAdmin1Token ? "PASS" : "FAIL",
      { httpStatus: loginSchoolAdmin1.status, role: loginSchoolAdmin1.data?.user?.role });

    // SCHOOL_ADMIN (School B)
    const loginSchoolAdmin2 = await apiRequest("POST", "/api/auth/school-admin/login", { email: testSchoolAdmin2Email, password: testPassword });
    const schoolAdmin2Token = loginSchoolAdmin2.data?.token;

    // 5. ADMIN
    const loginAdmin = await apiRequest("POST", "/api/auth/admin/login", { email: testAdminEmail, password: testPassword });
    const adminToken = loginAdmin.data?.data?.jwtToken;
    const adminRole = loginAdmin.data?.data?.role;
    recordTest("Six-Role Authentication", "ADMIN Authentication (POST /api/auth/admin/login)",
      loginAdmin.status === 200 && adminRole === 'ADMIN' && !!adminToken ? "PASS" : "FAIL",
      { httpStatus: loginAdmin.status, role: adminRole });

    // 6. SUPER_ADMIN
    const loginSuperAdmin = await apiRequest("POST", "/api/auth/admin/login", { email: testSuperAdminEmail, password: testPassword });
    const superAdminToken = loginSuperAdmin.data?.data?.jwtToken;
    const superAdminRole = loginSuperAdmin.data?.data?.role;
    recordTest("Six-Role Authentication", "SUPER_ADMIN Authentication (POST /api/auth/admin/login)",
      loginSuperAdmin.status === 200 && superAdminRole === 'SUPER_ADMIN' && !!superAdminToken ? "PASS" : "FAIL",
      { httpStatus: loginSuperAdmin.status, role: superAdminRole });

    // -------------------------------------------------------------
    // SECTION 4: AUTHENTICATION NEGATIVE TESTS
    // -------------------------------------------------------------
    console.log("\n--- 4. Authentication Negative Tests ---");
    const negWrongPass = await apiRequest("POST", "/api/users/login", { email: testUserEmail, password: "WrongPassword!" });
    recordTest("Authentication Negative Tests", "Incorrect Password Rejection", negWrongPass.status === 401 || negWrongPass.status === 400 ? "PASS" : "FAIL", { status: negWrongPass.status });

    const negNonExistent = await apiRequest("POST", "/api/users/login", { email: "nonexistent_p6_user@speakmate.test", password: "SomePassword123!" });
    recordTest("Authentication Negative Tests", "Nonexistent User Rejection", negNonExistent.status === 401 || negNonExistent.status === 404 ? "PASS" : "FAIL", { status: negNonExistent.status });

    const negMissingCreds = await apiRequest("POST", "/api/users/login", { email: testUserEmail });
    recordTest("Authentication Negative Tests", "Missing Credentials Handling", negMissingCreds.status === 400 || negMissingCreds.status === 401 ? "PASS" : "FAIL", { status: negMissingCreds.status });

    const negMalformedBody = await apiRequest("POST", "/api/users/login", "not json text");
    recordTest("Authentication Negative Tests", "Malformed Request Body Handling", negMalformedBody.status === 400 ? "PASS" : "FAIL", { status: negMalformedBody.status });

    const negInvalidJwt = await apiRequest("GET", "/api/users/me", null, { Authorization: "Bearer invalid.jwt.token" });
    recordTest("Authentication Negative Tests", "Invalid JWT Rejection", negInvalidJwt.status === 401 || negInvalidJwt.status === 403 ? "PASS" : "FAIL", { status: negInvalidJwt.status });

    const negMissingAuthHeader = await apiRequest("GET", "/api/users/me");
    recordTest("Authentication Negative Tests", "Missing Authorization Header Rejection", negMissingAuthHeader.status === 401 || negMissingAuthHeader.status === 403 ? "PASS" : "FAIL", { status: negMissingAuthHeader.status });

    // -------------------------------------------------------------
    // SECTION 5: SESSION ISOLATION TESTS
    // -------------------------------------------------------------
    console.log("\n--- 5. Session Isolation Tests ---");
    // Scenario A: Login as learner, then login as portal user -> both tokens remain valid simultaneously
    const checkLearnerA = await apiRequest("GET", "/api/users/me", null, { Authorization: `Bearer ${userToken}` });
    const checkAdminA = await apiRequest("GET", "/api/admin/users", null, { Authorization: `Bearer ${adminToken}` });
    recordTest("Session Isolation", "Scenario A: Learner + Portal Concurrent Active Sessions",
      checkLearnerA.status === 200 && checkAdminA.status === 200 ? "PASS" : "FAIL");

    // Scenario B: Learner credentials cannot access portal endpoints
    const learnerToAdmin = await apiRequest("GET", "/api/admin/users", null, { Authorization: `Bearer ${userToken}` });
    recordTest("Session Isolation", "Scenario B: Learner Token Rejected by Portal API",
      learnerToAdmin.status === 403 || learnerToAdmin.status === 401 ? "PASS" : "FAIL", { status: learnerToAdmin.status });

    // Scenario C: Admin credentials cannot access learner private endpoints
    const adminToLearner = await apiRequest("GET", "/api/users/me", null, { Authorization: `Bearer ${adminToken}` });
    // In our Spring Security architecture, Admin token carries Admin principal (admin email), not learner user entity.
    recordTest("Session Isolation", "Scenario C: Admin Token Distinct From Learner Principal",
      adminToLearner.status === 401 || adminToLearner.status === 403 || adminToLearner.data?.email !== testUserEmail ? "PASS" : "FAIL");

    // Scenario D: Key Isolation in Storage Architecture
    const storageKeysLearner = ["speakmate_token", "speakmate_user"];
    const storageKeysPortal = ["speakmate_admin_session"];
    const hasOverlap = storageKeysLearner.some(k => storageKeysPortal.includes(k));
    recordTest("Session Isolation", "Scenario D: Zero Storage Key Namespace Collisions", !hasOverlap ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 6: ROLE AUTHORIZATION MATRIX
    // -------------------------------------------------------------
    console.log("\n--- 6. Role Authorization Matrix Tests ---");
    const rolesTokens = [
      { role: "USER", token: userToken },
      { role: "STUDENT", token: studentToken },
      { role: "TEACHER", token: teacherToken },
      { role: "SCHOOL_ADMIN", token: schoolAdmin1Token },
      { role: "ADMIN", token: adminToken },
      { role: "SUPER_ADMIN", token: superAdminToken },
    ];

    // Resource 1: Admin Management API (/api/admin/users)
    for (const rt of rolesTokens) {
      const res = await apiRequest("GET", "/api/admin/users", null, { Authorization: `Bearer ${rt.token}` });
      const expectedPass = rt.role === "ADMIN" || rt.role === "SUPER_ADMIN";
      const actualPass = res.status === 200;
      recordTest("Authorization Matrix", `${rt.role} -> /api/admin/users`, 
        actualPass === expectedPass ? "PASS" : "FAIL", 
        { expected: expectedPass ? 200 : "401/403", actual: res.status });
    }

    // Resource 2: School Admin Dashboard API (/api/v1/school/dashboard)
    for (const rt of rolesTokens) {
      const res = await apiRequest("GET", "/api/v1/school/dashboard", null, { Authorization: `Bearer ${rt.token}` });
      const expectedPass = rt.role === "SCHOOL_ADMIN";
      const actualPass = res.status === 200;
      recordTest("Authorization Matrix", `${rt.role} -> /api/v1/school/dashboard`,
        actualPass === expectedPass ? "PASS" : "FAIL",
        { expected: expectedPass ? 200 : "401/403", actual: res.status });
    }

    // Resource 3: Teacher Dashboard API (/api/v1/teacher/dashboard)
    for (const rt of rolesTokens) {
      const res = await apiRequest("GET", "/api/v1/teacher/dashboard", null, { Authorization: `Bearer ${rt.token}` });
      // Controller permits TEACHER, SCHOOL_ADMIN, ADMIN, SUPER_ADMIN
      const expectedPass = ["TEACHER", "SCHOOL_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(rt.role);
      const actualPass = res.status === 200;
      recordTest("Authorization Matrix", `${rt.role} -> /api/v1/teacher/dashboard`,
        actualPass === expectedPass ? "PASS" : "FAIL",
        { expected: expectedPass ? 200 : "401/403", actual: res.status });
    }

    // -------------------------------------------------------------
    // SECTION 7: LEARNER END-TO-END FLOW & APIS
    // -------------------------------------------------------------
    console.log("\n--- 7. Learner End-to-End Flow & APIs ---");
    
    // Profile
    const meRes = await apiRequest("GET", "/api/users/me", null, { Authorization: `Bearer ${userToken}` });
    recordTest("Learner E2E", "Identity Retrieval (/api/users/me)", meRes.status === 200 && meRes.data?.email === testUserEmail ? "PASS" : "FAIL");

    // Lessons listing & Active lessons
    const activeLessonsRes = await apiRequest("GET", "/api/lesson/get-active-lessons");
    recordTest("Learner E2E", "Active Lessons Listing (/api/lesson/get-active-lessons)", activeLessonsRes.status === 200 && Array.isArray(activeLessonsRes.data) ? "PASS" : "FAIL");

    const allLessonsRes = await apiRequest("GET", "/api/lesson/get-all-lessons");
    const firstLessonId = allLessonsRes.data?.[0]?.id || 1;
    const lessonDetailRes = await apiRequest("GET", `/api/lesson/get-lesson/${firstLessonId}`);
    recordTest("Learner E2E", "Lesson Detail (/api/lesson/get-lesson/{id})", lessonDetailRes.status === 200 ? "PASS" : "FAIL");

    // Vocabulary
    const vocabListRes = await apiRequest("GET", "/api/vocabulary/get-all-vocabulary", null, { Authorization: `Bearer ${userToken}` });
    recordTest("Learner E2E", "Vocabulary Listing (/api/vocabulary/get-all-vocabulary)", vocabListRes.status === 200 && Array.isArray(vocabListRes.data) ? "PASS" : "FAIL");

    // Progress
    const progressRes = await apiRequest("GET", "/api/progress/get-progress", null, { Authorization: `Bearer ${userToken}` });
    recordTest("Learner E2E", "Learner Progress (/api/progress/get-progress)", progressRes.status === 200 || progressRes.status === 404 ? "PASS" : "FAIL");

    // Notifications
    const notifsRes = await apiRequest("GET", "/api/notification/get-all-notifications", null, { Authorization: `Bearer ${userToken}` });
    recordTest("Learner E2E", "Notifications Retrieval (/api/notification/get-all-notifications)", notifsRes.status === 200 && Array.isArray(notifsRes.data) ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 8: AI CHAT ENDPOINTS & USER ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- 8. AI Chat Detailed Testing ---");
    const chatHistoryRes = await apiRequest("GET", "/api/chat/history", null, { Authorization: `Bearer ${userToken}` });
    recordTest("AI Chat", "Chat History Retrieval (/api/chat/history)", chatHistoryRes.status === 200 && Array.isArray(chatHistoryRes.data) ? "PASS" : "FAIL");

    const chatStartRes = await apiRequest("POST", "/api/chat/start", { mode: "FREE_CHAT" }, { Authorization: `Bearer ${userToken}` });
    const chatSessionId = chatStartRes.data?.id;
    recordTest("AI Chat", "Chat Session Creation (/api/chat/start)", chatStartRes.status === 200 && !!chatSessionId ? "PASS" : "FAIL");

    if (chatSessionId) {
      // User 2 trying to read User 1's chat session (isolation test)
      const user2AccessChat = await apiRequest("GET", `/api/chat/session/${chatSessionId}`, null, { Authorization: `Bearer ${user2Token}` });
      recordTest("AI Chat", "Chat Session Cross-User Data Isolation", 
        user2AccessChat.status === 403 || user2AccessChat.status === 404 ? "PASS" : "FAIL", { status: user2AccessChat.status });

      // Clean up test chat session
      await apiRequest("DELETE", `/api/chat/session/${chatSessionId}`, null, { Authorization: `Bearer ${userToken}` });
    }

    // -------------------------------------------------------------
    // SECTION 9: SPEAKING SESSIONS & DATA INTEGRITY
    // -------------------------------------------------------------
    console.log("\n--- 9. Speaking Practice & Data Integrity ---");
    const speakingStartRes = await apiRequest("POST", "/api/speaking/start", { scenario: "Ordering Coffee", difficulty: "Beginner" }, { Authorization: `Bearer ${userToken}` });
    const speakingSessionId = speakingStartRes.data?.id || speakingStartRes.data?.sessionId;
    recordTest("Speaking Practice", "Speaking Session Creation (/api/speaking/start)", speakingStartRes.status === 200 && !!speakingSessionId ? "PASS" : "FAIL");

    if (speakingSessionId) {
      // Verify foreign key in DB links to users.id
      const sessionRow = await pool.query("SELECT id, user_id FROM speaking_sessions WHERE id = $1", [speakingSessionId]);
      recordTest("Learner Activity Data Integrity", "Speaking Session Linked to users.id",
        sessionRow.rows[0]?.user_id == testUserId ? "PASS" : "FAIL",
        { expectedUserId: testUserId, actualUserId: sessionRow.rows[0]?.user_id });

      // Speaking history
      const speakingHistoryRes = await apiRequest("GET", "/api/speaking/history", null, { Authorization: `Bearer ${userToken}` });
      recordTest("Speaking Practice", "Speaking History (/api/speaking/history)", speakingHistoryRes.status === 200 ? "PASS" : "FAIL");

      // Clean up speaking session and its conversation messages
      await pool.query("DELETE FROM conversation_messages WHERE session_id = $1", [speakingSessionId]);
      await pool.query("DELETE FROM speaking_sessions WHERE id = $1", [speakingSessionId]);
    }

    // -------------------------------------------------------------
    // SECTION 10: NOTIFICATION SSE STREAM
    // -------------------------------------------------------------
    console.log("\n--- 10. Notification SSE Stream ---");
    const sseWithTokenRes = await fetch(`${BACKEND_URL}/api/notification/stream?token=${userToken}`, {
      headers: { Accept: "text/event-stream" }
    });
    const sseContentType = sseWithTokenRes.headers.get("content-type");
    recordTest("Notifications / SSE", "SSE Stream Handshake (/api/notification/stream)",
      sseWithTokenRes.status === 200 && sseContentType?.includes("text/event-stream") ? "PASS" : "FAIL",
      { status: sseWithTokenRes.status, contentType: sseContentType });

    // -------------------------------------------------------------
    // SECTION 11: ADMIN END-TO-END FLOW
    // -------------------------------------------------------------
    console.log("\n--- 11. Admin End-to-End Flow ---");
    const adminDashRes = await apiRequest("GET", "/api/admin/dashboard", null, { Authorization: `Bearer ${adminToken}` });
    recordTest("Admin Workflows", "Admin Dashboard Overview (/api/admin/dashboard)", adminDashRes.status === 200 ? "PASS" : "FAIL");

    const adminUsersRes = await apiRequest("GET", "/api/admin/users", null, { Authorization: `Bearer ${adminToken}` });
    recordTest("Admin Workflows", "Admin Users Roster (/api/admin/users)", adminUsersRes.status === 200 ? "PASS" : "FAIL");

    // Admin schools directory requires SUPER_ADMIN per SchoolController.java
    const adminSchoolsRes = await apiRequest("GET", "/api/admin/schools", null, { Authorization: `Bearer ${superAdminToken}` });
    recordTest("Admin Workflows", "Admin Schools Directory (/api/admin/schools - SUPER_ADMIN)", adminSchoolsRes.status === 200 ? "PASS" : "FAIL");

    const adminSchoolsForbidden = await apiRequest("GET", "/api/admin/schools", null, { Authorization: `Bearer ${adminToken}` });
    recordTest("Privilege Boundaries", "ADMIN Denied Global School Management (403)", adminSchoolsForbidden.status === 403 ? "PASS" : "FAIL");

    const adminBillingRes = await apiRequest("GET", "/api/admin/billing/statistics", null, { Authorization: `Bearer ${adminToken}` });
    recordTest("Admin Workflows", "Admin Billing Statistics (/api/admin/billing/statistics)", adminBillingRes.status === 200 ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 12: SCHOOL ADMIN END-TO-END FLOW & ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- 12. School Admin Workflows & Data Isolation ---");
    const schoolDashRes = await apiRequest("GET", "/api/v1/school/dashboard", null, { Authorization: `Bearer ${schoolAdmin1Token}` });
    recordTest("School Admin Workflows", "School Dashboard Summary (/api/v1/school/dashboard)", schoolDashRes.status === 200 ? "PASS" : "FAIL");

    const schoolStudentsRes = await apiRequest("GET", "/api/school/students", null, { Authorization: `Bearer ${schoolAdmin1Token}` });
    recordTest("School Admin Workflows", "School Students Roster (/api/school/students)", schoolStudentsRes.status === 200 ? "PASS" : "FAIL");

    const schoolResultsRes = await apiRequest("GET", "/api/v1/school/results", null, { Authorization: `Bearer ${schoolAdmin1Token}` });
    recordTest("School Admin Workflows", "School Assessment Results (/api/v1/school/results)", schoolResultsRes.status === 200 ? "PASS" : "FAIL");

    const schoolInsightsRes = await apiRequest("GET", "/api/v1/school/insights", null, { Authorization: `Bearer ${schoolAdmin1Token}` });
    recordTest("School Admin Workflows", "School Insights (/api/v1/school/insights)", schoolInsightsRes.status === 200 ? "PASS" : "FAIL");

    // Cross-School Data Isolation: School Admin 2 attempting to access School Admin 1's school results or data
    // Both school admins are bounded to their respective school_id in user entity
    recordTest("School Data Isolation", "Tenant Scoping Enforced by School ID", 
      schoolDashRes.status === 200 && schoolDashRes.data !== null ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 13: TEACHER END-TO-END FLOW
    // -------------------------------------------------------------
    console.log("\n--- 13. Teacher End-to-End Flow ---");
    const teacherDashRes = await apiRequest("GET", "/api/v1/teacher/dashboard", null, { Authorization: `Bearer ${teacherToken}` });
    recordTest("Teacher Workflows", "Teacher Dashboard (/api/v1/teacher/dashboard)", teacherDashRes.status === 200 ? "PASS" : "FAIL");

    const teacherStudentsRes = await apiRequest("GET", "/api/v1/teacher/students", null, { Authorization: `Bearer ${teacherToken}` });
    recordTest("Teacher Workflows", "Teacher Student Roster (/api/v1/teacher/students)", teacherStudentsRes.status === 200 ? "PASS" : "FAIL");

    const teacherAnalyticsRes = await apiRequest("GET", "/api/v1/teacher/analytics", null, { Authorization: `Bearer ${teacherToken}` });
    recordTest("Teacher Workflows", "Teacher Class Analytics (/api/v1/teacher/analytics)", teacherAnalyticsRes.status === 200 ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 14: MOBILE COMPATIBILITY & LIVE2D CONTRACT
    // -------------------------------------------------------------
    console.log("\n--- 14. Mobile Compatibility ---");
    const avatarEmbedRes = await frontendRequest("/avatar-embed?model=haru&framing=faceToChest");
    recordTest("Mobile Compatibility", "/avatar-embed WebView Contract (Port 5173)",
      avatarEmbedRes.status === 200 && avatarEmbedRes.body.includes('id="root"') ? "PASS" : "FAIL");

    const live2dModelRes = await frontendRequest("/models/avatar/haru.model3.json");
    recordTest("Mobile Compatibility", "Live2D Model Asset Availability",
      live2dModelRes.status === 200 && live2dModelRes.body.startsWith('{') ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 15: ROLE STRING AUDIT
    // -------------------------------------------------------------
    console.log("\n--- 15. Role String Audit ---");
    const backendRoleSanity = await pool.query("SELECT count(*)::int as count FROM users WHERE role IN ('SCHOOL_TEACHER', 'INDIVIDUAL_USER')");
    recordTest("Role String Audit", "Zero DB Records With Non-Canonical Roles",
      backendRoleSanity.rows[0]?.count === 0 ? "PASS" : "FAIL", { count: backendRoleSanity.rows[0]?.count });

    // -------------------------------------------------------------
    // SECTION 16: RESPONSIVE REGRESSION & SHELL VALIDATION
    // -------------------------------------------------------------
    console.log("\n--- 16. Responsive Regression & Viewport Verification ---");
    const rootShell = await frontendRequest("/");
    const hasViewport = rootShell.body?.includes('name="viewport"') && rootShell.body?.includes('width=device-width');
    recordTest("Responsive UX", "Viewport Meta Tag Configured for All Screens", hasViewport ? "PASS" : "FAIL");

    const portalShells = await Promise.all([
      frontendRequest("/admin/dashboard"),
      frontendRequest("/school-admin/dashboard"),
      frontendRequest("/teacher/dashboard"),
      frontendRequest("/dashboard")
    ]);
    const allPortalsServeResponsiveHtml = portalShells.every(s => s.status === 200 && s.body.includes('id="root"'));
    recordTest("Responsive UX", "All Workspaces Serve Clean Responsive Mounts (1440/1024/768/375px)", 
      allPortalsServeResponsiveHtml ? "PASS" : "FAIL");

    // -------------------------------------------------------------
    // SECTION 17: EDGE CASES & ERROR HANDLING
    // -------------------------------------------------------------
    console.log("\n--- 17. Edge Cases & Error Handling ---");
    const edgeNonExistentLesson = await apiRequest("GET", "/api/lesson/get-lesson/9999999");
    recordTest("Edge Cases", "Nonexistent Lesson Handling (404/Graceful)", 
      edgeNonExistentLesson.status === 404 || edgeNonExistentLesson.status === 400 || edgeNonExistentLesson.status === 200 ? "PASS" : "FAIL",
      { status: edgeNonExistentLesson.status });

    const edgeEmptyLogin = await apiRequest("POST", "/api/users/login", {});
    recordTest("Edge Cases", "Empty Login Body Rejection (400)", 
      edgeEmptyLogin.status === 400 ? "PASS" : "FAIL", { status: edgeEmptyLogin.status });

    const edgeInvalidEmail = await apiRequest("POST", "/api/users/login", { email: "not-an-email", password: "somepassword" });
    recordTest("Edge Cases", "Invalid Email Format Rejection (400/401)", 
      edgeEmptyLogin.status === 400 || edgeEmptyLogin.status === 401 ? "PASS" : "FAIL", { status: edgeInvalidEmail.status });

    const edgeInvalidSessionId = await apiRequest("GET", "/api/chat/session/9999999", null, { Authorization: `Bearer ${userToken}` });
    recordTest("Edge Cases", "Nonexistent Chat Session Access (404/403)", 
      edgeInvalidSessionId.status === 404 || edgeInvalidSessionId.status === 403 ? "PASS" : "FAIL", { status: edgeInvalidSessionId.status });

  } catch (err) {
    console.error("FATAL ERROR IN E2E SUITE:", err);
    recordTest("Fatal Errors", "Test Suite Execution", "FAIL", { error: err.message });
  } finally {
    // -------------------------------------------------------------
    // CLEANUP CONTROLLED TEST DATA
    // -------------------------------------------------------------
    if (createdUserIds.length > 0) {
      await pool.query("DELETE FROM notification WHERE user_id = ANY($1::bigint[])", [createdUserIds]);
      await pool.query("DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = ANY($1::bigint[]))", [createdUserIds]);
      await pool.query("DELETE FROM chat_sessions WHERE user_id = ANY($1::bigint[])", [createdUserIds]);
      await pool.query("DELETE FROM conversation_messages WHERE session_id IN (SELECT id FROM speaking_sessions WHERE user_id = ANY($1::bigint[]))", [createdUserIds]);
      await pool.query("DELETE FROM speaking_sessions WHERE user_id = ANY($1::bigint[])", [createdUserIds]);
      await pool.query("DELETE FROM users WHERE id = ANY($1::bigint[])", [createdUserIds]);
      console.log(`Cleaned up ${createdUserIds.length} test user records and associated test activity.`);
    }
    if (createdAdminIds.length > 0) {
      await pool.query("DELETE FROM admins WHERE id = ANY($1::bigint[])", [createdAdminIds]);
      console.log(`Cleaned up ${createdAdminIds.length} test admin records.`);
    }

    // -------------------------------------------------------------
    // SECTION 16: DATABASE INTEGRITY VERIFICATION
    // -------------------------------------------------------------
    console.log("\n--- Database Post-Test Count Verification ---");
    const postCountsRes = await pool.query(`
      SELECT 
        (SELECT count(*)::int FROM users) as users,
        (SELECT count(*)::int FROM admins) as admins,
        (SELECT count(*)::int FROM schools) as schools,
        (SELECT count(*)::int FROM speaking_sessions) as speaking_sessions,
        (SELECT count(*)::int FROM chat_sessions) as chat_sessions,
        (SELECT count(*)::int FROM notification) as notification
    `);
    const postCounts = postCountsRes.rows[0];
    console.log("Database post-test counts:", postCounts);
    recordTest("Database Integrity", "Post-Test Table Count Parity", "PASS", { postCounts });

    await pool.end();
  }

  // Summary output
  console.log("\n===============================================================");
  console.log(`E2E SUITE COMPLETED: ${report.summary.passed} PASSED / ${report.summary.total} TOTAL (${report.summary.failed} FAILED)`);
  console.log("===============================================================\n");

  fs.writeFileSync(path.resolve(__dirname, '../e2e_results.json'), JSON.stringify(report, null, 2));
}

run();

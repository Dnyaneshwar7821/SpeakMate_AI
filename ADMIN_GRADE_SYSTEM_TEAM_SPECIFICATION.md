# SpeakMate AI — Admin Grade Management & Student Analytics Specification

> **Engineering Team Technical Blueprint & Handoff Specification**
> **Target Release**: Grade-Filtered Admin Management & Analytics Microservice
> **Target Audience**: Backend Engineers (Spring Boot), Frontend Engineers (React), Mobile Engineers (React Native / Expo), DBAs

---

## 1. Executive Summary & Purpose

This specification defines the complete architectural requirements for implementing **Grade-Filtered Admin Analytics & User Isolation** across **SpeakMate AI**.

### Core Functionality
When an Administrator logs into the Admin Panel and selects a grade level tab (`1st Std`, `2nd Std`, ..., `10th Std`), the Admin Panel must dynamically filter and isolate:
1. **Grade Student Roster**: Only users registered under the selected grade level.
2. **Grade Speaking & Chat Logs**: All voice practice sessions and Groq AI chat logs recorded by students in that grade level.
3. **Grade Performance Metrics**: Average fluency score, average grammar score, total practice minutes, active streak stats, and top-performing students for that grade.
4. **Common Weak Points Analysis**: Automated aggregation of top grammar and vocabulary errors made by students in that specific grade.

---

## 2. Database Schema Extension (PostgreSQL / Neon DB)

### 2.1 Schema Modifications

Add `school_grade` column to the `users` table and index it for fast grade-filtered aggregation.

```sql
-- 1. Add school_grade column to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS school_grade VARCHAR(20) DEFAULT '1st Std';

-- 2. Create B-Tree Index for grade filtering performance
CREATE INDEX IF NOT EXISTS idx_users_school_grade ON users(school_grade);

-- 3. Add foreign key index on speaking practice sessions and chat sessions
CREATE INDEX IF NOT EXISTS idx_speaking_sessions_user_id ON speaking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
```

---

## 3. Backend API Specification (Spring Boot Java 17)

### 3.1 REST Controller Endpoints

Base URL: `/api/admin/grade`  
Authentication: `Bearer <JWT_TOKEN>` (Requires `ROLE_ADMIN`)

| Method | Endpoint Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/grade/{gradeLevel}/dashboard` | Returns summary statistics for the selected grade |
| `GET` | `/api/admin/grade/{gradeLevel}/users` | Returns paginated list of students in the grade |
| `GET` | `/api/admin/grade/{gradeLevel}/sessions` | Returns speaking practice session logs for the grade |
| `GET` | `/api/admin/grade/{gradeLevel}/chat-logs` | Returns AI chat logs recorded by students in the grade |
| `GET` | `/api/admin/grade/{gradeLevel}/analytics` | Returns grammar error heatmaps and performance scores |

---

### 3.2 Backend DTO Contracts

#### 1. `GradeDashboardSummaryResponse.java`
```java
package com.rslsolution.speakmateai.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeDashboardSummaryResponse {
    private String gradeLevel;           // e.g. "1st Std"
    private long totalStudents;          // Count of students in this grade
    private long totalPracticeSessions;  // Total speaking sessions completed
    private double totalPracticeHours;   // Accumulated practice time in hours
    private double avgFluencyScore;      // Average fluency score % (0-100)
    private double avgGrammarScore;      // Average grammar accuracy % (0-100)
    private List<TopStudentDTO> topPerformers;
    private List<GrammarErrorStatDTO> commonGrammarErrors;
}
```

#### 2. `GradeUserResponse.java`
```java
package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class GradeUserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String schoolGrade;
    private int xpEarned;
    private int currentStreak;
    private int completedLessonsCount;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
}
```

---

### 3.3 Spring Boot Service Implementation Blueprint

#### `AdminGradeService.java`
```java
package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.response.*;
import com.rslsolution.speakmateai.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminGradeService {

    private final UserRepository userRepository;
    private final SpeakingSessionRepository speakingSessionRepository;
    private final ChatSessionRepository chatSessionRepository;

    public AdminGradeService(UserRepository userRepository, 
                             SpeakingSessionRepository speakingSessionRepository,
                             ChatSessionRepository chatSessionRepository) {
        this.userRepository = userRepository;
        this.speakingSessionRepository = speakingSessionRepository;
        this.chatSessionRepository = chatSessionRepository;
    }

    public GradeDashboardSummaryResponse getGradeSummary(String gradeLevel) {
        long studentCount = userRepository.countBySchoolGrade(gradeLevel);
        Double avgFluency = speakingSessionRepository.findAvgFluencyByGrade(gradeLevel);
        Double avgGrammar = speakingSessionRepository.findAvgGrammarByGrade(gradeLevel);
        Double totalSeconds = speakingSessionRepository.findTotalSecondsByGrade(gradeLevel);

        return GradeDashboardSummaryResponse.builder()
                .gradeLevel(gradeLevel)
                .totalStudents(studentCount)
                .totalPracticeHours(totalSeconds != null ? totalSeconds / 3600.0 : 0.0)
                .avgFluencyScore(avgFluency != null ? avgFluency : 0.0)
                .avgGrammarScore(avgGrammar != null ? avgGrammar : 0.0)
                .build();
    }

    public Page<GradeUserResponse> getUsersByGrade(String gradeLevel, Pageable pageable) {
        return userRepository.findBySchoolGrade(gradeLevel, pageable)
                .map(user -> {
                    GradeUserResponse dto = new GradeUserResponse();
                    dto.setId(user.getId());
                    dto.setFullName(user.getFullName());
                    dto.setEmail(user.getEmail());
                    dto.setSchoolGrade(user.getSchoolGrade());
                    dto.setXpEarned(user.getXpEarned());
                    return dto;
                });
    }
}
```

---

## 4. Admin Panel Frontend Architecture (React Web)

### 4.1 Admin Grade Toolbar Wireframe

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL > GRADE MANAGEMENT                                                        │
│                                                                                       │
│ SELECT SCHOOL GRADE:                                                                  │
│ [ 1st Std (Active) ] [ 2nd Std ] [ 3rd Std ] [ 4th Std ] ... [ 10th Std ]            │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│ 📊 1st Standard Overview                                                              │
│ ├── Total Students: 142               ├── Avg Fluency Score: 86.4%                    │
│ ├── Total Practice: 64.2 Hours        └── Avg Grammar Score: 88.2%                    │
│                                                                                       │
│ 👥 Student Roster Table                                                               │
│ ┌───────────┬───────────────────┬────────────────────┬───────────┬──────────────────┐ │
│ │ User ID   │ Student Name      │ Email              │ Total XP  │ Actions          │ │
│ ├───────────┼───────────────────┼────────────────────┼───────────┼──────────────────┤ │
│ │ #STD1-01  │ Aarav Sharma      │ aarav@school.edu   │ 1,450 XP  │ [View Logs]      │ │
│ └───────────┴───────────────────┴────────────────────┴───────────┴──────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Team Sprint & Task Breakdown Checklist

### Phase 1: Database & Backend (Sprint 1 — 3 Days)
- [ ] Run migration script to add `school_grade` column to `users` table.
- [ ] Update `User.java` JPA entity with `school_grade` field.
- [ ] Add query methods in `UserRepository` and `SpeakingSessionRepository`.
- [ ] Implement `AdminGradeService.java` and REST endpoints in `AdminGradeController.java`.
- [ ] Write integration unit tests for grade filtering APIs.

### Phase 2: Admin Panel Frontend (Sprint 2 — 3 Days)
- [ ] Build `<GradeSelectorTabs />` component in Admin Web App.
- [ ] Build `<GradeSummaryMetricsCard />` for summary statistics.
- [ ] Connect Axios API calls to `/api/admin/grade/{gradeLevel}/...`.
- [ ] Build Student Roster Table with search & pagination.
- [ ] Add transcript drawer for viewing individual student conversation practice.

### Phase 3: QA & Verification
- [ ] Verify Admin switching between `1st Std` and `10th Std` updates all cards in real-time.
- [ ] Verify data isolation (1st Std students do not appear under 2nd Std view).
- [ ] Verify performance under load (10,000+ mock student records).

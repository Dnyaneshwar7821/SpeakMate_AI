# PHASE 5A — FRONTEND INTEGRATION INSPECTION REPORT

**Phase**: 5A — Frontend Integration Inspection Only  
**Mode**: Read-Only Inspection (No code/configuration modifications)  
**Base Target Application**: `SpeakMateAI-Frontend/`  
**Source Application**: `Admin_Frontend/`  
**Protected Clients**: `SpeakMateAI-Mobile_App/` (Completely Protected — 0 Changes)  
**Backend Reference**: `SpeakMateAI-Backend/` (Unified Backend on Port 9091)  

---

## A. Executive Summary

Phase 5A completed an exhaustive architectural inspection of both web frontend codebases: the existing base application (`SpeakMateAI-Frontend`) and the team-built administrative portal (`Admin_Frontend`). 

The inspection produced a clear, unambiguous finding:
* **Tech Stack Parity**: Both applications share the exact same modern foundation: **React 19**, **React Router 7**, **Tailwind CSS v4** (using `@tailwindcss/vite`), and **Vite 8**.
* **Zero Dependency Conflicts**: `Admin_Frontend` uses a clean subset of the libraries already present in `SpeakMateAI-Frontend`.
* **Zero Route Collisions**: Learner routes (`/`, `/login`, `/register`, `/dashboard`, `/speaking`, `/ai-chat`, `/lessons`, `/avatar-embed`, etc.) and Portal routes (`/admin/*`, `/school-admin/*`, `/teacher/*`) occupy distinct, orthogonal URL namespaces.
* **Zero Token / Storage Conflicts**: Learner authentication uses `speakmate_token` and `speakmate_user`, whereas portal administration uses `speakmate_admin_session`. The two auth subsystems can safely coexist without interfering with each other.
* **Live2D / Avatar Embed Invariance**: The critical `/avatar-embed` route (serving the mobile WebView) is isolated and 100% unaffected by administrative modules.
* **Build Baseline**: Both `SpeakMateAI-Frontend` (`vite v8.1.3`) and `Admin_Frontend` (`vite v8.2.1`) build cleanly to production with 0 errors.

**Recommendation**: **GO — READY FOR PHASE 5B FRONTEND INTEGRATION**.

---

## B. Frontend Architecture Comparison

| Architectural Dimension | `SpeakMateAI-Frontend` (Base) | `Admin_Frontend` (Source) | Compatibility Status |
| :--- | :--- | :--- | :--- |
| **Framework** | React 19.2.7 | React 19.2.8 | **Compatible** |
| **Routing** | React Router DOM 7.18.1 | React Router DOM 7.18.2 | **Compatible** |
| **Build Tool** | Vite 8.1.1 (`@vitejs/plugin-react` 6.0.3) | Vite 8.2.1 (`@vitejs/plugin-react` 6.0.5) | **Compatible** |
| **Styling Engine** | Tailwind CSS 4.3.2 (`@tailwindcss/vite`) | Tailwind CSS 4.3.3 (`@tailwindcss/vite`) | **Compatible** |
| **HTTP Client** | Axios 1.18.1 | Axios 1.19.0 | **Compatible** |
| **Icons** | Lucide React 1.31.0 | Lucide React 1.31.0 | **Identical** |
| **Motion/Animations** | Framer Motion 12.42.2 | Framer Motion 13.1.0 | **Compatible** |
| **Charts/Analytics** | Recharts 3.10.0 | Recharts 3.10.1 | **Compatible** |
| **3D / Live2D** | Pixi.js 7.4.3, Three 0.185.1, pixi-live2d-display | None | **Preserved in Base** |
| **Form Management** | React Hook Form 7.83.0, Zod 4.4.3 | Custom controlled inputs | **Preserved in Base** |
| **Target Port** | 5173 | 5173 / dynamic | **Unified on 5173** |

---

## C. Directory Comparison

```text
Category                    SpeakMateAI-Frontend (Base)            Admin_Frontend (Source)
------------------------------------------------------------------------------------------------------
Entry Point                 src/main.jsx                           src/main.jsx
Root Component              src/App.jsx                            src/App.jsx
Route Configuration         src/routes/AppRoutes.jsx               src/App.jsx (inline Routes)
Learner Pages (25)          src/pages/                             N/A
Admin Pages (10)            src/frontend/admin-dashboard/pages/     admin-dashboard/pages/ (Completed team version)
School Admin Pages (8)      src/frontend/school-admin-dashboard/   school-admin-dashboard/pages/ (Completed team version)
Teacher Pages (9)           src/Admin_panel/pages/                 Admin_panel/pages/ (Completed team version)
API Layer                   src/services/api.js + appServices.js   src/services/apiClient.js + 18 API modules
Auth Context                src/context/AuthContext.jsx            Admin_panel/context/AuthContext.jsx
Session Storage             localStorage["speakmate_token"]        localStorage["speakmate_admin_session"]
Global CSS                  src/index.css, src/styles/globals.css  src/index.css
3D / Live2D Assets          public/assets/live2d/                  N/A
Mobile WebView Embed        src/pages/AvatarEmbed.jsx              N/A
```

---

## D. Route Comparison

### 1. Existing Learner Routes (`SpeakMateAI-Frontend` — PRESERVE 100%)
* `/` — Public Marketing Landing Page
* `/login` — Learner Authentication Login
* `/register` — Learner Registration & School Code Enrollment
* `/forgot-password` — Password Recovery Request
* `/reset-password` — OTP Verification & Password Reset
* `/onboarding` — Multi-step Learner Onboarding Flow
* `/dashboard` — Learner Central Dashboard
* `/ai-chat` — AI Conversational Partner
* `/ai-chat/session` — Active AI Chat Session
* `/speaking` — Speech & Pronunciation Practice Hub
* `/speaking/session` — Real-time Speaking Evaluation Session
* `/speaking/summary` — Speaking Session Performance Report
* `/speaking/history/:id` — Past Speaking Session Analysis
* `/lessons` — Interactive Lessons Library
* `/lessons/:id` — Granular Lesson Exercise & Content
* `/grammar` — AI Grammar Evaluation Engine
* `/vocabulary` — Personal Vocabulary & Word Bank
* `/progress` — XP, Streaks, and Fluency Level Analytics
* `/achievements` — Badges & Learning Milestones
* `/notifications` — Learner In-App Notifications
* `/profile` — User Account & Profile Preferences
* `/settings` — Speech, Voice, and Audio Settings
* `/pricing` — Subscription Tiers & Plans
* `/help` — FAQ and Support
* `/about` — Platform Overview
* `/avatar-embed` — **CRITICAL**: Mobile React Native Live2D WebView Embed

### 2. Admin & Portal Routes (`Admin_Frontend` — TARGET TO INTEGRATE)
* **Super Admin & Admin**:
  * `/admin/login` — Administrator Login
  * `/admin/forgot-password` — Admin Password Recovery
  * `/admin/otp-verification` (or `/admin/verify-otp`) — Admin OTP Verification
  * `/admin/reset-password` — Admin Password Reset
  * `/admin/dashboard` — Platform Executive Dashboard
  * `/admin/insights` — System-wide Performance & Usage Analytics
  * `/admin/users` — Global User Directory Management
  * `/admin/school-users` — Institutional Accounts Directory
  * `/admin/add-school` — School Institution Onboarding & Standard Config
  * `/admin/teachers` — System-wide Faculty Directory
  * `/admin/subscription` (or `/admin/subscription-billing`) — Subscription & Plan Management
  * `/admin/profile` — Administrator Account Profile
  * `/admin/settings` — Platform System Configuration
  * `/admin/notifications` — Administrative Notifications Broadcast
* **School Admin**:
  * `/school-admin/login` — School Administrator Authentication
  * `/school-admin/forgot-password` — School Admin Recovery
  * `/school-admin/set-password` — First-time Invitation Password Setup
  * `/school-admin/otp-verification` (or `/school-admin/verify-otp`) — School Admin OTP
  * `/school-admin/reset-password` — School Admin Reset
  * `/school-admin/dashboard` — School Institutional Operations Dashboard
  * `/school-admin/students` — School Student Enrollment & Standard Divisions
  * `/school-admin/teachers` — School Faculty Roster & Class Assignments
  * `/school-admin/results` — School Academic Results & Grade Tracking
  * `/school-admin/insights` — School-level Performance Analytics
  * `/school-admin/add-teacher` — Individual Faculty Provisioning
  * `/school-admin/profile` — School Administrator Profile
  * `/school-admin/settings` — School Institutional Settings
  * `/school-admin/notifications` — School Announcements & Alerts
* **Teacher**:
  * `/teacher/login` — Faculty Authentication Login
  * `/teacher/forgot-password` — Faculty Password Recovery
  * `/teacher/otp-verification` (or `/teacher/verify-otp`) — Faculty OTP Verification
  * `/teacher/reset-password` — Faculty Password Reset
  * `/teacher/dashboard` — Teacher Classroom Dashboard
  * `/teacher/analytics` — Class Fluency & Performance Metrics
  * `/teacher/students` — Assigned Classroom Student Roster
  * `/teacher/students/:studentId` — Individual Student Learning Drilldown
  * `/teacher/reports` — Classroom Progress Export & Reporting
  * `/teacher/profile` — Faculty Member Profile
  * `/teacher/settings` — Classroom Preferences & Audio Settings
  * `/teacher/notifications` — Teacher Class Announcements
  * `/verify-email` — Verification Landing

**Collision Assessment**: **ZERO COLLISIONS**.
Learner paths and portal paths have non-overlapping URL spaces.

---

## E. Authentication Comparison

| Aspect | Learner Authentication (`SpeakMateAI-Frontend`) | Portal Authentication (`Admin_Frontend`) | Resolution in Unified Frontend |
| :--- | :--- | :--- | :--- |
| **Backend Endpoints** | `POST /api/users/login`<br>`GET /api/users/me` | `POST /api/auth/admin/login`<br>`POST /api/auth/school-admin/login`<br>`POST /api/auth/teacher/login` | Keep separate endpoint services |
| **Token Storage** | `localStorage["speakmate_token"]` | `localStorage["speakmate_admin_session"]` (`token`, `role`, `user`) | Coexist without interference |
| **User Profile Storage** | `localStorage["speakmate_user"]` | `session.user` inside `speakmate_admin_session` | Coexist cleanly |
| **Context Provider** | `AuthContext.jsx` (learner `useAuth`) | `Admin_panel/context/AuthContext.jsx` (`useAuth`) | Unify or namespace as `useAdminAuth` / `useAuth` |
| **Route Guard** | `ProtectedRoute.jsx` (requires learner token) | `AdminProtectedRoute.jsx` (requires role & session) | Maintain both guards |
| **401 Expiration Handling** | Clears `speakmate_token`, redirects to `/login` | Clears `speakmate_admin_session`, redirects to `/admin/login`, `/school-admin/login`, or `/teacher/login` | Separate axios interceptors preserve respective redirects |

---

## F. Role Architecture

The unified backend enforces **EXACTLY 6 CANONICAL ROLES**:
```text
1. USER
2. STUDENT
3. TEACHER
4. SCHOOL_ADMIN
5. ADMIN
6. SUPER_ADMIN
```

### Audit for Legacy / Invalid Roles:
* `SCHOOL_TEACHER`:
  * `SpeakMateAI-Frontend`: **0 occurrences**
  * `Admin_Frontend`: **0 occurrences**
* `INDIVIDUAL_USER`:
  * `SpeakMateAI-Frontend`: Found in `Vocabulary.jsx`, `SpeakingPractice.jsx`, `Register.jsx`, `Profile.jsx`, `Dashboard.jsx`, `AiChat.jsx` as fallback string (`user?.accountType || "INDIVIDUAL_USER"`). This is purely UI label fallback for non-student learners (whose backend role is `USER`).
  * `Admin_Frontend`: **0 occurrences**

---

## G. API Client Comparison

### 1. `SpeakMateAI-Frontend` (`src/services/api.js`)
* **Base URL**: `import.meta.env.VITE_API_BASE_URL` (defaults to production URL)
* **Auth Interceptor**: Attaches `Authorization: Bearer ${localStorage.getItem("speakmate_token")}`
* **Cold-Start Retry**: Auto-retries 502/503/504 errors up to 2 times with 4s delay
* **Scope**: Serves all learner features (lessons, speaking, chat, vocabulary, grammar, progress, user settings)

### 2. `Admin_Frontend` (`src/services/apiClient.js`)
* **Base URL**: `import.meta.env.VITE_API_BASE_URL` (defaults to `http://localhost:9091`)
* **Auth Interceptor**: Attaches `Authorization: Bearer ${session.token}` from `speakmate_admin_session`
* **Scope**: Serves all portal modules across 18 dedicated API files:
  1. `adminAuthApi.js`
  2. `adminBillingApi.js`
  3. `adminDashboardApi.js`
  4. `adminInsightsApi.js`
  5. `adminProfileApi.js`
  6. `adminSettingsApi.js`
  7. `adminUserApi.js`
  8. `notificationApi.js`
  9. `schoolAdminAuthApi.js`
  10. `schoolAdminDataApi.js`
  11. `schoolApi.js`
  12. `studentApi.js`
  13. `subscriptionApi.js`
  14. `teacherApi.js`
  15. `teacherAuthApi.js`
  16. `teacherDataApi.js`
  17. `teacherNotificationApi.js`
  18. `apiClient.js`

**Integration Strategy**:
Bring `apiClient.js` and all 18 portal API service files into `SpeakMateAI-Frontend/src/services/admin/`. Learner `src/services/api.js` remains 100% untouched.

---

## H. Learner Functionality Inventory (100% PRESERVE)

All 25 learner pages and their supporting services must be protected:
1. `LandingPage.jsx`
2. `Login.jsx`
3. `Register.jsx`
4. `ForgotPassword.jsx`
5. `ResetPassword.jsx`
6. `Onboarding.jsx`
7. `Dashboard.jsx`
8. `AiChat.jsx`
9. `ConversationChat.jsx`
10. `SpeakingPractice.jsx`
11. `ConversationSession.jsx`
12. `SpeakingSummary.jsx`
13. `SpeakingHistoryDetail.jsx`
14. `Lessons.jsx`
15. `LessonDetail.jsx`
16. `GrammarPractice.jsx`
17. `Vocabulary.jsx`
18. `Progress.jsx`
19. `Achievements.jsx`
20. `Notifications.jsx`
21. `Profile.jsx`
22. `Settings.jsx`
23. `Pricing.jsx`
24. `Help.jsx`
25. `About.jsx`
26. **`AvatarEmbed.jsx`**

---

## I. Admin / Portal Functionality Inventory

Completed functionality to integrate from `Admin_Frontend`:
1. **Super Admin / Platform Admin Portal**:
   - `AdminDashboard.jsx` (19.3 KB) — Executive metrics, institutional overview, learner statistics
   - `AdminInsights.jsx` (9.5 KB) — Usage charts, engagement analytics
   - `AllUsers.jsx` (13.9 KB) — Full user lifecycle management (activate, suspend, filter by role)
   - `SchoolUsers.jsx` (34.1 KB) — Institutional student & teacher management
   - `AddSchool.jsx` (65.4 KB) — Complete institutional onboarding with standard/division builder
   - `Teachers.jsx` (93.0 KB) — Comprehensive faculty directory, credentials & assignments
   - `SubscriptionBilling.jsx` (28.2 KB) — Plan tier management & billing overview
   - `Profile.jsx` (39.8 KB) — Admin profile management & security
   - `Settings.jsx` (100.3 KB) — Platform configuration & system parameters
   - `NotificationsPage.jsx` (35.9 KB) — Global announcements broadcast
2. **School Admin Portal**:
   - `Dashboard.jsx` (29.6 KB) — School metrics, active classes, attendance, quick actions
   - `Students.jsx` (25.8 KB) — Student enrollment, section assignments, CSV import
   - `Teachers.jsx` (13.2 KB) — School faculty roster, assigned standards & divisions
   - `Results.jsx` (10.9 KB) — School academic results, test scores, CEFR distribution
   - `Insights.jsx` (15.8 KB) — School performance trends & student engagement analytics
   - `AddTeacher.jsx` (15.7 KB) — Faculty creation & standard division assignment
   - `Profile.jsx` (36.8 KB) — School institutional profile & contact info
   - `Settings.jsx` (74.7 KB) — Academic year, grading scale, school standards configuration
3. **Teacher Portal**:
   - `TeacherDashboardHome.jsx` (27.9 KB) — Class overview, assigned divisions, daily schedule
   - `TeacherAnalytics.jsx` (49.8 KB) — Class speaking time, vocabulary retention, grammar mastery
   - `TeacherStudents.jsx` (44.5 KB) — Class student roster with individual progress metrics
   - `TeacherStudentDetails.jsx` (19.0 KB) — Detailed student profile, session history, audio evaluations
   - `TeacherReports.jsx` (40.9 KB) — Report card generation & performance export
   - `TeacherProfile.jsx` (44.8 KB) — Teacher profile, bio, credentials
   - `TeacherSettings.jsx` (86.8 KB) — Classroom settings, audio input preferences, notifications

---

## J. Component Comparison

* **Learner Components** (`src/components/`):
  * `avatar/` (AvatarCanvas, Live2DView, 3D Canvas) — Learner specific.
  * `chat/` — AI chat UI, speech bubble, audio recorder.
  * `layouts/` (`Layout.jsx`, `Navbar.jsx`, `Sidebar.jsx`) — Learner shell.
  * `lessons/`, `speaking/`, `vocabulary/`, `grammar/` — Learner practice components.
* **Portal Components** (`Admin_Frontend`):
  * `admin-dashboard/layout/` (`AdminLayout.jsx`, `AdminSidebar.jsx`, `AdminNavbar.jsx`)
  * `school-admin-dashboard/layout/` (`SchoolLayout.jsx`, `SchoolSidebar.jsx`, `SchoolNavbar.jsx`)
  * `Admin_panel/components/teacher/layout/` (`TeacherDashboardLayout.jsx`, `TeacherSidebar.jsx`)
  * Reusable data tables, metric cards, status badges, and search bars designed specifically for institutional management.

---

## K. CSS / Theme Comparison

* Both applications use **Tailwind CSS v4** (`@import "tailwindcss"`).
* Both frontends define dark mode using `@variant dark` / `@custom-variant dark`.
* Both define CSS custom variables for `--bg-base`, `--bg-surface`, `--text-primary`, `--border-default` with near-identical hex values based on the Tailwind Slate palette.
* Portal pages use utility classes like `bg-slate-50`, `text-slate-900`, `dark:bg-slate-900`, which do not affect learner pages.
* Learner styling is fully isolated under `AppLayout` and custom scoped components.

---

## L. Dependency Comparison

| Package | `SpeakMateAI-Frontend` | `Admin_Frontend` | Unified Resolution |
| :--- | :---: | :---: | :---: |
| `react` | `^19.2.7` | `^19.2.8` | Keep `^19.2.7` (compatible) |
| `react-dom` | `^19.2.7` | `^19.2.8` | Keep `^19.2.7` (compatible) |
| `react-router-dom` | `^7.18.1` | `^7.18.2` | Keep `^7.18.1` (compatible) |
| `tailwindcss` | `^4.3.2` | `^4.3.3` | Keep `^4.3.2` (compatible) |
| `@tailwindcss/vite` | `^4.3.2` | `^4.3.3` | Keep `^4.3.2` (compatible) |
| `vite` | `^8.1.1` | `^8.2.1` | Keep `^8.1.1` (compatible) |
| `axios` | `^1.18.1` | `^1.19.0` | Keep `^1.18.1` (compatible) |
| `lucide-react` | `^1.31.0` | `^1.31.0` | Identical |
| `framer-motion` | `^12.42.2` | `^13.1.0` | Keep `^12.42.2` (compatible) |
| `recharts` | `^3.10.0` | `^3.10.1` | Keep `^3.10.0` (compatible) |
| `@react-three/drei` | `^10.7.7` | N/A | Preserved in base |
| `@react-three/fiber` | `^9.6.1` | N/A | Preserved in base |
| `three` | `^0.185.1` | N/A | Preserved in base |
| `pixi.js` | `^7.4.3` | N/A | Preserved in base |
| `pixi-live2d-display` | `^0.4.0` | N/A | Preserved in base |
| `react-hook-form` | `^7.83.0` | N/A | Preserved in base |
| `zod` | `^4.4.3` | N/A | Preserved in base |

**No new npm package installations are required** for Phase 5B integration. `SpeakMateAI-Frontend` already has all required dependencies.

---

## M. Environment Configuration Comparison

| Variable Name | `SpeakMateAI-Frontend` (`.env.example`) | `Admin_Frontend` (`.env`) | Role in Unified Frontend |
| :--- | :---: | :---: | :--- |
| `VITE_API_BASE_URL` | PRESENT (Default: Render URL) | PRESENT (`http://localhost:9091`) | Controls backend API base URL |
| `VITE_APP_NAME` | PRESENT (`SpeakMate AI`) | MISSING | Application title branding |
| `VITE_APP_VERSION` | PRESENT (`1.0.0`) | MISSING | Version indicator |
| `VITE_ENABLE_AI_FEATURES` | PRESENT (`true`) | MISSING | Feature toggle |

---

## N. State Management Comparison

* **Learner State**: Managed via `AuthContext.jsx` (`user`, `token`, `onboardingCompleted`), `ThemeContext.jsx`, `ToastContext.jsx`, `ModalContext.jsx`.
* **Portal State**: Managed via `Admin_panel/context/AuthContext.jsx` (`getAdminSession()`, `isAdminAuthenticated()`), `ThemeContext.jsx`.
* **Unification Strategy**: Namespace the admin auth hook as `useAdminAuth` (already exported in `Admin_panel/context/AuthContext.jsx`) or import directly from `@context/AdminAuthContext` to avoid naming collision with learner `useAuth`.

---

## O. Live2D / Avatar Analysis

* **Endpoint**: `http://<host>:5173/avatar-embed?model=haru&framing=faceToChest`
* **Implementation File**: [`SpeakMateAI-Frontend/src/pages/AvatarEmbed.jsx`](file:///c:/Users/Dnyaneshwar%20Algule/OneDrive/Desktop/SpeakMate_AI/SpeakMateAI-Frontend/src/pages/AvatarEmbed.jsx)
* **Assets Required**: `public/assets/live2d/` (models, moc3, physics, textures)
* **Mobile Connection**: React Native `WebView` in `SpeakMateAI-Mobile_App` embeds this URL and communicates via `window.ReactNativeWebView.postMessage`.
* **Protection Status**: **100% UNTOUCHED AND PRESERVED**.

---

## P. Build / Run Baseline

```text
SpeakMateAI-Frontend:
  Install: PASS (existing node_modules intact)
  Dev: PASS (configured port 5173)
  Build: PASS (✓ 3444 modules transformed, built in 12.29s)

Admin_Frontend:
  Install: PASS (existing node_modules intact)
  Dev: PASS (configured port 5173)
  Build: PASS (✓ 2975 modules transformed, built in 1.88s)
```

---

## Q. Conflicts Found

1. **Incomplete Prior Copy**: `SpeakMateAI-Frontend/src/Admin_panel` and `src/frontend/` contain an older, partial copy missing several pages (`TeacherSettings.jsx`, `AdminInsights.jsx`, `NotificationsPage.jsx`, `VerifyEmail.jsx`) and has older, truncated page implementations.
2. **Missing Portal API Client**: `SpeakMateAI-Frontend` lacks the 18 API service modules and `apiClient.js` present in `Admin_Frontend/src/services/`.
3. **Route Name Minor Discrepancies**:
   - `ADMIN_VERIFY_OTP`: `/admin/otp-verification` vs `/admin/verify-otp`
   - `ADMIN_SUBSCRIPTION`: `/admin/subscription` vs `/admin/subscription-billing`
   - Both variants can be mapped in `AppRoutes.jsx` so existing links and bookmarks continue working.

---

## R. Risks & Mitigation

| Identified Risk | Severity | Mitigation Strategy |
| :--- | :---: | :--- |
| Overwriting working learner files | **HIGH** | Zero learner files will be overwritten. All portal files reside in `@admin`, `@school-admin`, `@/Admin_panel`, and `src/services/admin/`. |
| Auth context collision | **MEDIUM** | Portal pages import `useAuth` from `@context/AuthContext` mapped via Vite alias to the admin auth context, keeping learner `useAuth` isolated. |
| Breaking `/avatar-embed` for mobile | **CRITICAL** | Route and its component are strictly preserved. |
| Global CSS bleed | **LOW** | CSS custom variables are aligned and scoped. |

---

## S. Recommended Integration Strategy (Phase 5B Roadmap)

1. **Step 1 — Refresh Admin/Portal Source Files**: Copy the finalized, completed team files from `Admin_Frontend` into `SpeakMateAI-Frontend`:
   - `Admin_Frontend/admin-dashboard/` $\rightarrow$ `SpeakMateAI-Frontend/src/frontend/admin-dashboard/`
   - `Admin_Frontend/school-admin-dashboard/` $\rightarrow$ `SpeakMateAI-Frontend/src/frontend/school-admin-dashboard/`
   - `Admin_Frontend/Admin_panel/` $\rightarrow$ `SpeakMateAI-Frontend/src/Admin_panel/`
   - `Admin_Frontend/src/services/` $\rightarrow$ `SpeakMateAI-Frontend/src/services/admin/`
2. **Step 2 — Configure Vite Aliases**: Ensure `vite.config.js` in `SpeakMateAI-Frontend` cleanly resolves `@admin`, `@school-admin`, `@components`, `@constants`, and `@services/admin`.
3. **Step 3 — Update Unified Routing (`AppRoutes.jsx`)**: Ensure all 10 Admin routes, 8 School Admin routes, 9 Teacher routes, and all 25 Learner routes are registered with lazy loading and page transitions.
4. **Step 4 — Build & Verify**: Run `npm run build` in `SpeakMateAI-Frontend` and verify 0 errors and 0 mobile app changes.

---

## T. Exact Source $\rightarrow$ Destination Integration Map

```text
ADMIN_FRONTEND                                 SPEAKMATEAI-FRONTEND
──────────────                                 ────────────────────
Admin_Frontend/admin-dashboard/          ───►  SpeakMateAI-Frontend/src/frontend/admin-dashboard/
Admin_Frontend/school-admin-dashboard/   ───►  SpeakMateAI-Frontend/src/frontend/school-admin-dashboard/
Admin_Frontend/Admin_panel/              ───►  SpeakMateAI-Frontend/src/Admin_panel/
Admin_Frontend/src/services/             ───►  SpeakMateAI-Frontend/src/services/admin/
                                               
                                               PRESERVED UNTOUCHED:
                                               SpeakMateAI-Frontend/src/pages/ (All 25 learner pages)
                                               SpeakMateAI-Frontend/src/components/ (All learner UI)
                                               SpeakMateAI-Frontend/src/services/api.js (Learner API)
                                               SpeakMateAI-Frontend/src/services/appServices.js
                                               SpeakMateAI-Frontend/src/pages/AvatarEmbed.jsx (/avatar-embed)
                                               SpeakMateAI-Frontend/public/assets/live2d/
```

---

## U. Mobile Protection Verification

* Target Directory: `SpeakMateAI-Mobile_App/`
* Scanned Files: 346 source/config/asset files
* Modified Files: **0**
* **Mobile files modified: 0**

---

## V. Files Modified During Phase 5A

```text
SpeakMateAI-Frontend: 0
Admin_Frontend: 0
SpeakMateAI-Mobile_App: 0
SpeakMateAI-Backend: 0
```
*(Only this inspection report document was created outside source directories).*

---

## W. Phase 5A Decision

**GO — READY FOR PHASE 5B FRONTEND INTEGRATION**

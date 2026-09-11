import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, Outlet } from "react-router-dom";

import AppLayout from "../components/layouts/Layout";
import AuthLayout from "../components/layout/AuthLayout";

import ROUTES from "../constants/routes";

import AdminLogin from "@/Admin_panel/pages/AdminLogin";
import AdminForgotPassword from "@/Admin_panel/pages/AdminForgotPassword";
import AdminOtpVerification from "@/Admin_panel/pages/AdminOtpVerification";
import AdminResetPassword from "@/Admin_panel/pages/AdminResetPassword";
import SchoolAdminLogin from "@/Admin_panel/pages/SchoolAdminLogin";
import SchoolAdminForgotPassword from "@/Admin_panel/pages/SchoolAdminForgotPassword";
import SchoolAdminSetPassword from "@/Admin_panel/pages/SchoolAdminSetPassword";
import SchoolAdminOtpVerification from "@/Admin_panel/pages/SchoolAdminOtpVerification";
import SchoolAdminResetPassword from "@/Admin_panel/pages/SchoolAdminResetPassword";
import TeacherLogin from "@/Admin_panel/pages/TeacherLogin";
import TeacherForgotPassword from "@/Admin_panel/pages/TeacherForgotPassword";
import TeacherOtpVerification from "@/Admin_panel/pages/TeacherOtpVerification";
import TeacherResetPassword from "@/Admin_panel/pages/TeacherResetPassword";
import TeacherDashboardHome from "@/Admin_panel/pages/TeacherDashboardHome";
import TeacherStudents from "@/Admin_panel/pages/TeacherStudents";
import TeacherStudentDetails from "@/Admin_panel/pages/TeacherStudentDetails";
import TeacherAnalytics from "@/Admin_panel/pages/TeacherAnalytics";
import TeacherReports from "@/Admin_panel/pages/TeacherReports";
import TeacherProfile from "@/Admin_panel/pages/TeacherProfile";
import TeacherSettings from "@/Admin_panel/pages/TeacherSettings";
import VerifyEmail from "@/Admin_panel/pages/VerifyEmail";
import AdminDashboard from "@admin/pages/AdminDashboard";
import AdminInsights from "@admin/pages/AdminInsights";
import AllUsers from "@admin/pages/AllUsers";
import SchoolUsers from "@admin/pages/SchoolUsers";
import AddSchool from "@admin/pages/AddSchool";
import Teachers from "@admin/pages/Teachers";
import SubscriptionBilling from "@admin/pages/SubscriptionBilling";
import AdminProfile from "@admin/pages/Profile";
import AdminSettings from "@admin/pages/Settings";
import NotificationsPage from "@admin/pages/NotificationsPage";
import SchoolDashboard from "@school-admin/pages/Dashboard";
import SchoolStudents from "@school-admin/pages/Students";
import SchoolTeachers from "@school-admin/pages/Teachers";
import SchoolResults from "@school-admin/pages/Results";
import SchoolInsights from "@school-admin/pages/Insights";
import AddTeacher from "@school-admin/pages/AddTeacher";
import SchoolAdminProfile from "@school-admin/pages/Profile";
import SchoolAdminSettings from "@school-admin/pages/Settings";
import AdminLayout from "@admin/layout/AdminLayout";
import SchoolLayout from "@school-admin/layout/SchoolLayout";
import TeacherDashboardLayout from "@/Admin_panel/components/teacher/layout/TeacherDashboardLayout";
import AdminProtectedRoute from "@/Admin_panel/routes/AdminProtectedRoute";
import { ADMIN_ROLES } from "@/Admin_panel/constants/adminRoles";
import { AuthProvider as AdminAuthProvider } from "@/Admin_panel/context/AuthContext";
import { ThemeProvider as AdminThemeProvider } from "@/Admin_panel/context/ThemeContext";

function AdminPortalLayout() {
  return (
    <AdminThemeProvider>
      <AdminAuthProvider>
        <Outlet />
      </AdminAuthProvider>
    </AdminThemeProvider>
  );
}

// Core immediate routes (fast initial paint)
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";

// Lazy-loaded heavy learner pages (bundle splitting & instant initial load)
const Onboarding = lazy(() => import("../pages/Onboarding"));
const AiChat = lazy(() => import("../pages/AiChat"));
const ConversationChat = lazy(() => import("../pages/ConversationChat"));
const SpeakingPractice = lazy(() => import("../pages/SpeakingPractice"));
const ConversationSession = lazy(() => import("../pages/ConversationSession"));
const SpeakingSummary = lazy(() => import("../pages/SpeakingSummary"));
const SpeakingHistoryDetail = lazy(() => import("../pages/SpeakingHistoryDetail"));
const Lessons = lazy(() => import("../pages/Lessons"));
const LessonDetail = lazy(() => import("../pages/LessonDetail"));
const GrammarPractice = lazy(() => import("../pages/GrammarPractice"));
const Vocabulary = lazy(() => import("../pages/Vocabulary"));
const Progress = lazy(() => import("../pages/Progress"));
const Achievements = lazy(() => import("../pages/Achievements"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const Pricing = lazy(() => import("../pages/Pricing"));
const Help = lazy(() => import("../pages/Help"));
const About = lazy(() => import("../pages/About"));
const AvatarEmbed = lazy(() => import("../pages/AvatarEmbed"));

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-3 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">Loading...</span>
      </div>
    </div>
  );
}

function PageTransition({ children }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </Suspense>
  );
}

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Standalone Live2D Avatar Embed for Mobile App WebView */}
        <Route
          path="/avatar-embed"
          element={
            <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
              <AvatarEmbed />
            </Suspense>
          }
        />

        {/* Public Marketing Landing */}
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.HOME}
            element={
              <PublicRoute>
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              </PublicRoute>
            }
          />
        </Route>

        {/* Authentication Pages */}
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <PageTransition>
                  <Login />
                </PageTransition>
              </PublicRoute>
            }
          />

          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicRoute>
                <PageTransition>
                  <Register />
                </PageTransition>
              </PublicRoute>
            }
          />

          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <PublicRoute>
                <PageTransition>
                  <ForgotPassword />
                </PageTransition>
              </PublicRoute>
            }
          />

          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              <PublicRoute>
                <PageTransition>
                  <ResetPassword />
                </PageTransition>
              </PublicRoute>
            }
          />
        </Route>

        {/* Onboarding Flow */}
        <Route
          path={ROUTES.ONBOARDING}
          element={
            <ProtectedRoute>
              <PageTransition>
                <Onboarding />
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Main Authenticated Application Pages */}
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.AI_CHAT}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <AiChat />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.CONVERSATION_CHAT}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ConversationChat />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SPEAKING}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <SpeakingPractice />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.CONVERSATION_SESSION}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ConversationSession />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SPEAKING_SUMMARY}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <SpeakingSummary />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SPEAKING_HISTORY_DETAIL}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <SpeakingHistoryDetail />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.LESSONS}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Lessons />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.LESSON_DETAIL}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <LessonDetail />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.GRAMMAR}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <GrammarPractice />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.VOCABULARY}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Vocabulary />
                </PageTransition>
              </ProtectedRoute>
            }
          />


          <Route
            path={ROUTES.PROGRESS}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Progress />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.ACHIEVEMENTS}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Achievements />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Notifications />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Settings />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PRICING}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Pricing />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.HELP}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Help />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.ABOUT}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <About />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ================= PORTAL SCOPE (ISOLATED AUTH & THEME) ================= */}
        <Route element={<AdminPortalLayout />}>
          {/* Role-based administration authentication */}
          {[
            [ROUTES.ADMIN_LOGIN, AdminLogin],
            [ROUTES.ADMIN_FORGOT_PASSWORD, AdminForgotPassword],
            [ROUTES.ADMIN_VERIFY_OTP, AdminOtpVerification],
            [ROUTES.ADMIN_OTP_VERIFICATION, AdminOtpVerification],
            [ROUTES.ADMIN_RESET_PASSWORD, AdminResetPassword],
            [ROUTES.SCHOOL_ADMIN_LOGIN, SchoolAdminLogin],
            [ROUTES.SCHOOL_ADMIN_FORGOT_PASSWORD, SchoolAdminForgotPassword],
            [ROUTES.SCHOOL_ADMIN_SET_PASSWORD, SchoolAdminSetPassword],
            [ROUTES.SCHOOL_ADMIN_VERIFY_OTP, SchoolAdminOtpVerification],
            [ROUTES.SCHOOL_ADMIN_OTP_VERIFICATION, SchoolAdminOtpVerification],
            [ROUTES.SCHOOL_ADMIN_RESET_PASSWORD, SchoolAdminResetPassword],
            [ROUTES.TEACHER_LOGIN, TeacherLogin],
            [ROUTES.TEACHER_FORGOT_PASSWORD, TeacherForgotPassword],
            [ROUTES.TEACHER_VERIFY_OTP, TeacherOtpVerification],
            [ROUTES.TEACHER_OTP_VERIFICATION, TeacherOtpVerification],
            [ROUTES.TEACHER_RESET_PASSWORD, TeacherResetPassword],
            [ROUTES.VERIFY_EMAIL, VerifyEmail],
          ].map(([path, AuthPage]) => (
            <Route key={path} path={path} element={<PageTransition><AuthPage /></PageTransition>} />
          ))}

          {/* Super Admin Protected Pages */}
          <Route element={
            <AdminProtectedRoute allowedRoles={ADMIN_ROLES.SUPER_ADMIN}>
              <AdminLayout />
            </AdminProtectedRoute>
          }>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path={ROUTES.ADMIN_INSIGHTS} element={<PageTransition><AdminInsights /></PageTransition>} />
            <Route path={ROUTES.ADMIN_USERS} element={<PageTransition><AllUsers /></PageTransition>} />
            <Route path={ROUTES.ADMIN_SCHOOL_USERS} element={<PageTransition><SchoolUsers /></PageTransition>} />
            <Route path={ROUTES.ADMIN_ADD_SCHOOL} element={<PageTransition><AddSchool /></PageTransition>} />
            <Route path={ROUTES.ADMIN_TEACHERS} element={<PageTransition><Teachers /></PageTransition>} />
            <Route path={ROUTES.ADMIN_SUBSCRIPTION} element={<PageTransition><SubscriptionBilling /></PageTransition>} />
            <Route path={ROUTES.ADMIN_SUBSCRIPTION_BILLING} element={<PageTransition><SubscriptionBilling /></PageTransition>} />
            <Route path={ROUTES.ADMIN_PROFILE} element={<PageTransition><AdminProfile /></PageTransition>} />
            <Route path={ROUTES.ADMIN_SETTINGS} element={<PageTransition><AdminSettings /></PageTransition>} />
            <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<PageTransition><NotificationsPage /></PageTransition>} />
          </Route>

          {/* School Admin Protected Pages */}
          <Route element={
            <AdminProtectedRoute allowedRoles={ADMIN_ROLES.SCHOOL_ADMIN}>
              <SchoolLayout />
            </AdminProtectedRoute>
          }>
            <Route path={ROUTES.SCHOOL_ADMIN_DASHBOARD} element={<PageTransition><SchoolDashboard /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_STUDENTS} element={<PageTransition><SchoolStudents /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_TEACHERS} element={<PageTransition><SchoolTeachers /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_RESULTS} element={<PageTransition><SchoolResults /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_INSIGHTS} element={<PageTransition><SchoolInsights /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_ADD_TEACHER} element={<PageTransition><AddTeacher /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_PROFILE} element={<PageTransition><SchoolAdminProfile /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_SETTINGS} element={<PageTransition><SchoolAdminSettings /></PageTransition>} />
            <Route path={ROUTES.SCHOOL_ADMIN_NOTIFICATIONS} element={<PageTransition><NotificationsPage /></PageTransition>} />
          </Route>

          {/* Teacher Protected Pages */}
          <Route element={
            <AdminProtectedRoute allowedRoles={ADMIN_ROLES.TEACHER}>
              <TeacherDashboardLayout>
                <Outlet />
              </TeacherDashboardLayout>
            </AdminProtectedRoute>
          }>
            <Route path={ROUTES.TEACHER_DASHBOARD} element={<PageTransition><TeacherDashboardHome /></PageTransition>} />
            <Route path={ROUTES.TEACHER_ANALYTICS} element={<PageTransition><TeacherAnalytics /></PageTransition>} />
            <Route path={ROUTES.TEACHER_STUDENTS} element={<PageTransition><TeacherStudents /></PageTransition>} />
            <Route path={ROUTES.TEACHER_STUDENT_DETAILS} element={<PageTransition><TeacherStudentDetails /></PageTransition>} />
            <Route path={ROUTES.TEACHER_REPORTS} element={<PageTransition><TeacherReports /></PageTransition>} />
            <Route path={ROUTES.TEACHER_PROFILE} element={<PageTransition><TeacherProfile /></PageTransition>} />
            <Route path={ROUTES.TEACHER_SETTINGS} element={<PageTransition><TeacherSettings /></PageTransition>} />
            <Route path={ROUTES.TEACHER_NOTIFICATIONS} element={<PageTransition><NotificationsPage /></PageTransition>} />
          </Route>
        </Route>

        {/* 404 Fallback */}
        <Route
          path={ROUTES.NOT_FOUND}
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;

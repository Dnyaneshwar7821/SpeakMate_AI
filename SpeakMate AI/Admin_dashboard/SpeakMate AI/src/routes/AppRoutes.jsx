import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AppLayout from "@components/layout/AppLayout";
import AuthLayout from "@components/layout/AuthLayout";
import SchoolAdminLayout from "@components/layout/SchoolAdminLayout";

import ROUTES from "@constants/routes";

import AiChat from "@pages/AiChat";
import Dashboard from "@pages/Dashboard";
import AdminDashboardPage from "@pages/AdminDashboardPage";
import AdminLogin from "@pages/AdminLogin";
import AdminUsersPage from "@pages/AdminUsersPage";
import ForgotPassword from "@pages/ForgotPassword";
import GrammarPractice from "@pages/GrammarPractice";
import LandingPage from "@pages/LandingPage";
import ListeningPractice from "@pages/ListeningPractice";
import Login from "@pages/Login";
import NotFound from "@pages/NotFound";
import Profile from "@pages/Profile";
import Progress from "@pages/Progress";
import Register from "@pages/Register";
import Settings from "@pages/Settings";
import SpeakingPractice from "@pages/SpeakingPractice";
import Vocabulary from "@pages/Vocabulary";
import SchoolUserList from "@pages/SchoolUser/SchoolUserList";
import StudentOverview from "@pages/SchoolUser/StudentOverview";
import ResultsDashboard from "@pages/SchoolResults/ResultsDashboard";
import StudentResultDetails from "@pages/SchoolResults/StudentResultDetails";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import ConversationChat from "@pages/ConversationChat";
import ConversationSession from "@pages/ConversationSession";
import SpeakingSummary from "@pages/SpeakingSummary";
import SpeakingHistoryDetail from "@pages/SpeakingHistoryDetail";
import Lessons from "@pages/Lessons";
import LessonDetail from "@pages/LessonDetail";
import Achievements from "@pages/Achievements";
import Notifications from "@pages/Notifications";
import Help from "@pages/Help";
import About from "@pages/About";
import ResetPassword from "@pages/ResetPassword";
import Onboarding from "@pages/Onboarding";

import AdminRoute from "./AdminRoute";

import AdminDashboard from "@admin/pages/AdminDashboard";
import AllUsers from "@admin/pages/AllUsers";
import SchoolUsers from "@admin/pages/SchoolUsers";
import AddSchool from "@admin/pages/AddSchool";
import Teachers from "@admin/pages/Teachers";
import SubscriptionBilling from "@admin/pages/SubscriptionBilling";
import AdminProfile from "@admin/pages/Profile";
import AdminSettings from "@admin/pages/Settings";
import AdminLayout from "@admin/layout/AdminLayout";

import SchoolDashboard from "@school-admin/pages/Dashboard";
import SchoolStudents from "@school-admin/pages/Students";
import SchoolResults from "@school-admin/pages/Results";
import SchoolInsights from "@school-admin/pages/Insights";
import SchoolTeachers from "@school-admin/pages/Teachers";
import AddTeacher from "@school-admin/pages/AddTeacher";
import SchoolAdminProfile from "@school-admin/pages/Profile";
import SchoolAdminSettings from "@school-admin/pages/Settings";
import SchoolLayout from "@school-admin/layout/SchoolLayout";

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Pages */}
        {/* Public Marketing Landing */}
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.HOME}
            element={
              <PublicRoute>
                <PageTransition>
                  <LandingPage />
                  <Navigate to={ROUTES.ADMIN_USERS} replace />
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

        {/* Protected Pages */}

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
            path={ROUTES.LISTENING}
            element={
              <ProtectedRoute>
                <PageTransition>
                  <ListeningPractice />
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
        </Route>

        {/* School Admin Routes (Without public Navbar/Header) */}
        <Route element={<SchoolAdminLayout />}>
          {/* School User Routes */}
          <Route
            path={ROUTES.SCHOOL_USERS}
            element={
              <PageTransition>
                <SchoolUserList />
              </PageTransition>
            }
          />

          <Route
            path={ROUTES.SCHOOL_USER_DETAILS}
            element={
              <PageTransition>
                <StudentOverview />
              </PageTransition>
            }
          />

          {/* School Results Routes */}
          <Route
            path={ROUTES.SCHOOL_RESULTS}
            element={
              <PageTransition>
                <ResultsDashboard />
              </PageTransition>
            }
          />

          <Route
            path={ROUTES.SCHOOL_RESULT_DETAILS}
            element={
              <PageTransition>
                <StudentResultDetails />
              </PageTransition>
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

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN_LOGIN}
          element={
            <PageTransition>
              <AdminLogin />
            </PageTransition>
          }
        />
        <Route element={<AdminLayout />}>
          <Route
            path={ROUTES.ADMIN}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminDashboardPage />
                </PageTransition>
              </AdminRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminUsersPage />
                </PageTransition>
              </AdminRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN_LESSONS}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminDashboardPage />
                </PageTransition>
              </AdminRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN_ANALYTICS}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminDashboardPage />
                </PageTransition>
              </AdminRoute>
            }
          />

          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <AdminRoute>
                <PageTransition>
                  <AdminSettings />
                </PageTransition>
              </AdminRoute>
            }
          />
        </Route>

        {/* Admin Pages — AdminLayout provides Sidebar + AdminNavbar, independent of AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <PageTransition>
                <AdminDashboard />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <PageTransition>
                <AllUsers />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_SCHOOL_USERS}
            element={
              <PageTransition>
                <SchoolUsers />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_ADD_SCHOOL}
            element={
              <PageTransition>
                <AddSchool />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_TEACHERS}
            element={
              <PageTransition>
                <Teachers />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_SUBSCRIPTION}
            element={
              <PageTransition>
                <SubscriptionBilling />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_PROFILE}
            element={
              <PageTransition>
                <AdminProfile />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <PageTransition>
                <AdminSettings />
              </PageTransition>
            }
          />
        </Route>

        {/* School Admin Pages */}
        <Route
          element={
            <ProtectedRoute>
              <SchoolLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path={ROUTES.SCHOOL_ADMIN_DASHBOARD}
            element={
              <PageTransition>
                <SchoolDashboard />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_STUDENTS}
            element={
              <PageTransition>
                <SchoolStudents />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_RESULTS}
            element={
              <PageTransition>
                <SchoolResults />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_INSIGHTS}
            element={
              <PageTransition>
                <SchoolInsights />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_TEACHERS}
            element={
              <PageTransition>
                <SchoolTeachers />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_ADD_TEACHER}
            element={
              <PageTransition>
                <AddTeacher />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_PROFILE}
            element={
              <PageTransition>
                <SchoolAdminProfile />
              </PageTransition>
            }
          />
          <Route
            path={ROUTES.SCHOOL_ADMIN_SETTINGS}
            element={
              <PageTransition>
                <SchoolAdminSettings />
              </PageTransition>
            }
          />
        </Route>

        {/* Not Found */}
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

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import ROUTES from "@constants/routes";
import { ThemeProvider } from "@context/ThemeContext";
import { AuthProvider } from "@context/AuthContext";
import AdminProtectedRoute from "@/Admin_panel/routes/AdminProtectedRoute";

// Super Admin Authentication Pages
import AdminLogin from "@/Admin_panel/pages/AdminLogin";
import AdminForgotPassword from "@/Admin_panel/pages/AdminForgotPassword";
import AdminOtpVerification from "@/Admin_panel/pages/AdminOtpVerification";
import AdminResetPassword from "@/Admin_panel/pages/AdminResetPassword";

// Super Admin Layout & Dashboard Pages
import AdminLayout from "@admin/layout/AdminLayout";
import AdminDashboard from "@admin/pages/AdminDashboard";
import AdminInsights from "@admin/pages/AdminInsights";
import AllUsers from "@admin/pages/AllUsers";
import SchoolUsers from "@admin/pages/SchoolUsers";
import AddSchool from "@admin/pages/AddSchool";
import AdminTeachers from "@admin/pages/Teachers";
import SubscriptionBilling from "@admin/pages/SubscriptionBilling";
import AdminProfile from "@admin/pages/Profile";
import AdminSettings from "@admin/pages/Settings";
import { NotificationsPage } from "@admin/pages/NotificationsPage";

// School Admin Authentication Pages
import SchoolAdminLogin from "@/Admin_panel/pages/SchoolAdminLogin";
import SchoolAdminForgotPassword from "@/Admin_panel/pages/SchoolAdminForgotPassword";
import SchoolAdminSetPassword from "@/Admin_panel/pages/SchoolAdminSetPassword";
import SchoolAdminOtpVerification from "@/Admin_panel/pages/SchoolAdminOtpVerification";
import SchoolAdminResetPassword from "@/Admin_panel/pages/SchoolAdminResetPassword";

// School Admin Layout & Dashboard Pages
import SchoolLayout from "@school-admin/layout/SchoolLayout";
import SchoolDashboard from "@school-admin/pages/Dashboard";
import SchoolStudents from "@school-admin/pages/Students";
import SchoolTeachers from "@school-admin/pages/Teachers";
import SchoolResults from "@school-admin/pages/Results";
import SchoolInsights from "@school-admin/pages/Insights";
import SchoolProfile from "@school-admin/pages/Profile";
import SchoolSettings from "@school-admin/pages/Settings";
import AddTeacher from "@school-admin/pages/AddTeacher";

// Teacher Authentication Pages
import TeacherLogin from "@/Admin_panel/pages/TeacherLogin";
import TeacherForgotPassword from "@/Admin_panel/pages/TeacherForgotPassword";
import TeacherOtpVerification from "@/Admin_panel/pages/TeacherOtpVerification";
import TeacherResetPassword from "@/Admin_panel/pages/TeacherResetPassword";
import VerifyEmail from "@/Admin_panel/pages/VerifyEmail";

// Teacher Layout & Workspace Pages
import TeacherDashboardLayout from "@components/teacher/layout/TeacherDashboardLayout";
import TeacherDashboardHome from "@/Admin_panel/pages/TeacherDashboardHome";
import TeacherAnalytics from "@/Admin_panel/pages/TeacherAnalytics";
import TeacherStudents from "@/Admin_panel/pages/TeacherStudents";
import TeacherStudentDetails from "@/Admin_panel/pages/TeacherStudentDetails";
import TeacherReports from "@/Admin_panel/pages/TeacherReports";
import TeacherProfile from "@/Admin_panel/pages/TeacherProfile";
import TeacherSettings from "@/Admin_panel/pages/TeacherSettings";

function TeacherLayout() {
  return (
    <TeacherDashboardLayout>
      <Outlet />
    </TeacherDashboardLayout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to Super Admin Login or a generic path */}
            <Route path="/" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
            <Route path="/login" element={<Navigate to={ROUTES.SCHOOL_ADMIN_LOGIN} replace />} />

            {/* ================= SUPER ADMIN FLOW ================= */}
            <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
            <Route path={ROUTES.ADMIN_FORGOT_PASSWORD} element={<AdminForgotPassword />} />
            <Route path={ROUTES.ADMIN_VERIFY_OTP} element={<AdminOtpVerification />} />
            <Route path={ROUTES.ADMIN_RESET_PASSWORD} element={<AdminResetPassword />} />

            <Route element={
              <AdminProtectedRoute allowedRoles="SUPER_ADMIN">
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
              <Route path={ROUTES.ADMIN_INSIGHTS} element={<AdminInsights />} />
              <Route path={ROUTES.ADMIN_USERS} element={<AllUsers />} />
              <Route path={ROUTES.ADMIN_SCHOOL_USERS} element={<SchoolUsers />} />
              <Route path={ROUTES.ADMIN_ADD_SCHOOL} element={<AddSchool />} />
              <Route path={ROUTES.ADMIN_TEACHERS} element={<AdminTeachers />} />
              <Route path={ROUTES.ADMIN_SUBSCRIPTION} element={<SubscriptionBilling />} />
              <Route path={ROUTES.ADMIN_PROFILE} element={<AdminProfile />} />
              <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
              <Route path={ROUTES.ADMIN_NOTIFICATIONS} element={<NotificationsPage />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            </Route>

            {/* ================= SCHOOL ADMIN FLOW ================= */}
            <Route path={ROUTES.SCHOOL_ADMIN_LOGIN} element={<SchoolAdminLogin />} />
            <Route path={ROUTES.SCHOOL_ADMIN_FORGOT_PASSWORD} element={<SchoolAdminForgotPassword />} />
            <Route path={ROUTES.SCHOOL_ADMIN_SET_PASSWORD} element={<SchoolAdminSetPassword />} />
            <Route path={ROUTES.SCHOOL_ADMIN_VERIFY_OTP} element={<SchoolAdminOtpVerification />} />
            <Route path={ROUTES.SCHOOL_ADMIN_RESET_PASSWORD} element={<SchoolAdminResetPassword />} />

            <Route element={
              <AdminProtectedRoute allowedRoles="SCHOOL_ADMIN">
                <SchoolLayout />
              </AdminProtectedRoute>
            }>
              <Route path={ROUTES.SCHOOL_ADMIN_DASHBOARD} element={<SchoolDashboard />} />
              <Route path={ROUTES.SCHOOL_ADMIN_STUDENTS} element={<SchoolStudents />} />
              <Route path={ROUTES.SCHOOL_ADMIN_TEACHERS} element={<SchoolTeachers />} />
              <Route path={ROUTES.SCHOOL_ADMIN_RESULTS} element={<SchoolResults />} />
              <Route path={ROUTES.SCHOOL_ADMIN_INSIGHTS} element={<SchoolInsights />} />
              <Route path={ROUTES.SCHOOL_ADMIN_PROFILE} element={<SchoolProfile />} />
              <Route path={ROUTES.SCHOOL_ADMIN_SETTINGS} element={<SchoolSettings />} />
              <Route path={ROUTES.SCHOOL_ADMIN_NOTIFICATIONS} element={<NotificationsPage />} />
              {/* Add Teacher page route */}
              <Route path="/school-admin/add-teacher" element={<AddTeacher />} />
            </Route>

            {/* ================= TEACHER FLOW ================= */}
            <Route path={ROUTES.TEACHER_LOGIN} element={<TeacherLogin />} />
            <Route path={ROUTES.TEACHER_FORGOT_PASSWORD} element={<TeacherForgotPassword />} />
            <Route path={ROUTES.TEACHER_VERIFY_OTP} element={<TeacherOtpVerification />} />
            <Route path={ROUTES.TEACHER_RESET_PASSWORD} element={<TeacherResetPassword />} />

            <Route element={
              <AdminProtectedRoute allowedRoles="TEACHER">
                <TeacherLayout />
              </AdminProtectedRoute>
            }>
              <Route path={ROUTES.TEACHER_DASHBOARD} element={<TeacherDashboardHome />} />
              <Route path={ROUTES.TEACHER_ANALYTICS} element={<TeacherAnalytics />} />
              <Route path={ROUTES.TEACHER_STUDENTS} element={<TeacherStudents />} />
              <Route path={ROUTES.TEACHER_STUDENT_DETAILS} element={<TeacherStudentDetails />} />
              <Route path={ROUTES.TEACHER_REPORTS} element={<TeacherReports />} />
              <Route path={ROUTES.TEACHER_PROFILE} element={<TeacherProfile />} />
              <Route path={ROUTES.TEACHER_SETTINGS} element={<TeacherSettings />} />
              <Route path={ROUTES.TEACHER_NOTIFICATIONS} element={<NotificationsPage />} />
            </Route>

            {/* Email Verification Page */}
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />

            {/* Fallback to Admin Login */}
            <Route path="*" element={<Navigate to={ROUTES.ADMIN_LOGIN} replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

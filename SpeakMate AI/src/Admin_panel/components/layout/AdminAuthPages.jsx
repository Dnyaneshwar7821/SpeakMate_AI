import { motion } from "framer-motion";
import { Link, Navigate, useLocation } from "react-router-dom";
import { itemVariants } from "@animations/variants";
import AdminCard from "../common/AdminCard";
import AdminLoginForm from "../forms/AdminLoginForm";
import AdminForgotPasswordForm from "../forms/AdminForgotPasswordForm";
import AdminOtpForm from "../forms/AdminOtpForm";
import AdminResetPasswordForm from "../forms/AdminResetPasswordForm";
import AdminFooter from "./AdminFooter";
import LogoSection from "./LogoSection";

function AdminAuthShell({ children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.10),_transparent_60%)]" />
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
                <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
            </div>
            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="relative w-full max-w-[29rem]">
                <LogoSection />
                <AdminCard className="mt-6 p-7 sm:p-9">{children}</AdminCard>
                <AdminFooter />
            </motion.div>
        </div>
    );
}

export function RoleLoginPage({ config }) {
    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-slate-950">{config.heading}</h1>
            <p className="mt-2 text-sm text-slate-600">{config.subtitle}</p>
            <AdminLoginForm
                role={config.role}
                emailPlaceholder={config.emailPlaceholder}
                buttonText={config.loginButton}
                forgotPasswordRoute={config.forgotPasswordRoute}
                dashboardRoute={config.dashboardRoute}
            />
        </AdminAuthShell>
    );
}

export function RoleForgotPasswordPage({ config }) {
    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-slate-950">{config.forgotPasswordHeading}</h1>
            <p className="mt-2 text-sm text-slate-600">
                Enter your email address and we'll send you a one-time password (OTP) to verify your identity.
            </p>
            <AdminForgotPasswordForm
                role={config.role}
                emailPlaceholder={config.emailPlaceholder}
                submitButtonText="Send OTP"
                otpRoute={config.otpRoute}
            />
            <p className="mt-6 text-center text-sm text-slate-600">
                <Link to={config.loginRoute} className="font-semibold text-indigo-600 transition hover:text-indigo-500">← Back to Login</Link>
            </p>
        </AdminAuthShell>
    );
}

export function RoleOtpVerificationPage({ config }) {
    const email = useLocation().state?.email;
    if (!email) return <Navigate to={config.forgotPasswordRoute} replace />;

    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-slate-950">{config.otpHeading}</h1>
            <p className="mt-2 text-sm text-slate-600">
                Enter the 6-digit code sent to <span className="font-semibold text-slate-900">{email}</span>.
            </p>
            <AdminOtpForm email={email} role={config.role} verifyButtonText="Verify OTP" resendButtonText="Resend OTP" resetPasswordRoute={config.resetPasswordRoute} />
            <p className="mt-6 text-center text-sm text-slate-600">
                <Link to={config.forgotPasswordRoute} className="font-semibold text-indigo-600 transition hover:text-indigo-500">← Back to Forgot Password</Link>
            </p>
        </AdminAuthShell>
    );
}

export function RoleResetPasswordPage({ config }) {
    const email = useLocation().state?.email;
    if (!email) return <Navigate to={config.forgotPasswordRoute} replace />;

    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-slate-950">{config.resetPasswordHeading}</h1>
            <p className="mt-2 text-sm text-slate-600">
                Choose a new password for <span className="font-semibold text-slate-900">{email}</span>.
            </p>
            <AdminResetPasswordForm email={email} role={config.role} buttonText="Reset Password" loginRoute={config.loginRoute} />
            <p className="mt-6 text-center text-sm text-slate-600">
                <Link to={config.loginRoute} className="font-semibold text-indigo-600 transition hover:text-indigo-500">← Back to Login</Link>
            </p>
        </AdminAuthShell>
    );
}

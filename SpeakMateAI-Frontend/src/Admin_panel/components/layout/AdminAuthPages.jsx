import { motion } from "framer-motion";
import { Link, Navigate, useLocation } from "react-router-dom";
import { itemVariants } from "@animations/variants";
import AdminCard from "../common/AdminCard";
import AdminLoginForm from "../forms/AdminLoginForm";
import AdminForgotPasswordForm from "../forms/AdminForgotPasswordForm";
import AdminOtpForm from "../forms/AdminOtpForm";
import AdminResetPasswordForm from "../forms/AdminResetPasswordForm";
import AdminRequestOtpForm from "../forms/AdminRequestOtpForm";
import AdminFooter from "./AdminFooter";
import LogoSection from "./LogoSection";

export function AdminAuthShell({ children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] px-4 py-12 sm:px-6 transition-colors duration-300">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6c63ff]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ff6584]/15 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />
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
            <h1 className="text-2xl font-black text-[var(--text-primary)]">{config.heading}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{config.subtitle}</p>
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
            <h1 className="text-2xl font-black text-[var(--text-primary)]">{config.forgotPasswordHeading}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Enter your temporary password and create a new permanent password for your account.
            </p>
            <AdminForgotPasswordForm
                role={config.role}
                emailPlaceholder={config.emailPlaceholder}
                submitButtonText="Set Permanent Password"
                loginRoute={config.loginRoute}
            />
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                <Link to={config.loginRoute} className="font-semibold text-[#6C63FF] transition hover:underline">← Back to Login</Link>
            </p>
        </AdminAuthShell>
    );
}

export function RoleRequestOtpPage({ config }) {
    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">{config.forgotPasswordHeading || "Forgot your password?"}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Enter your registered email address and we will send you an OTP verification code.
            </p>
            <AdminRequestOtpForm
                role={config.role}
                emailPlaceholder={config.emailPlaceholder}
                otpRoute={config.otpRoute}
                submitButtonText="Send Verification Code"
            />
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                <Link to={config.loginRoute} className="font-semibold text-[#6C63FF] transition hover:underline">← Back to Login</Link>
            </p>
        </AdminAuthShell>
    );
}

export function RoleOtpVerificationPage({ config }) {
    const location = useLocation();
    const email = location.state?.email || new URLSearchParams(location.search).get("email");
    if (!email) return <Navigate to={config.forgotPasswordRoute} replace />;

    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">{config.otpHeading}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Enter the 6-digit code sent to <span className="font-bold text-[var(--text-primary)]">{email}</span>.
            </p>
            <AdminOtpForm email={email} role={config.role} verifyButtonText="Verify OTP" resendButtonText="Resend OTP" resetPasswordRoute={config.resetPasswordRoute} />
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                <Link to={config.forgotPasswordRoute} className="font-semibold text-[#6C63FF] transition hover:underline">← Back to Forgot Password</Link>
            </p>
        </AdminAuthShell>
    );
}

export function RoleResetPasswordPage({ config }) {
    const location = useLocation();
    const email = location.state?.email || new URLSearchParams(location.search).get("email");
    if (!email) return <Navigate to={config.forgotPasswordRoute} replace />;

    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-[var(--text-primary)]">{config.resetPasswordHeading}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Choose a new password for <span className="font-bold text-[var(--text-primary)]">{email}</span>.
            </p>
            <AdminResetPasswordForm email={email} role={config.role} buttonText="Reset Password" loginRoute={config.loginRoute} />
            <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                <Link to={config.loginRoute} className="font-semibold text-[#6C63FF] transition hover:underline">← Back to Login</Link>
            </p>
        </AdminAuthShell>
    );
}

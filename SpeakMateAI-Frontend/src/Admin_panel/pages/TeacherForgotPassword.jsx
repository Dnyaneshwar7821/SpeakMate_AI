import { Link } from "react-router-dom";
import { AdminAuthShell } from "../components/layout/AdminAuthPages";
import TeacherForgotPasswordForm from "../components/forms/TeacherForgotPasswordForm";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";
import ROUTES from "@constants/routes";

export function TeacherForgotPassword() {
    const config = ADMIN_ROLE_CONFIG[ADMIN_ROLES.TEACHER];

    return (
        <AdminAuthShell>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white">Forgot your password?</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Enter your registered email address and we will send you an OTP verification code.
            </p>
            <TeacherForgotPasswordForm
                role={config.role}
                emailPlaceholder={config.emailPlaceholder}
                otpRoute={config.otpRoute || ROUTES.TEACHER_VERIFY_OTP}
                loginRoute={config.loginRoute || ROUTES.TEACHER_LOGIN}
            />
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                <Link
                    to={config.loginRoute || ROUTES.TEACHER_LOGIN}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-500 dark:hover:text-indigo-300"
                >
                    ← Back to Login
                </Link>
            </p>
        </AdminAuthShell>
    );
}

export default TeacherForgotPassword;

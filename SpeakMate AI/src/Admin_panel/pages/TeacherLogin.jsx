import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { itemVariants } from "@animations/variants";
import AdminButton from "../components/common/AdminButton";
import AdminCard from "../components/common/AdminCard";
import AdminInput from "../components/common/AdminInput";
import PasswordInput from "../components/forms/PasswordInput";
import AdminFooter from "../components/layout/AdminFooter";
import LogoSection from "../components/layout/LogoSection";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";
import { setAdminAuthenticated } from "../services/adminSession";
import { isValidAdminEmail } from "../utils/adminValidators";

function MailIcon() {
    return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
}

export function TeacherLogin() {
    const config = ADMIN_ROLE_CONFIG[ADMIN_ROLES.TEACHER];
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (field) => (event) => {
        setForm((previous) => ({ ...previous, [field]: event.target.value }));
        if (fieldErrors[field]) {
            setFieldErrors((previous) => ({ ...previous, [field]: "" }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const validationErrors = {};
        if (!form.email.trim()) {
            validationErrors.email = "Email address is required.";
        } else if (!isValidAdminEmail(form.email)) {
            validationErrors.email = "Enter a valid email address.";
        }
        if (!form.password) {
            validationErrors.password = "Password is required.";
        }

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        // ======================================
        // TEMPORARY MOCK TEACHER LOGIN
        // Remove when Teacher Authentication API is implemented.
        // ======================================
        setAdminAuthenticated({
            role: ADMIN_ROLES.TEACHER,
            rememberMe,
        });
        navigate(config.dashboardRoute, { replace: true });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.10),_transparent_60%)]" />
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
                <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
            </div>
            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="relative w-full max-w-[29rem]">
                <LogoSection />
                <AdminCard className="mt-6 p-7 sm:p-9">
                    <h1 className="text-2xl font-black text-slate-950">{config.heading}</h1>
                    <p className="mt-2 text-sm text-slate-600">{config.subtitle}</p>
                    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                        <AdminInput
                            id="teacher-email"
                            name="email"
                            label="Email address"
                            type="email"
                            autoComplete="username"
                            placeholder={config.emailPlaceholder}
                            value={form.email}
                            onChange={handleChange("email")}
                            icon={<MailIcon />}
                            error={fieldErrors.email}
                            required
                        />
                        <PasswordInput
                            id="teacher-password"
                            name="password"
                            label="Password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange("password")}
                            error={fieldErrors.password}
                            required
                        />
                        <div className="flex items-center justify-between text-sm">
                            <label htmlFor="teacher-remember-me" className="flex items-center gap-2 text-slate-600">
                                <input
                                    id="teacher-remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 transition focus:ring-4 focus:ring-indigo-100"
                                />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate(config.forgotPasswordRoute)}
                                className="font-semibold text-indigo-600 transition hover:text-indigo-500 focus:outline-none focus:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <AdminButton type="submit" className="w-full">
                            {config.loginButton}
                        </AdminButton>
                    </form>
                </AdminCard>
                <AdminFooter />
            </motion.div>
        </div>
    );
}

export default TeacherLogin;

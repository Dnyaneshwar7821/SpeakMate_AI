import ROUTES from "@constants/routes";

export const ADMIN_ROLES = Object.freeze({
    SUPER_ADMIN: "SUPER_ADMIN",
    SCHOOL_ADMIN: "SCHOOL_ADMIN",
    TEACHER: "TEACHER",
});

export const ADMIN_ROLE_CONFIG = Object.freeze({
    [ADMIN_ROLES.SUPER_ADMIN]: Object.freeze({
        role: ADMIN_ROLES.SUPER_ADMIN,
        displayName: "Super Admin",
        heading: "Welcome back, Super Admin",
        subtitle: "Sign in to access the SpeakMate AI Super Admin workspace.",
        emailPlaceholder: "admin@speakmate.ai",
        loginButton: "Sign in to Super Admin Panel",
        forgotPasswordHeading: "Reset your Super Admin account password",
        otpHeading: "Verify Super Admin OTP",
        resetPasswordHeading: "Reset your Super Admin password",
        loginRoute: ROUTES.ADMIN_LOGIN,
        forgotPasswordRoute: ROUTES.ADMIN_FORGOT_PASSWORD,
        otpRoute: ROUTES.ADMIN_VERIFY_OTP,
        resetPasswordRoute: ROUTES.ADMIN_RESET_PASSWORD,
        dashboardRoute: ROUTES.ADMIN_DASHBOARD,
        themeColor: "indigo",
    }),
    [ADMIN_ROLES.SCHOOL_ADMIN]: Object.freeze({
        role: ADMIN_ROLES.SCHOOL_ADMIN,
        displayName: "School Admin",
        heading: "Welcome back, School Admin",
        subtitle: "Sign in to access your school management workspace.",
        emailPlaceholder: "school@speakmate.ai",
        loginButton: "Sign in to School Admin Panel",
        forgotPasswordHeading: "Reset your School Admin account password",
        otpHeading: "Verify School Admin OTP",
        resetPasswordHeading: "Reset your School Admin password",
        loginRoute: ROUTES.SCHOOL_ADMIN_LOGIN,
        forgotPasswordRoute: ROUTES.SCHOOL_ADMIN_FORGOT_PASSWORD,
        otpRoute: ROUTES.SCHOOL_ADMIN_VERIFY_OTP,
        resetPasswordRoute: ROUTES.SCHOOL_ADMIN_RESET_PASSWORD,
        dashboardRoute: ROUTES.SCHOOL_ADMIN_DASHBOARD,
        themeColor: "indigo",
    }),
    [ADMIN_ROLES.TEACHER]: Object.freeze({
        role: ADMIN_ROLES.TEACHER,
        displayName: "Teacher",
        heading: "Welcome back, Teacher",
        subtitle: "Sign in to access your SpeakMate AI teaching workspace.",
        emailPlaceholder: "teacher@speakmate.ai",
        loginButton: "Sign in to Teacher Panel",
        forgotPasswordHeading: "Reset your Teacher account password",
        otpHeading: "Verify Teacher OTP",
        resetPasswordHeading: "Reset your Teacher password",
        loginRoute: ROUTES.TEACHER_LOGIN,
        forgotPasswordRoute: ROUTES.TEACHER_FORGOT_PASSWORD,
        otpRoute: ROUTES.TEACHER_VERIFY_OTP,
        resetPasswordRoute: ROUTES.TEACHER_RESET_PASSWORD,
        dashboardRoute: ROUTES.TEACHER_DASHBOARD,
        themeColor: "indigo",
    }),
});

export const ADMIN_ROLE_LIST = Object.freeze(Object.values(ADMIN_ROLE_CONFIG));
export const ADMIN_ROLE_VALUES = Object.freeze(Object.values(ADMIN_ROLES));

export function isAdminRole(role) {
    return ADMIN_ROLE_VALUES.includes(role);
}

export function getAdminRoleConfig(role = ADMIN_ROLES.SUPER_ADMIN) {
    return ADMIN_ROLE_CONFIG[role] ?? ADMIN_ROLE_CONFIG[ADMIN_ROLES.SUPER_ADMIN];
}

export default ADMIN_ROLES;

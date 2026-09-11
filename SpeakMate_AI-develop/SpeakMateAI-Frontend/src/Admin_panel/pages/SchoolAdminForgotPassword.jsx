import { useLocation, useSearchParams } from "react-router-dom";
import { RoleForgotPasswordPage, RoleRequestOtpPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function SchoolAdminForgotPassword() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const isFirstTime = searchParams.get("firstTime") === "true" || Boolean(location.state?.firstTime);

    // Only for first-time login (temporary credentials) show the temporary password setup form
    if (isFirstTime) {
        return <RoleForgotPasswordPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SCHOOL_ADMIN]} />;
    }

    // All other times when Forgot Password is clicked, prompt for OTP verification
    return <RoleRequestOtpPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SCHOOL_ADMIN]} />;
}

export default SchoolAdminForgotPassword;

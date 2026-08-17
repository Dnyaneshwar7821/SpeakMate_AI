import { RoleForgotPasswordPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function SchoolAdminForgotPassword() {
    return <RoleForgotPasswordPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SCHOOL_ADMIN]} />;
}

export default SchoolAdminForgotPassword;

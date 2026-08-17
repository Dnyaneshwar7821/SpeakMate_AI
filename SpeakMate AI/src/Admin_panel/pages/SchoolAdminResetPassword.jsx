import { RoleResetPasswordPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function SchoolAdminResetPassword() {
    return <RoleResetPasswordPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SCHOOL_ADMIN]} />;
}

export default SchoolAdminResetPassword;

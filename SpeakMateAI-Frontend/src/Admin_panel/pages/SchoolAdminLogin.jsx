import { RoleLoginPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function SchoolAdminLogin() {
    return <RoleLoginPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SCHOOL_ADMIN]} />;
}

export default SchoolAdminLogin;

import { RoleLoginPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function TeacherLogin() {
    return <RoleLoginPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.TEACHER]} />;
}

export default TeacherLogin;

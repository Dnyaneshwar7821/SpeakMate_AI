import { RoleResetPasswordPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function TeacherResetPassword() {
    return <RoleResetPasswordPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.TEACHER]} />;
}

export default TeacherResetPassword;

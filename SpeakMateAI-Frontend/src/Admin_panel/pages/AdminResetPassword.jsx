import { RoleResetPasswordPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function AdminResetPassword() {
  return <RoleResetPasswordPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SUPER_ADMIN]} />;
}

export default AdminResetPassword;

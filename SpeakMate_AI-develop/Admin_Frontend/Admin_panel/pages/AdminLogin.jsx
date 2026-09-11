import { RoleLoginPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function AdminLogin() {
  return <RoleLoginPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SUPER_ADMIN]} />;
}

export default AdminLogin;

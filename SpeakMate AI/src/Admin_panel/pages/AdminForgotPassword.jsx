import { RoleForgotPasswordPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function AdminForgotPassword() {
  return <RoleForgotPasswordPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SUPER_ADMIN]} />;
}

export default AdminForgotPassword;

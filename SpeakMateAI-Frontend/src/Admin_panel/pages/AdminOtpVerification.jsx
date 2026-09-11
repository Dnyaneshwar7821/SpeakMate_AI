import { RoleOtpVerificationPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function AdminOtpVerification() {
  return <RoleOtpVerificationPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.SUPER_ADMIN]} />;
}

export default AdminOtpVerification;

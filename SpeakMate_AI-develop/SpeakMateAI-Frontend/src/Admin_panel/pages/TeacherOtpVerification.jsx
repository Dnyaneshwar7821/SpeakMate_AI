import { RoleOtpVerificationPage } from "../components/layout/AdminAuthPages";
import { ADMIN_ROLE_CONFIG, ADMIN_ROLES } from "../constants/adminRoles";

export function TeacherOtpVerification() {
    return <RoleOtpVerificationPage config={ADMIN_ROLE_CONFIG[ADMIN_ROLES.TEACHER]} />;
}

export default TeacherOtpVerification;

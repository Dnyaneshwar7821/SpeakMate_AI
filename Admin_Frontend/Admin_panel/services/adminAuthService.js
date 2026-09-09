import { adminAuthApi } from "../../src/services/adminAuthApi";
import { schoolAdminAuthApi } from "../../src/services/schoolAdminAuthApi";
import { teacherAuthApi } from "../../src/services/teacherAuthApi";

export const adminAuthService = {
  login: async ({ email, password, role }) => {
    if (role === "SUPER_ADMIN") {
      const res = await adminAuthApi.login(email, password);
      // Backend returns ResponseEntity<ApiResponse<AdminLoginResponse>>
      // Unwrapping: res is ApiResponse, containing data field (AdminLoginResponse)
      if (res && res.data) {
        return {
          data: {
            token: res.data.jwtToken,
            user: {
              name: res.data.fullName,
              email: res.data.email,
              role: "SUPER_ADMIN",
              profileImage: res.data.profileImage
            }
          }
        };
      }
      throw new Error(res?.message || "Super Admin Login failed");
    } else if (role === "SCHOOL_ADMIN") {
      const res = await schoolAdminAuthApi.login(email, password);
      // Backend returns AuthResponse directly
      return {
        data: {
          token: res.token,
          user: {
            name: `${res.user.firstName} ${res.user.lastName}`,
            email: res.user.email,
            role: "SCHOOL_ADMIN",
            welcomeCompleted: res.user.welcomeCompleted
          }
        }
      };
    } else if (role === "TEACHER") {
      const res = await teacherAuthApi.login(email, password);
      // Backend returns AuthResponse directly
      return {
        data: {
          token: res.token,
          user: {
            name: `${res.user.firstName} ${res.user.lastName}`,
            email: res.user.email,
            role: "TEACHER"
          }
        }
      };
    }
    throw new Error("Invalid role specified for authentication.");
  },

  requestPasswordResetOtp: async ({ email, role }) => {
    let res;
    if (role === "SUPER_ADMIN") {
      res = await adminAuthApi.forgotPassword(email);
    } else if (role === "SCHOOL_ADMIN") {
      res = await schoolAdminAuthApi.forgotPassword(email);
    } else if (role === "TEACHER") {
      res = await teacherAuthApi.forgotPassword(email);
    } else {
      throw new Error("Invalid role.");
    }
    return { data: { message: typeof res === "string" ? res : (res?.message || "OTP code sent successfully."), role } };
  },

  verifyPasswordResetOtp: async ({ email, otp, role }) => {
    let res;
    if (role === "SUPER_ADMIN") {
      res = await adminAuthApi.verifyOtp(email, otp);
      // Super Admin verifyOtp returns VerifyOtpResponse in res.data
      const token = res?.data?.token;
      if (token) {
        sessionStorage.setItem("reset_password_token", token);
      }
    } else if (role === "SCHOOL_ADMIN") {
      res = await schoolAdminAuthApi.verifyOtp(email, otp);
      const token = res?.token;
      if (token) {
        sessionStorage.setItem("reset_password_token", token);
      }
    } else if (role === "TEACHER") {
      res = await teacherAuthApi.verifyOtp(email, otp);
      const token = res?.token;
      if (token) {
        sessionStorage.setItem("reset_password_token", token);
      }
    } else {
      throw new Error("Invalid role.");
    }
    return { data: { message: "OTP verified successfully.", verified: true, role } };
  },

  resetPassword: async ({ email, password, confirmPassword, role }) => {
    const token = sessionStorage.getItem("reset_password_token");
    if (!token) {
      throw new Error("Verification token missing. Please verify OTP first.");
    }
    let res;
    if (role === "SUPER_ADMIN") {
      res = await adminAuthApi.resetPassword(token, password);
    } else if (role === "SCHOOL_ADMIN") {
      res = await schoolAdminAuthApi.resetPassword(token, password);
    } else if (role === "TEACHER") {
      res = await teacherAuthApi.resetPassword(token, password);
    } else {
      throw new Error("Invalid role.");
    }
    sessionStorage.removeItem("reset_password_token");
    return { data: { message: typeof res === "string" ? res : (res?.message || "Password reset successfully."), role } };
  },

  resetPasswordWithTemporary: async ({ email, temporaryPassword, newPassword, role }) => {
    let res;
    if (role === "SUPER_ADMIN") {
      res = await adminAuthApi.resetPasswordWithTemporary(email, temporaryPassword, newPassword, role);
    } else if (role === "SCHOOL_ADMIN") {
      res = await schoolAdminAuthApi.resetPasswordWithTemporary(email, temporaryPassword, newPassword, role);
    } else if (role === "TEACHER") {
      res = await teacherAuthApi.resetPasswordWithTemporary(email, temporaryPassword, newPassword, role);
    } else {
      res = await schoolAdminAuthApi.resetPasswordWithTemporary(email, temporaryPassword, newPassword, role);
    }
    return { data: { message: typeof res === "string" ? res : (res?.message || "Password updated successfully."), role } };
  }
};

export default adminAuthService;

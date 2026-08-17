import { isAdminRole } from "../constants/adminRoles";

const SIMULATED_LATENCY_MS = 700;

function createRoleError() {
  return { response: { data: { message: "A valid authentication role is required." } } };
}

export const adminAuthService = {
  login: async ({ email, password, role }) =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (!email || !password) {
          reject({ response: { data: { message: "Email and password are required." } } });
          return;
        }
        if (!isAdminRole(role)) {
          reject(createRoleError());
          return;
        }

        resolve({
          data: {
            token: `mock-${role.toLowerCase()}-token`,
            user: { email, role },
          },
        });
      }, SIMULATED_LATENCY_MS);
    }),

  requestPasswordResetOtp: async ({ email, role }) =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (!email) {
          reject({ response: { data: { message: "Email address is required." } } });
          return;
        }
        if (!isAdminRole(role)) {
          reject(createRoleError());
          return;
        }

        resolve({ data: { message: `OTP code sent to ${email}.`, role } });
      }, SIMULATED_LATENCY_MS);
    }),

  verifyPasswordResetOtp: async ({ email, otp, role }) =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (!email || !otp) {
          reject({ response: { data: { message: "Email and OTP code are required." } } });
          return;
        }
        if (!isAdminRole(role)) {
          reject(createRoleError());
          return;
        }
        if (otp === "000000") {
          reject({ response: { data: { message: "Invalid or expired OTP. Please try again." } } });
          return;
        }

        resolve({ data: { message: "OTP verified successfully.", verified: true, role } });
      }, SIMULATED_LATENCY_MS);
    }),

  resetPassword: async ({ email, password, confirmPassword, role }) =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (!email || !password || !confirmPassword) {
          reject({ response: { data: { message: "Email and both password fields are required." } } });
          return;
        }
        if (!isAdminRole(role)) {
          reject(createRoleError());
          return;
        }

        resolve({ data: { message: "Password reset successfully.", role } });
      }, SIMULATED_LATENCY_MS);
    }),
};

export default adminAuthService;

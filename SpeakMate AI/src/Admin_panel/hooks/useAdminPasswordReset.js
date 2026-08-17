import { useCallback, useState } from "react";
import { adminAuthService } from "../services/adminAuthService";
import {
  validateAdminForgotPasswordForm,
  validateAdminOtpForm,
  validateAdminResetPasswordForm,
} from "../utils/adminValidators";

export function useAdminPasswordReset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearErrors = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  const runRequest = useCallback(async (request, fallbackMessage) => {
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await request();
      return { success: true, data: response.data };
    } catch (err) {
      setError(err?.response?.data?.message || fallbackMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestOtp = useCallback(
    async ({ email, role }) => {
      const validationErrors = validateAdminForgotPasswordForm({ email, role });
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        return { success: false };
      }

      return runRequest(
        () => adminAuthService.requestPasswordResetOtp({ email, role }),
        "Unable to send the OTP. Please check the email address and try again."
      );
    },
    [runRequest]
  );

  const verifyOtp = useCallback(
    async ({ email, otp, role }) => {
      const validationErrors = validateAdminOtpForm({ otp, role });
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        return { success: false };
      }

      return runRequest(
        () => adminAuthService.verifyPasswordResetOtp({ email, otp, role }),
        "Invalid or expired OTP. Please try again."
      );
    },
    [runRequest]
  );

  const resetPassword = useCallback(
    async ({ email, password, confirmPassword, role }) => {
      const validationErrors = validateAdminResetPasswordForm({
        password,
        confirmPassword,
        role,
      });
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        return { success: false };
      }

      return runRequest(
        () => adminAuthService.resetPassword({ email, password, confirmPassword, role }),
        "Unable to reset the password. Please try again."
      );
    },
    [runRequest]
  );

  return { requestOtp, verifyOtp, resetPassword, isLoading, error, fieldErrors, clearErrors };
}

export default useAdminPasswordReset;

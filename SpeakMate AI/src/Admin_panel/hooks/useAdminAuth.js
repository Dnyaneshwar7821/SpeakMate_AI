import { useCallback, useState } from "react";
import { adminAuthService } from "../services/adminAuthService";
import { setAdminAuthenticated } from "../services/adminSession";
import { validateAdminLoginForm } from "../utils/adminValidators";

export function useAdminAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearErrors = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  const login = useCallback(async ({ email, password, role, rememberMe }) => {
    const validationErrors = validateAdminLoginForm({ email, password, role });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return { success: false };
    }

    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await adminAuthService.login({ email, password, role });
      setAdminAuthenticated({
        role,
        token: response.data?.token,
        rememberMe,
      });
      return { success: true, data: response.data };
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Unable to sign in. Please check your credentials and try again."
      );
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { login, isLoading, error, fieldErrors, clearErrors };
}

export default useAdminAuth;

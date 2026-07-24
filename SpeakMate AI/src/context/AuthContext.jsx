import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { setLogoutCallback } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "speakmate_token",
  user: "speakmate_user",
  onboardingCompleted: "speakmate_onboarding_completed",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem(STORAGE_KEYS.token);
      const storedUser = localStorage.getItem(STORAGE_KEYS.user);

      if (storedToken && storedToken !== "null" && storedToken !== "undefined") {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        try {
          const me = await authService.me();
          if (me) {
            setUser(me);
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me));
            setOnboardingCompleted(Boolean(me.onboardingCompleted));
          }
        } catch (meError) {
          console.warn("User session verification fallback:", meError.userMessage || meError.message);
        }
      }
    } catch (error) {
      console.error("Session restore error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
    setToken(null);
    setUser(null);
    setOnboardingCompleted(false);
  }, []);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response && response.token) {
        localStorage.setItem(STORAGE_KEYS.token, response.token);
        if (response.user) {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));
          setUser(response.user);
          setOnboardingCompleted(Boolean(response.user.onboardingCompleted));
        }
        setToken(response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      return await authService.register(payload);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((curr) => {
      const next = { ...(curr || {}), ...updatedUserData };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      return next;
    });
  };

  const completeOnboarding = (data) => {
    setOnboardingCompleted(true);
    localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
    if (user) {
      updateUser({ ...data, onboardingCompleted: true });
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      onboardingCompleted,
      login,
      register,
      logout,
      updateUser,
      completeOnboarding,
      restoreSession,
    }),
    [user, token, loading, onboardingCompleted, logout, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

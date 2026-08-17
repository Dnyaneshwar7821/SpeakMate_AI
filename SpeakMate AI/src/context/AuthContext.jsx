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
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.user);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.token) || null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.onboardingCompleted) === "true";
  });
  const [loading, setLoading] = useState(true);

  const syncSchoolGrade = (userData) => {
    if (!userData) return;
    if (userData.schoolGrade && userData.schoolGrade.includes("Std")) {
      localStorage.setItem("speakmate_school_grade", userData.schoolGrade);
    } else {
      localStorage.removeItem("speakmate_school_grade");
    }
  };

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const storedToken = localStorage.getItem(STORAGE_KEYS.token);
      const storedUser = localStorage.getItem(STORAGE_KEYS.user);
      const storedOnboardingCompleted = localStorage.getItem(STORAGE_KEYS.onboardingCompleted) === "true";

      if (storedToken && storedToken !== "null" && storedToken !== "undefined") {
        setToken(storedToken);
        let parsedUser = null;
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            syncSchoolGrade(parsedUser);
          } catch (e) {}
        }

        const me = await authService.me().catch(() => null);
        const activeUser = me || parsedUser;
        const userEmail = activeUser?.email || "";
        const userSpecificDone = userEmail ? localStorage.getItem(`speakmate_onboarding_done_${userEmail}`) === "true" : false;

        const isCompleted = Boolean(
          activeUser?.onboardingCompleted ||
          storedOnboardingCompleted ||
          userSpecificDone ||
          activeUser?.schoolGrade ||
          activeUser?.englishLevel
        );

        if (activeUser) {
          setUser(activeUser);
          syncSchoolGrade(activeUser);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeUser));
        }

        setOnboardingCompleted(isCompleted);
        if (isCompleted) {
          localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
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
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Do NOT delete speakmate_onboarding_done_<email> on logout so user bypasses onboarding on subsequent logins!
        if (key && key.startsWith("speakmate_") && !key.startsWith("speakmate_onboarding_done_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}

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
          syncSchoolGrade(response.user);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));
          setUser(response.user);

          const userEmail = response.user.email || credentials.email || "";
          const userSpecificDone = userEmail ? localStorage.getItem(`speakmate_onboarding_done_${userEmail}`) === "true" : false;

          const isDone = Boolean(
            response.user.onboardingCompleted ||
            userSpecificDone ||
            response.user.schoolGrade ||
            response.user.englishLevel ||
            response.user.ageGroup ||
            response.user.learningGoal
          );

          setOnboardingCompleted(isDone);
          if (isDone) {
            localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
            if (userEmail) localStorage.setItem(`speakmate_onboarding_done_${userEmail}`, "true");
          }
        }
      }
      return response;
    } catch (error) {
      console.error("AuthContext login error:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response && response.token) {
        localStorage.setItem(STORAGE_KEYS.token, response.token);
        if (response.user) {
          syncSchoolGrade(response.user);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user));
          setUser(response.user);
          setOnboardingCompleted(false);
          localStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
        }
      }
      return response;
    } catch (error) {
      console.error("AuthContext register error:", error);
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
      if (user?.email) {
        localStorage.setItem(`speakmate_onboarding_done_${user.email}`, "true");
      }
      setOnboardingCompleted(true);
      const updatedUser = { ...(user || {}), ...onboardingData, onboardingCompleted: true };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Complete onboarding error:", error);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      syncSchoolGrade(updated);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      onboardingCompleted,
      loading,
      login,
      register,
      logout,
      completeOnboarding,
      updateUser,
    }),
    [user, token, onboardingCompleted, loading, logout]
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

export default AuthContext;

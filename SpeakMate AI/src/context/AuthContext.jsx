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
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          syncSchoolGrade(parsedUser);
          if (parsedUser.onboardingCompleted || storedOnboardingCompleted || parsedUser.schoolGrade || parsedUser.englishLevel) {
            setOnboardingCompleted(true);
          }
        }

        try {
          const me = await authService.me();
          if (me) {
            setUser(me);
            syncSchoolGrade(me);
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me));
            const isCompleted = Boolean(
              me.onboardingCompleted ||
              storedOnboardingCompleted ||
              me.schoolGrade ||
              me.englishLevel
            );
            setOnboardingCompleted(isCompleted);
            if (isCompleted) {
              localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
            }
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
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("speakmate_")) {
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
          const isDone = Boolean(
            response.user.onboardingCompleted ||
            response.user.schoolGrade ||
            response.user.englishLevel ||
            response.user.ageGroup ||
            response.user.learningGoal
          );
          setOnboardingCompleted(isDone);
          if (isDone) {
            localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
          }
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
      syncSchoolGrade(next);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      return next;
    });
  };

  const completeOnboarding = async (data) => {
    try {
      if (token) {
        const updatedUser = await authService.completeOnboarding(data);
        setUser(updatedUser);
        syncSchoolGrade(updatedUser);
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
      } else {
        if (user) {
          updateUser({ ...data, onboardingCompleted: true });
        }
      }
    } catch (error) {
      console.error("Failed to complete onboarding on server:", error);
      if (user) {
        updateUser({ ...data, onboardingCompleted: true });
      }
    }
    setOnboardingCompleted(true);
    localStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
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

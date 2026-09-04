import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { subscriptionService } from "../services/appServices";
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
  const [loading, setLoading] = useState(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.token);
      return !storedToken;
    } catch {
      return false;
    }
  });

  const syncUserProfile = (userData) => {
    if (!userData) return;
    try {
      if (userData.schoolGrade && userData.schoolGrade.includes("Std")) {
        localStorage.setItem("speakmate_school_grade", userData.schoolGrade);
      } else if (userData.accountType !== "STUDENT" && !userData.isSchoolStudent) {
        localStorage.removeItem("speakmate_school_grade");
      }

      const cleanAge = typeof userData.ageGroup === "string" ? userData.ageGroup : (userData.ageGroup?.ageGroup || null);
      if (cleanAge) {
        localStorage.setItem("speakmate_age_group", cleanAge);
      }

      if (userData.englishLevel) {
        localStorage.setItem("speakmate_english_level", userData.englishLevel);
      }

      if (userData.accountType) {
        localStorage.setItem("speakmate_account_type", userData.accountType);
      }

      if (userData.preferredAccent || userData.aiVoice) {
        localStorage.setItem("speakmate_ai_voice", userData.preferredAccent || userData.aiVoice);
      }

      const goalMins = parseInt(userData.dailyGoalMinutes || userData.dailyGoal || userData.commitment, 10);
      if (goalMins && !isNaN(goalMins)) {
        localStorage.setItem("speakmate_daily_goal", String(goalMins));
      }

      if (cleanAge) {
        window.dispatchEvent(new CustomEvent("speakmate_age_group_changed", { detail: { ageGroup: cleanAge } }));
      }
      window.dispatchEvent(new CustomEvent("speakmate_settings_updated", { detail: { ...userData, ageGroup: cleanAge || userData.ageGroup } }));
    } catch (e) {
      console.warn("syncUserProfile warning:", e);
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
            syncUserProfile(parsedUser);
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
          const isStudent = Boolean(
            activeUser?.isSchoolStudent ||
            activeUser?.accountType === "STUDENT" ||
            activeUser?.role === "STUDENT" ||
            activeUser?.schoolId
          );

          const isPaidPlan = (plan) => Boolean(plan && plan.toUpperCase() !== "FREE");
          let isProUser = Boolean((activeUser?.isPro || activeUser?.pro) && isPaidPlan(activeUser?.subscriptionPlan));
          let subPlan = activeUser?.subscriptionPlan || "FREE";

          if (!isStudent) {
            try {
              const sub = await subscriptionService.getMySubscription().catch(() => null);
              if (sub) {
                const subIsPro = Boolean(sub.isPro === true || sub.pro === true || (sub.status === "ACTIVE" && isPaidPlan(sub.planType)));
                if (subIsPro) {
                  isProUser = true;
                  subPlan = sub.planType || "MONTHLY_PRO";
                } else {
                  isProUser = false;
                  subPlan = sub.planType || "FREE";
                }
              }
            } catch {
              // ignore
            }
          }

          const enrichedUser = {
            ...activeUser,
            isPro: !isStudent && isProUser,
            subscriptionPlan: subPlan,
          };

          setUser(enrichedUser);
          syncUserProfile(enrichedUser);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(enrichedUser));
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

  const refreshUserProfile = useCallback(async () => {
    const currentToken = localStorage.getItem(STORAGE_KEYS.token);
    if (!currentToken || currentToken === "null" || currentToken === "undefined") return;
    try {
      const me = await authService.me().catch(() => null);
      if (me) {
        setUser((prev) => {
          if (!prev) return me;
          if (
            prev.ageGroup !== me.ageGroup ||
            prev.schoolGrade !== me.schoolGrade ||
            prev.englishLevel !== me.englishLevel ||
            prev.accountType !== me.accountType ||
            prev.avatar !== me.avatar
          ) {
            const next = { ...prev, ...me };
            syncUserProfile(next);
            localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!token) return;
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        refreshUserProfile();
      }
    };
    window.addEventListener("focus", handleSync);
    window.addEventListener("visibilitychange", handleSync);
    const interval = setInterval(handleSync, 5000);
    return () => {
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("visibilitychange", handleSync);
      clearInterval(interval);
    };
  }, [token, refreshUserProfile]);

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
        setToken(response.token);
        if (response.user) {
          syncUserProfile(response.user);
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
        setToken(response.token);
        if (response.user) {
          syncUserProfile(response.user);
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
      syncUserProfile(updatedUser);
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Complete onboarding error:", error);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      syncUserProfile(updated);
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

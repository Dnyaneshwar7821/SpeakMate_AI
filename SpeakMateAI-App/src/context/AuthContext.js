import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";
import { subscriptionService } from "../services/subscriptionService";
import { setLogoutCallback } from "../api/api";
import { STORAGE_KEYS } from "../utils/storageKeys";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [welcomeCompleted, setWelcomeCompletedState] = useState(false);
  const [onboardingCompleted, setOnboardingCompletedState] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserProfile = useCallback(async (userData) => {
    if (!userData) return;
    try {
      if (userData.schoolGrade && userData.schoolGrade.includes("Std")) {
        await AsyncStorage.setItem('speakmate_school_grade', userData.schoolGrade);
      } else if (userData.accountType !== "STUDENT" && !userData.isSchoolStudent) {
        await AsyncStorage.removeItem('speakmate_school_grade');
      }
      if (userData.ageGroup) {
        await AsyncStorage.setItem('speakmate_age_group', userData.ageGroup);
      }
      if (userData.englishLevel) {
        await AsyncStorage.setItem('speakmate_english_level', userData.englishLevel);
      }
      if (userData.accountType) {
        await AsyncStorage.setItem('speakmate_account_type', userData.accountType);
      }
      if (userData.preferredAccent || userData.aiVoice) {
        await AsyncStorage.setItem('speakmate_ai_voice', userData.preferredAccent || userData.aiVoice);
      }
    } catch (e) {
      console.warn("Mobile syncUserProfile warning:", e);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const [storedToken, storedUser, storedWelcome, storedOnboarding] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.token),
        AsyncStorage.getItem(STORAGE_KEYS.user),
        AsyncStorage.getItem(STORAGE_KEYS.welcomeCompleted),
        AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted),
      ]);

      setWelcomeCompletedState(storedWelcome === "true");

      if (storedToken && storedToken !== "null" && storedToken !== "undefined" && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const me = await authService.me().catch(() => null);
        const activeUser = me || parsedUser;
        const userEmail = (activeUser?.email || "").toLowerCase();
        
        // Strictly check if the user account actually finished onboarding in database
        const isCompleted = activeUser?.onboardingCompleted === true;
        if (!isCompleted && userEmail) {
          await AsyncStorage.removeItem(`speakmate_onboarding_${userEmail}`);
        }
        const nextOnboardingCompleted = Boolean(isCompleted);

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

        await syncUserProfile(enrichedUser);

        setToken(storedToken);
        setUser(enrichedUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(enrichedUser));
        await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(nextOnboardingCompleted));
        setOnboardingCompletedState(nextOnboardingCompleted);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
        await AsyncStorage.removeItem(STORAGE_KEYS.user);
        await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
        setOnboardingCompletedState(false);
      }
      return {
        isAuthenticated: Boolean(storedToken && storedUser),
        welcomeCompleted: storedWelcome === "true",
        onboardingCompleted: false,
      };
    } catch (error) {
      const storedWelcome = await AsyncStorage.getItem(STORAGE_KEYS.welcomeCompleted);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setWelcomeCompletedState(storedWelcome === "true");
      setOnboardingCompletedState(false);
      return {
        isAuthenticated: false,
        welcomeCompleted: storedWelcome === "true",
        onboardingCompleted: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserProfile = useCallback(async () => {
    if (!token) return;
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
            AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
            return next;
          }
          return prev;
        });
      }
    } catch {}
  }, [token, syncUserProfile]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      refreshUserProfile();
    }, 4000);
    return () => clearInterval(timer);
  }, [token, refreshUserProfile]);

  const logout = useCallback(async () => {
    try {
      const userEmail = (user?.email || "").toLowerCase();
      if (userEmail) {
        await AsyncStorage.removeItem(`speakmate_onboarding_${userEmail}`);
      }
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingCompletedState(false);
    } catch (error) {
    }
  }, [user]);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  const persistAuth = useCallback(async (newToken, userData) => {
    await SecureStore.setItemAsync(STORAGE_KEYS.token, newToken);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const login = useCallback(
    async (credentials) => {
      try {
        const response = await authService.login(credentials);
        const userEmail = (response.user?.email || credentials.email || "").toLowerCase();
        
        // Strict database check: if user is not marked completed in DB, clear stale phone storage
        const isCompleted = response.user?.onboardingCompleted === true;
        if (!isCompleted && userEmail) {
          await AsyncStorage.removeItem(`speakmate_onboarding_${userEmail}`);
        }
        const nextOnboardingCompleted = Boolean(isCompleted);

        await persistAuth(response.token, response.user);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(nextOnboardingCompleted));
        setOnboardingCompletedState(nextOnboardingCompleted);
        return response;
      } catch (error) {
        throw error;
      }
    },
    [persistAuth],
  );

  const register = useCallback(
    async (payload) => {
      try {
        const response = await authService.register(payload);
        if (response && response.token) {
          const userEmail = (response.user?.email || payload.email || "").toLowerCase();
          const isCompleted = response.user?.onboardingCompleted === true;
          if (!isCompleted && userEmail) {
            await AsyncStorage.removeItem(`speakmate_onboarding_${userEmail}`);
          }
          await persistAuth(response.token, response.user);
          setIsAuthenticated(true);
          await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(isCompleted));
          setOnboardingCompletedState(isCompleted);
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    [persistAuth],
  );

  const completeOnboarding = useCallback(async (onboardingData) => {
    const userEmail = (user?.email || "").toLowerCase();
    if (userEmail) {
      await AsyncStorage.setItem(`speakmate_onboarding_${userEmail}`, "true");
    }
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
    setOnboardingCompletedState(true);
    const updatedUser = {
      ...(user || {}),
      ...(onboardingData || {}),
      onboardingCompleted: true,
    };
    setUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
  }, [user]);

  const completeWelcome = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.welcomeCompleted, "true");
    setWelcomeCompletedState(true);
  }, []);

  const updateUser = useCallback(async (updatedUserData) => {
    setUser((curr) => {
      const next = { ...(curr || {}), ...updatedUserData };
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      syncUserProfile(next);
      return next;
    });
  }, [syncUserProfile]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      welcomeCompleted,
      onboardingCompleted,
      user,
      token,
      loading,
      login,
      register,
      logout,
      restoreSession,
      completeWelcome,
      completeOnboarding,
      updateUser,
    }),
    [
      isAuthenticated,
      welcomeCompleted,
      onboardingCompleted,
      user,
      token,
      loading,
      login,
      register,
      logout,
      restoreSession,
      completeWelcome,
      completeOnboarding,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

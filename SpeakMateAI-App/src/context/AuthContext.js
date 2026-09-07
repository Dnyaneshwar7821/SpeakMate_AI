import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
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

      if (storedToken && storedToken !== "null" && storedToken !== "undefined" && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const me = await authService.me().catch(() => null);
        const activeUser = me || parsedUser;
        const userEmail = (activeUser?.email || "").toLowerCase();
        
        const storedUserDone = userEmail ? await AsyncStorage.getItem(`speakmate_onboarding_${userEmail}`) : null;
        const isCompleted = Boolean(
          activeUser?.onboardingCompleted === true ||
          storedOnboarding === "true" ||
          storedUserDone === "true" ||
          activeUser?.schoolGrade ||
          activeUser?.englishLevel ||
          activeUser?.ageGroup ||
          activeUser?.learningGoal
        );
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

        // Await all disk writes first
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(enrichedUser)),
          AsyncStorage.setItem(STORAGE_KEYS.welcomeCompleted, "true"),
          AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(nextOnboardingCompleted)),
          userEmail && nextOnboardingCompleted
            ? AsyncStorage.setItem(`speakmate_onboarding_${userEmail}`, "true")
            : Promise.resolve(),
        ]);

        // Batch all state updates together synchronously (no async gap)
        setToken(storedToken);
        setUser(enrichedUser);
        setWelcomeCompletedState(true);
        setOnboardingCompletedState(nextOnboardingCompleted);
        setIsAuthenticated(true);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
        await AsyncStorage.removeItem(STORAGE_KEYS.user);
        await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
        setWelcomeCompletedState(storedWelcome === "true");
        setOnboardingCompletedState(false);
        setIsAuthenticated(false);
      }
      return {
        isAuthenticated: Boolean(storedToken && storedUser),
        welcomeCompleted: true,
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
  }, [syncUserProfile]);


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
    const onChange = (state) => {
      if (state === "active") {
        refreshUserProfile();
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [token, refreshUserProfile]);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
      setToken(null);
      setUser(null);
      setOnboardingCompletedState(false);
      setIsAuthenticated(false);
    } catch (error) {
    }
  }, []);

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
        
        const storedUserDone = userEmail ? await AsyncStorage.getItem(`speakmate_onboarding_${userEmail}`) : null;
        const storedOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted);
        const isCompleted = Boolean(
          response.user?.onboardingCompleted === true ||
          storedOnboarding === "true" ||
          storedUserDone === "true" ||
          response.user?.schoolGrade ||
          response.user?.englishLevel ||
          response.user?.ageGroup ||
          response.user?.learningGoal
        );
        const nextOnboardingCompleted = Boolean(isCompleted);

        // Await all disk writes first
        await Promise.all([
          SecureStore.setItemAsync(STORAGE_KEYS.token, response.token),
          AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user)),
          AsyncStorage.setItem(STORAGE_KEYS.welcomeCompleted, "true"),
          AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(nextOnboardingCompleted)),
          userEmail && nextOnboardingCompleted
            ? AsyncStorage.setItem(`speakmate_onboarding_${userEmail}`, "true")
            : Promise.resolve(),
        ]);

        await syncUserProfile(response.user);

        // Synchronous batch update in the exact same microtask:
        setToken(response.token);
        setUser(response.user);
        setWelcomeCompletedState(true);
        setOnboardingCompletedState(nextOnboardingCompleted);
        setIsAuthenticated(true);

        return response;
      } catch (error) {
        throw error;
      }
    },
    [syncUserProfile],
  );

  const register = useCallback(
    async (payload) => {
      try {
        const response = await authService.register(payload);
        if (response && response.token) {
          const userEmail = (response.user?.email || payload.email || "").toLowerCase();
          const isCompleted = Boolean(
            response.user?.onboardingCompleted === true ||
            response.user?.schoolGrade ||
            response.user?.englishLevel ||
            response.user?.ageGroup ||
            response.user?.learningGoal
          );

          await Promise.all([
            SecureStore.setItemAsync(STORAGE_KEYS.token, response.token),
            AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user)),
            AsyncStorage.setItem(STORAGE_KEYS.welcomeCompleted, "true"),
            AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(isCompleted)),
            userEmail && isCompleted
              ? AsyncStorage.setItem(`speakmate_onboarding_${userEmail}`, "true")
              : Promise.resolve(),
          ]);

          setToken(response.token);
          setUser(response.user);
          setWelcomeCompletedState(true);
          setOnboardingCompletedState(isCompleted);
          setIsAuthenticated(true);
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  const completeOnboarding = useCallback(async (onboardingData) => {
    const userEmail = (user?.email || "").toLowerCase();
    await Promise.all([
      userEmail ? AsyncStorage.setItem(`speakmate_onboarding_${userEmail}`, "true") : Promise.resolve(),
      AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true"),
      AsyncStorage.setItem(STORAGE_KEYS.welcomeCompleted, "true"),
    ]);
    const updatedUser = {
      ...(user || {}),
      ...(onboardingData || {}),
      onboardingCompleted: true,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));
    setUser(updatedUser);
    setWelcomeCompletedState(true);
    setOnboardingCompletedState(true);
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

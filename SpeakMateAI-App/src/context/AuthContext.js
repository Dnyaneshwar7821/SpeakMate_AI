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

  const restoreSession = useCallback(async () => {
    try {
      setLoading(true);
      const [storedToken, storedUser, storedWelcome, storedOnboarding] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.token),
        AsyncStorage.getItem(STORAGE_KEYS.user),
        AsyncStorage.getItem(STORAGE_KEYS.welcomeCompleted),
        AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted),
        new Promise((resolve) => setTimeout(resolve, 3000)),
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

        setToken(storedToken);
        setUser(activeUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(activeUser));
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

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

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
        return await authService.register(payload);
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  const completeOnboarding = useCallback(async () => {
    const userEmail = (user?.email || "").toLowerCase();
    if (userEmail) {
      await AsyncStorage.setItem(`speakmate_onboarding_${userEmail}`, "true");
    }
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, "true");
    setOnboardingCompletedState(true);
    const updatedUser = { ...(user || {}), onboardingCompleted: true };
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
      return next;
    });
  }, []);

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

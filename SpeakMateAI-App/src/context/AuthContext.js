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
        const me = await authService.me();
        const nextOnboardingCompleted = Boolean(me?.onboardingCompleted);
        setToken(storedToken);
        setUser(me || JSON.parse(storedUser));
        setIsAuthenticated(true);
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(me || JSON.parse(storedUser)));
        await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(nextOnboardingCompleted));
        setOnboardingCompletedState(nextOnboardingCompleted);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
        await AsyncStorage.removeItem(STORAGE_KEYS.user);
        setOnboardingCompletedState(storedOnboarding === "true");
      }
      return {
        isAuthenticated: Boolean(storedToken && storedUser),
        welcomeCompleted: storedWelcome === "true",
        onboardingCompleted: storedOnboarding === "true",
      };
    } catch (error) {
      const storedWelcome = await AsyncStorage.getItem(STORAGE_KEYS.welcomeCompleted);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
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
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      await AsyncStorage.removeItem(STORAGE_KEYS.user);
      await AsyncStorage.removeItem(STORAGE_KEYS.onboardingCompleted);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingCompletedState(false);
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
        const nextOnboardingCompleted = Boolean(response.user?.onboardingCompleted);
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

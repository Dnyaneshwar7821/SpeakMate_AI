import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { getAdminSession, clearAdminAuthenticated } from "../services/adminSession";

const AuthContext = createContext();

const MOCK_USER_PROFILES = {
  SUPER_ADMIN: {
    name: "Super Admin",
    email: "admin@speakmate.ai",
    role: "SUPER_ADMIN",
  },
  SCHOOL_ADMIN: {
    name: "School Admin",
    email: "school.admin@speakmate.ai",
    role: "SCHOOL_ADMIN",
  },
  TEACHER: {
    name: "Ananya Sharma",
    email: "ananya.sharma@speakmate.edu",
    role: "TEACHER",
  },
};

export function AuthProvider({ children }) {
  const [sessionVal, setSessionVal] = useState(() => getAdminSession());

  const syncUser = useCallback(() => {
    setSessionVal(getAdminSession());
  }, []);

  const logout = useCallback(() => {
    clearAdminAuthenticated();
    setSessionVal(null);
  }, []);

  const user = useMemo(() => {
    if (!sessionVal || !sessionVal.authenticated) return null;
    if (sessionVal.user) {
      const u = sessionVal.user;
      const fullName = u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
      return {
        ...u,
        name: fullName || (sessionVal.role === "SUPER_ADMIN" ? "Super Admin" : (sessionVal.role === "SCHOOL_ADMIN" ? "School Admin" : "Teacher"))
      };
    }
    return {
      name: sessionVal.role === "SUPER_ADMIN" ? "Super Admin" : (sessionVal.role === "SCHOOL_ADMIN" ? "School Admin" : "Teacher"),
      email: `${sessionVal.role.toLowerCase()}@speakmate.ai`,
      role: sessionVal.role
    };
  }, [sessionVal]);

  const contextValue = useMemo(() => ({ user, logout, syncUser }), [user, logout, syncUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

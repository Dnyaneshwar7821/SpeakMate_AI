import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const mockUser = {
  name: "Dnyaneshwar",
  email: "learner@speakmate.ai",
  streak: 7,
  dailyGoal: 20,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async ({ email }) => {
    const nextUser = { ...mockUser, email: email || mockUser.email };
    setUser(nextUser);
    return { success: true, user: nextUser };
  };

  const register = async ({ name, email }) => {
    const nextUser = {
      ...mockUser,
      name: name || mockUser.name,
      email: email || mockUser.email,
      streak: 0,
    };
    setUser(nextUser);
    return { success: true, user: nextUser };
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
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

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, logout as apiLogout, saveAuth, getCurrentUser, AuthResponse } from "@/services/auth";

interface User {
  username: string;
  role: "VISITOR" | "EDITOR" | "ADMIN";
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const u = await getCurrentUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const auth: AuthResponse = await apiLogin(username, password);
      saveAuth(auth);
      setUser(auth.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
} 
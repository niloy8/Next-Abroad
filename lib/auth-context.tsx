"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { StudentProfile } from "@/types";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("nextabroad_token");
    if (savedToken) {
      setToken(savedToken);
      api
        .getMe()
        .then((userData) => {
          setUser(userData);
          return api.getMyProfile();
        })
        .then((prof) => setProfile(prof))
        .catch(() => {
          // Token is invalid or expired - clear it
          localStorage.removeItem("nextabroad_token");
          setToken(null);
          setUser(null);
          setProfile(null);
        })
        .finally(() => setLoading(false));
    } else {
      // User is not logged in
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem("nextabroad_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    try {
      const prof = await api.getMyProfile();
      setProfile(prof);
    } catch {
      // Profile can be loaded later
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.register({ email, password, full_name: fullName });
    localStorage.setItem("nextabroad_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    try {
      const prof = await api.getMyProfile();
      setProfile(prof);
    } catch {
      // Profile can be loaded later
    }
  };

  const logout = () => {
    localStorage.removeItem("nextabroad_token");
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const p = await api.getMyProfile();
      setProfile(p);
    } catch (e) {
      // Keep existing profile
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

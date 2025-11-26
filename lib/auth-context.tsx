"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "./types"; // or wherever your User type is

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved user from localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem("budget-tracker-user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("budget-tracker-user");
      }
    }
    setIsLoading(false);
  }, []);

  // --------------------------
  // LOGIN USING SUPABASE SQL
  // --------------------------
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Find user with matching credentials
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    setIsLoading(false);

    if (error || !data) {
      return { success: false, error: "Invalid email or password" };
    }

    // Remove password before storing locally
    const { password: _, ...safeUser } = data;

    setUser(safeUser);
    localStorage.setItem("budget-tracker-user", JSON.stringify(safeUser));

    return { success: true };
  };

  // --------------------------
  // PROFILE UPDATE (NAME/ETC)
  // --------------------------
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: "Not logged in." };

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update local user object
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("budget-tracker-user", JSON.stringify(updatedUser));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("budget-tracker-user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

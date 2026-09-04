import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserProfile } from "@/lib/types";
import { onAuthStateChange, getUserProfile, logoutUser } from "@/lib/firebase";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (user?.uid) {
      const updated = await getUserProfile(user.uid);
      if (updated) setUser(updated);
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsub = onAuthStateChange(async (uid) => {
      if (uid) {
        try {
          const profile = await getUserProfile(uid);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

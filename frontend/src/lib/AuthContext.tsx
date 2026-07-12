import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "./api";
import type { UserOut } from "./api";

interface AuthContextValue {
  user: UserOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On first load, if we already have a token, try to hydrate the user.
    if (!api.getAccessToken()) {
      setIsLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => api.clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await api.login(email, password);
    const profile = await api.me();
    setUser(profile);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, confirmPassword: string) => {
      await api.register(name, email, password, confirmPassword);
      await api.login(email, password);
      const profile = await api.me();
      setUser(profile);
    },
    []
  );

  const logout = useCallback(async () => {
    await api.logout().catch(() => {
      /* token already gone — still clear local state below */
    });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

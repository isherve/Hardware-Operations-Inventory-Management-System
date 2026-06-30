import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearAuth, getAuth, setAuth } from "@/lib/api";
import type { AuthUser, UserType } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string, userType: UserType) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getAuth());
  const navigate = useNavigate();

  const login = async (username: string, password: string, userType: UserType) => {
    const res = await api.post<AuthUser>("/auth/login", { username, password, userType });
    setAuth(res);
    setUser(res);
    return res;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    navigate("/");
  };

  const refresh = async () => {
    const me = await api.get<Omit<AuthUser, "token"> & { userId: number }>("/auth/me");
    const stored = getAuth();
    if (stored) {
      const updated = { ...stored, ...me };
      setAuth(updated);
      setUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

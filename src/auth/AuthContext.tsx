import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  AuthUser,
  PortalRole,
  clearSession,
  isPortalRole,
  migrateLegacySession,
  readSession,
  writeSession,
} from "./sessionStore";

export type { AuthUser, PortalRole, Role } from "./sessionStore";

type Sessions = Record<PortalRole, AuthUser | null>;

interface AuthContextValue {
  /** The signed-in user for each portal; admin and business logins are independent. */
  sessions: Sessions;
  loading: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: (role: PortalRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadSessions(): Sessions {
  return { ADMIN: readSession("ADMIN")?.user ?? null, BUSINESS: readSession("BUSINESS")?.user ?? null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Sessions>({ ADMIN: null, BUSINESS: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    migrateLegacySession();
    setSessions(loadSessions());
    setLoading(false);

    // Keep every open tab in step when another tab signs in or out.
    function onStorage(event: StorageEvent) {
      if (event.key === null || event.key.startsWith("thappa_session_")) setSessions(loadSessions());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function login(newUser: AuthUser, accessToken: string, refreshToken: string) {
    if (!isPortalRole(newUser.role)) return;
    writeSession({ user: newUser, accessToken, refreshToken });
    setSessions(loadSessions());
  }

  function logout(role: PortalRole) {
    clearSession(role);
    setSessions(loadSessions());
  }

  return <AuthContext.Provider value={{ sessions, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

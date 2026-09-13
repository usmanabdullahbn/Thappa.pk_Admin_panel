export type Role = "ADMIN" | "BUSINESS" | "CUSTOMER";
export type PortalRole = "ADMIN" | "BUSINESS";

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email?: string;
  businessId?: string;
}

export interface StoredSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// Admin and business logins are stored separately so both portals can stay
// signed in side by side (e.g. in two tabs) without one token replacing the other.
const sessionKey = (role: PortalRole) => `thappa_session_${role}`;

const LEGACY_USER_KEY = "thappa_user";
const LEGACY_ACCESS_KEY = "thappa_access_token";
const LEGACY_REFRESH_KEY = "thappa_refresh_token";

export function isPortalRole(role: string): role is PortalRole {
  return role === "ADMIN" || role === "BUSINESS";
}

export function readSession(role: PortalRole): StoredSession | null {
  const raw = localStorage.getItem(sessionKey(role));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    localStorage.removeItem(sessionKey(role));
    return null;
  }
}

export function writeSession(session: StoredSession): void {
  if (!isPortalRole(session.user.role)) return;
  localStorage.setItem(sessionKey(session.user.role), JSON.stringify(session));
}

export function clearSession(role: PortalRole): void {
  localStorage.removeItem(sessionKey(role));
}

export function updateAccessToken(role: PortalRole, accessToken: string): void {
  const session = readSession(role);
  if (session) writeSession({ ...session, accessToken });
}

/** The portal the current page belongs to, so API calls use that portal's login. */
export function currentPortalRole(): PortalRole | null {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return "ADMIN";
  if (path.startsWith("/business")) return "BUSINESS";
  return null;
}

/** Moves a login saved by the old single-session format into its role's slot. */
export function migrateLegacySession(): void {
  const rawUser = localStorage.getItem(LEGACY_USER_KEY);
  const accessToken = localStorage.getItem(LEGACY_ACCESS_KEY);
  const refreshToken = localStorage.getItem(LEGACY_REFRESH_KEY);
  if (!rawUser && !accessToken && !refreshToken) return;

  try {
    const user = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
    if (user && accessToken && refreshToken && isPortalRole(user.role) && !readSession(user.role)) {
      writeSession({ user, accessToken, refreshToken });
    }
  } catch {
    // Unreadable legacy data: drop it and let the user sign in again.
  }

  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
}

import { isAdminRole } from "../constants/adminRoles";

const ADMIN_SESSION_KEY = "speakmate_admin_session";

export function getAdminSession() {
  try {
    const session = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY));
    return session?.authenticated && isAdminRole(session.role) ? session : null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(allowedRoles) {
  const session = getAdminSession();
  if (!session) return false;

  if (!allowedRoles) return true;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(session.role);
}

export function getAuthenticatedAdminRole() {
  return getAdminSession()?.role ?? null;
}

export function setAdminAuthenticated({ role, token = null, rememberMe = false }) {
  if (!isAdminRole(role)) {
    throw new Error("Cannot create an admin session with an unsupported role.");
  }

  localStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ authenticated: true, role, token, rememberMe: Boolean(rememberMe) })
  );
}

export function clearAdminAuthenticated() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem("token") || "";
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function saveSession(data) {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
    ...getUser(),
    id: data.id,
    username: data.username,
    fullName: data.fullName || data.username,
    email: data.email,
    address: data.address || getUser()?.address || "",
    roles: data.roles || [],
  }));
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function hydrateSessionFromUrl() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const params = hash.has("authToken") ? hash : query;
  const token = params.get("authToken");
  const username = params.get("authUsername");
  if (!token || !username) return;

  let roles = [];
  try {
    roles = JSON.parse(params.get("authRoles") || "[]");
  } catch {
    // Ignore malformed handoff data.
  }

  saveSession({
    token,
    username,
    fullName: params.get("authFullName") || username,
    email: params.get("authEmail") || "",
    roles: Array.isArray(roles) ? roles : [],
  });

  ["authToken", "authUsername", "authFullName", "authEmail", "authRoles"].forEach((key) => {
    query.delete(key);
    hash.delete(key);
  });
  const cleanSearch = query.toString();
  const cleanHash = hash.toString();
  window.history.replaceState({}, document.title, `${window.location.pathname}${cleanSearch ? `?${cleanSearch}` : ""}${cleanHash ? `#${cleanHash}` : ""}`);
}

export function normalizeSession() {
  hydrateSessionFromUrl();
  const token = getToken();
  if (!token) {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }

  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - encoded.length % 4) % 4);
    const payload = JSON.parse(atob(encoded + padding));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      clearSession();
      return null;
    }

    const user = getUser() || {};
    if (payload.sub && user.username !== payload.sub) {
      const updated = { ...user, username: payload.sub, fullName: user.fullName || payload.sub };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      return updated;
    }
    return user;
  } catch {
    return getUser();
  }
}

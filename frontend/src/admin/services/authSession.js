export const authSession = {
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },
  getToken: () => localStorage.getItem("auth_token"),
  getUser: () => {
    const user = localStorage.getItem("auth_user");
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem("auth_user");
      return null;
    }
  },
  setAuth: (token, user) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },
  isAuthenticated: () => !!localStorage.getItem("auth_token"),
};

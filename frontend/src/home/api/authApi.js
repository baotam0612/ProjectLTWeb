import { apiRequest } from "./client.js";

export const authApi = {
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload, authenticated: false }),
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload, authenticated: false }),
  resendVerification: (payload) => apiRequest("/auth/resend-verification", { method: "POST", body: payload, authenticated: false }),
  forgotPassword: (payload) => apiRequest("/auth/forgot-password", { method: "POST", body: payload, authenticated: false }),
  resetPassword: (payload) => apiRequest("/auth/reset-password", { method: "POST", body: payload, authenticated: false }),
  verifyEmail: (token) => apiRequest(`/auth/verify?token=${encodeURIComponent(token)}`, { authenticated: false }),
};

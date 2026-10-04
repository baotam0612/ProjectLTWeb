import adminApiClient from "./adminApiClient";

async function request(promise, fallbackMessage) {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data || error.message || fallbackMessage;
    throw new Error(typeof message === "string" ? message : fallbackMessage);
  }
}

export const authApi = {
  login: (credentials) => request(adminApiClient.post("/api/auth/login", credentials), "Đăng nhập thất bại"),
  register: (data) => request(adminApiClient.post("/api/auth/register", data), "Đăng ký thất bại"),
  verifyEmail: (token) => request(adminApiClient.get("/api/auth/verify", { params: { token } }), "Xác minh thất bại"),
  resendVerification: async (email) => {
    const data = await request(
      adminApiClient.post("/api/auth/resend-verification", { email }),
      "Could not request a verification email",
    );
    return data.message || "If the address belongs to an unverified account, a verification email will be sent.";
  },
};

/* ============================================================
   app.js — Auth helper, API calls, UI utilities
   Backend: http://localhost:8080
   ============================================================ */

const BASE_URL = "http://localhost:8081/api";

/* ============================================================
   API — gọi tới BE
   ============================================================ */
const API = {
  async _request(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data.message || data.error || `Lỗi ${res.status}`;
      throw new Error(msg);
    }
    return data;
  },

  login(payload) {
    return this._request("/auth/login", "POST", payload);
  },
  register(payload) {
    return this._request("/auth/register", "POST", payload);
  },
  forgotPassword(payload) {
    return this._request("/auth/forgot-password", "POST", payload);
  },
  resetPassword(payload) {
    return this._request("/auth/reset-password", "POST", payload);
  },
  verifyEmail(token) {
    return this._request(`/auth/verify?token=${token}`, "GET");
  },
  resendVerification(email) {
    return this._request("/auth/resend-verification", "POST", { email });
  },
};

/* ============================================================
   Auth — quản lý JWT & session trong localStorage
   ============================================================ */
const Auth = {
  KEY_TOKEN: "auth_token",
  KEY_USER: "auth_user",

  saveSession(data) {
    localStorage.setItem(this.KEY_TOKEN, data.token);
    localStorage.setItem(
      this.KEY_USER,
      JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles || [],
      }),
    );
  },

  getToken() {
    return localStorage.getItem(this.KEY_TOKEN);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY_USER)) || null;
    } catch {
      return null;
    }
  },

  getRoles() {
    const user = this.getUser();
    return user ? user.roles : [];
  },

  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  logout() {
    localStorage.removeItem(this.KEY_TOKEN);
    localStorage.removeItem(this.KEY_USER);
    window.location.href = "index.html";
  },

  /**
   * Guard: kiểm tra đăng nhập + quyền.
   * Nếu chưa đăng nhập → về index.html
   * Nếu không đúng role → về trang tương ứng của role đó
   */
  requireRole(requiredRole) {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html";
      return;
    }
    const roles = this.getRoles();
    if (!roles.includes(requiredRole)) {
      // Redirect sang đúng trang của role hiện tại
      if (roles.includes("ROLE_ADMIN")) {
        // Redirect sang đúng trang của role hiện tại
        window.location.href = "http://localhost:5173";
      } else {
        window.location.href = "user.html";
      }
    }
  },
};

/* ============================================================
   UI — alert, loading, field errors, password toggle
   ============================================================ */
const UI = {
  alert(message, type = "info") {
    const el = document.getElementById("alert");
    if (!el) return;
    el.textContent = message;
    el.className = `alert alert-${type}`;
    el.classList.remove("hidden");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  clearErrors() {
    const el = document.getElementById("alert");
    if (el) {
      el.className = "alert hidden";
      el.textContent = "";
    }
    document.querySelectorAll(".field-error").forEach((e) => (e.textContent = ""));
    document.querySelectorAll("input").forEach((i) => i.classList.remove("input-error"));
  },

  fieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
    // highlight input above the error span
    if (el && el.previousElementSibling) {
      const input = el.previousElementSibling.querySelector
        ? el.previousElementSibling.querySelector("input") || el.previousElementSibling
        : null;
      if (input && input.tagName === "INPUT") input.classList.add("input-error");
    }
  },

  loading(isLoading) {
    const btn = document.getElementById("submitBtn");
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Đang xử lý..." : btn.dataset.label || btn.textContent;
    if (!btn.dataset.label && !isLoading) return;
    if (isLoading) btn.dataset.label = btn.dataset.label || btn.textContent;
  },

  initPasswordToggle() {
    document.querySelectorAll(".toggle-pw").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        input.type = input.type === "password" ? "text" : "password";
        btn.textContent = input.type === "password" ? "👁" : "🙈";
      });
    });
  },
};

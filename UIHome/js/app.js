const BASE_URL = "http://localhost:8081/api";
const ADMIN_URL = "http://localhost:5173"; // CHỈ CẦN SỬA CỔNG Ở ĐÂY LÀ TOÀN BỘ WEB TỰ ĐỔI THEO
const USER_PAGE = "user.html";

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
  AUTH_QUERY_KEYS: ["authToken", "authUsername", "authFullName", "authEmail", "authRoles"],

  saveSession(data) {
    const existingUser = this.getUser() || {};
    localStorage.setItem(this.KEY_TOKEN, data.token);
    localStorage.setItem(
      this.KEY_USER,
      JSON.stringify({
        id: data.id,
        username: data.username,
        fullName: data.fullName || existingUser.fullName || data.username,
        email: data.email,
        roles: data.roles || [],
      }),
    );
  },

  consumeSessionFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const authToken = params.get("authToken");
      const authUsername = params.get("authUsername");

      if (!authToken || !authUsername) return;

      const authFullName = params.get("authFullName") || authUsername;
      const authEmail = params.get("authEmail") || "";
      const rawRoles = params.get("authRoles");
      let roles = [];

      if (rawRoles) {
        try {
          const parsed = JSON.parse(rawRoles);
          roles = Array.isArray(parsed) ? parsed : [];
        } catch {
          roles = [];
        }
      }

      localStorage.setItem(this.KEY_TOKEN, authToken);
      localStorage.setItem(
        this.KEY_USER,
        JSON.stringify({
          username: authUsername,
          fullName: authFullName,
          email: authEmail,
          roles,
        }),
      );

      this.AUTH_QUERY_KEYS.forEach((key) => params.delete(key));
      const cleanQuery = params.toString();
      const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ""}${window.location.hash || ""}`;
      window.history.replaceState({}, document.title, cleanUrl);
    } catch {
      // no-op
    }
  },

  decodeTokenPayload(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64.length % 4 ? "=".repeat(4 - (base64.length % 4)) : "";
      return JSON.parse(atob(base64 + pad));
    } catch {
      return null;
    }
  },

  normalizeSession() {
    this.consumeSessionFromUrl();

    const token = this.getToken();
    if (!token) {
      localStorage.removeItem(this.KEY_USER);
      return;
    }

    const payload = this.decodeTokenPayload(token);
    if (!payload) return;

    // Token hết hạn thì xóa session cũ để không hiển thị sai user
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      localStorage.removeItem(this.KEY_TOKEN);
      localStorage.removeItem(this.KEY_USER);
      return;
    }

    const tokenUsername = payload.sub;
    if (!tokenUsername) return;

    const currentUser = this.getUser() || {};
    if (currentUser.username !== tokenUsername) {
      localStorage.setItem(
        this.KEY_USER,
        JSON.stringify({
          ...currentUser,
          username: tokenUsername,
          fullName: tokenUsername,
        }),
      );
    }
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

  getDisplayName() {
    const user = this.getUser();
    if (!user) return "";
    return user.fullName || user.username || "";
  },

  isLoggedIn() {
    this.normalizeSession();
    return !!this.getToken() && !!this.getUser();
  },

  logout() {
    localStorage.removeItem(this.KEY_TOKEN);
    localStorage.removeItem(this.KEY_USER);
    window.location.href = `${ADMIN_URL}/login`;
  },

  /**
   * Guard: kiểm tra đăng nhập + quyền.
   * Nếu chưa đăng nhập → về trang đăng nhập
   * Nếu không đúng role → về trang tương ứng của role đó
   */
  requireRole(requiredRole) {
    if (!this.isLoggedIn()) {
      window.location.href = `${ADMIN_URL}/login`;
      return;
    }
    const roles = this.getRoles();
    if (!roles.includes(requiredRole)) {
      // Redirect sang đúng trang của role hiện tại
      if (roles.includes("ROLE_ADMIN")) {
        window.location.href = ADMIN_URL;
      } else {
        window.location.href = USER_PAGE;
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

  /**
   * Tự động gán link Admin từ biến ADMIN_URL vào các thẻ có id="adminLink"
   */
  syncAdminLinks() {
    Auth.normalizeSession();
    const adminLink = document.getElementById("adminLink");
    if (adminLink) {
      const displayName = Auth.getDisplayName();
      adminLink.textContent = displayName || "Tài khoản";
      adminLink.onclick = null;

      // Đã đăng nhập: click vào tên tài khoản để đăng xuất ngay.
      if (Auth.isLoggedIn()) {
        adminLink.href = "#";
        adminLink.title = "Đăng xuất";
        adminLink.onclick = (event) => {
          event.preventDefault();
          Auth.logout();
        };
      } else {
        // Chưa đăng nhập: đưa về trang đăng nhập
        adminLink.href = `${ADMIN_URL}/login`;
        adminLink.title = "Đăng nhập";
      }
    }
  },
};

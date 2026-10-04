import { useState } from "react";
import { useNavigate } from "react-router";
import { authApi } from "../api/authApi";
import { authSession } from "../services/authSession";
export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await authApi.login({ username, password });
      const user = {
        id: response.id,
        username: response.username,
        fullName: response.fullName || response.username,
        email: response.email,
        roles: response.roles
      };
      authSession.setAuth(response.token, user);
      if (user.roles.includes("ROLE_ADMIN")) {
        navigate("/");
      } else {
        const target = new URL(import.meta.env.VITE_HOME_URL ?? `${window.location.origin}/trangchu.html`);
        const session = new URLSearchParams({
          authToken: response.token,
          authUsername: response.username,
          authFullName: response.fullName || response.username,
          authEmail: response.email || "",
          authRoles: JSON.stringify(response.roles || [])
        });
        target.hash = session.toString();
        window.location.href = target.toString();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "\u0110\u0103ng nh\u1EADp th\u1EA5t b\u1EA1i");
    } finally {
      setLoading(false);
    }
  };
  return <div className="admin-auth min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chào mừng quay lại</h1>
        <p className="text-gray-600 mb-6">Đăng nhập vào tài khoản của bạn</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Tên đăng nhập</label>
            <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="ten_dang_nhap"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
            <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="••••••••"
  />
          </div>

          <button
    type="submit"
    disabled={loading}
    className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
  >
            {loading ? "\u0110ang \u0111\u0103ng nh\u1EADp..." : "\u0110\u0103ng nh\u1EADp"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Chưa có tài khoản?{" "}
          <a href="/admin/register" className="text-blue-600 font-bold hover:underline">
            Đăng ký
          </a>
        </p>
      </div>
    </div>;
}

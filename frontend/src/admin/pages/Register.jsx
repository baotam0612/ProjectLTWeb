import { useState } from "react";
import { useNavigate } from "react-router";
import { authApi } from "../api/authApi";
export function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("M\u1EADt kh\u1EA9u x\xE1c nh\u1EADn kh\xF4ng kh\u1EDBp");
      return;
    }
    if (password.length < 8) {
      setError("M\u1EADt kh\u1EA9u c\u1EA7n \xEDt nh\u1EA5t 8 k\xFD t\u1EF1");
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.register({
        username,
        email,
        password,
        fullName,
        address,
        phoneNumber
      });
      navigate("/verify-email", { state: { email, message: response.message } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "\u0110\u0103ng k\xFD th\u1EA5t b\u1EA1i");
    } finally {
      setLoading(false);
    }
  };
  return <div className="admin-auth min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo tài khoản</h1>
        <p className="text-gray-600 mb-6">Đăng ký để bắt đầu</p>

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
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="nguyenvana"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="ban@example.com"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Họ và tên</label>
            <input
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="Nguyễn Văn A"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Địa chỉ</label>
            <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="123 Đường ABC, Quận 1"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Số điện thoại</label>
            <input
    type="tel"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="0912345678"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
            <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="••••••••"
  />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Xác nhận mật khẩu</label>
            <input
    type="password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    placeholder="••••••••"
  />
          </div>

          <button
    type="submit"
    disabled={loading}
    className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
  >
            {loading ? "\u0110ang t\u1EA1o t\xE0i kho\u1EA3n..." : "\u0110\u0103ng k\xFD"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Đã có tài khoản?{" "}
          <a href="/admin/login" className="text-purple-600 font-bold hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>;
}

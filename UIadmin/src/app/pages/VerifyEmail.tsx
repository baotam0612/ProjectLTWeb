import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { authService } from '../../services/authService';

export function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Mã xác nhận phải có 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail(code);
      setSuccess('Xác minh tài khoản thành công. Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác minh thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Xác nhận email</h1>
        <p className="text-gray-600 mb-6">
          Chúng tôi đã gửi mã xác nhận đến email: <span className="font-bold">{email}</span>
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-center text-lg">
              Nhập mã 6 chữ số
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-3xl tracking-[1rem] font-bold"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 text-lg"
          >
            {loading ? 'Đang xác minh...' : 'Xác nhận'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Không nhận được mã?{' '}
          <button type="button" className="text-purple-600 font-bold hover:underline">
            Gửi lại mã
          </button>
        </p>
      </div>
    </div>
  );
}

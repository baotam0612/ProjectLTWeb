import { useState } from 'react';
import { authApi } from '../api/authApi.js';
import { saveSession } from '../services/authSession.js';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    setLoading(true);
    try {
      const data = await authApi.login({
        username: String(form.get('username') || '').trim(),
        password: String(form.get('password') || ''),
      });
      saveSession(data);
      const roles = data.roles || [];
      window.location.assign(roles.includes('ROLE_ADMIN') ? '/admin/' : '/user.html');
    } catch (e) {
      setError( 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header"><h1>Đăng nhập</h1><p>Đăng nhập tài khoản SHYNE</p></div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label htmlFor="username">Tên đăng nhập</label><input id="username" name="username" autoComplete="username" required /></div>
          <div className="form-group"><label htmlFor="password">Mật khẩu</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
        </form>
        <div className="auth-links"><a href="register.html">Tạo tài khoản</a><a href="forgot.html">Quên mật khẩu?</a></div>
      </div>
    </div>
  );
}

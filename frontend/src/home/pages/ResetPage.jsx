import { useEffect, useState } from 'react';
import AuthCard from '../components/AuthCard.jsx';
import { authApi } from '../api/authApi.js';

function readResetToken() {
  const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return fragment.get('token') || new URLSearchParams(window.location.search).get('token') || '';
}

export default function ResetPage() {
  const [token] = useState(readResetToken);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState(token ? '' : 'Link không hợp lệ hoặc đã hết hạn.');
  const [messageType, setMessageType] = useState('error');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (token) window.history.replaceState({}, document.title, window.location.pathname);
  }, [token]);

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (password.length < 8) nextErrors.password = 'Mật khẩu cần ít nhất 8 ký tự.';
    if (password !== confirmation) nextErrors.confirmation = 'Mật khẩu không khớp.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !token) return;
    setLoading(true);
    setMessage('');
    try {
      const data = await authApi.resetPassword({ token, newPassword: password, confirmPassword: confirmation });
      setMessageType('success');
      setMessage(data.message || 'Đặt lại mật khẩu thành công!');
      window.setTimeout(() => window.location.assign('/index.html'), 2000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }

  return <AuthCard title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới của bạn" message={message} messageType={messageType} links={<a href="index.html">← Quay lại đăng nhập</a>}>
    <form onSubmit={submit} noValidate>
      <input type="hidden" value={token} readOnly />
      <div className="form-group"><label htmlFor="newPassword">Mật khẩu mới</label><div className="input-icon-wrap"><input id="newPassword" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /><button type="button" className="toggle-pw" onClick={() => setShowPassword((value) => !value)} aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? '🙈' : '👁'}</button></div><span className="field-error">{errors.password}</span></div>
      <div className="form-group"><label htmlFor="confirmPassword">Xác nhận mật khẩu</label><div className="input-icon-wrap"><input id="confirmPassword" type={showConfirmation ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" /><button type="button" className="toggle-pw" onClick={() => setShowConfirmation((value) => !value)} aria-label="Hiện hoặc ẩn mật khẩu">{showConfirmation ? '🙈' : '👁'}</button></div><span className="field-error">{errors.confirmation}</span></div>
      <button type="submit" className="btn-primary" disabled={!token || loading}>{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
    </form>
  </AuthCard>;
}

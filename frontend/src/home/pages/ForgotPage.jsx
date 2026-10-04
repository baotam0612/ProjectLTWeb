import { useState } from 'react';
import AuthCard from '../components/AuthCard.jsx';
import { authApi } from '../api/authApi.js';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessageType('error');
      setMessage('Email không hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.forgotPassword({ email: email.trim() });
      setMessageType('success');
      setMessage('Vui lòng kiểm tra email của bạn.');
      setEmail('');
    } catch (error) {
      setMessageType('error');
      setMessage('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  }

  return <AuthCard title="Quên mật khẩu?" subtitle="Nhập email để nhận link đặt lại mật khẩu" message={message} messageType={messageType} links={<a href="index.html">← Quay lại đăng nhập</a>}>
    <form onSubmit={submit} noValidate>
      <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Nhập email tài khoản" autoComplete="email" /><span className="field-error" /></div>
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang xử lý...' : 'Gửi link đặt lại'}</button>
    </form>
  </AuthCard>;
}

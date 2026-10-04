import { useState } from 'react';
import AuthCard from '../components/AuthCard.jsx';
import { authApi } from '../api/authApi.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage('');
    setVerificationEmail('');
    setResendMessage('');
    setErrors({});
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    const nextErrors = {};
    if (!values.username || values.username.trim().length < 3) nextErrors.username = 'Tên đăng nhập cần ít nhất 3 ký tự.';
    if (!values.fullName?.trim()) nextErrors.fullName = 'Vui lòng nhập họ tên.';
    if (!values.address?.trim()) nextErrors.address = 'Vui lòng nhập địa chỉ.';
    if (!values.phoneNumber?.trim()) nextErrors.phoneNumber = 'Vui lòng nhập số điện thoại.';
    if (!emailPattern.test(values.email?.trim() || '')) nextErrors.email = 'Email không hợp lệ.';
    if (!values.password || values.password.length < 12) nextErrors.password = 'Mật khẩu cần ít nhất 12 ký tự.';
    if (values.password?.length > 100) nextErrors.password = 'Mật khẩu không được quá 100 ký tự.';
    if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Mật khẩu không khớp.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register({
        username: values.username.trim(),
        fullName: values.fullName.trim(),
        address: values.address.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      setMessageType(data.verificationEmailSent === false ? 'info' : 'success');
      setMessage(data.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
      setVerificationEmail(values.email.trim());
      formElement.reset();
    } catch (error) {
      setMessageType('error');
      setMessage(error.details?.length ? error.details.join(' · ') : error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      if (error.code === 'REGISTRATION_CONFLICT') setVerificationEmail(values.email.trim());
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setResending(true);
    setResendMessage('');
    try {
      const data = await authApi.resendVerification({ email: verificationEmail });
      setResendMessage(data.message);
    } catch (error) {
      setResendMessage(error.message || 'Chưa gửi lại được email. Vui lòng thử lại sau.');
    } finally {
      setResending(false);
    }
  }

  return <AuthCard title="Tạo tài khoản" subtitle="Điền thông tin để đăng ký" message={message} messageType={messageType} links={<><span>Đã có tài khoản?</span><a href="index.html">Đăng nhập</a></>}>
    <form onSubmit={submit} noValidate>
      <div className="form-group"><label htmlFor="username">Tên đăng nhập</label><input id="username" name="username" placeholder="Tối thiểu 3 ký tự" autoComplete="username" /><span className="field-error">{errors.username}</span></div>
      <div className="form-group"><label htmlFor="fullName">Họ và tên</label><input id="fullName" name="fullName" placeholder="Nguyễn Văn A" /><span className="field-error">{errors.fullName}</span></div>
      <div className="form-group"><label htmlFor="address">Địa chỉ</label><input id="address" name="address" placeholder="Hà Nội, Việt Nam" /><span className="field-error">{errors.address}</span></div>
      <div className="form-group"><label htmlFor="phoneNumber">Số điện thoại</label><input id="phoneNumber" name="phoneNumber" placeholder="0123456789" autoComplete="tel" /><span className="field-error">{errors.phoneNumber}</span></div>
      <div className="form-group"><label htmlFor="email">Email</label><input id="email" name="email" type="email" placeholder="example@gmail.com" autoComplete="email" /><span className="field-error">{errors.email}</span></div>
      <div className="form-group"><label htmlFor="password">Mật khẩu</label><div className="input-icon-wrap"><input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Ít nhất 12 ký tự" maxLength={100} autoComplete="new-password" /><button type="button" className="toggle-pw" onClick={() => setShowPassword((value) => !value)} aria-label="Hiện hoặc ẩn mật khẩu">{showPassword ? '🙈' : '👁'}</button></div><span className="field-error">{errors.password}</span></div>
      <div className="form-group"><label htmlFor="confirmPassword">Xác nhận mật khẩu</label><div className="input-icon-wrap"><input id="confirmPassword" name="confirmPassword" type={showConfirmation ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" autoComplete="new-password" /><button type="button" className="toggle-pw" onClick={() => setShowConfirmation((value) => !value)} aria-label="Hiện hoặc ẩn mật khẩu">{showConfirmation ? '🙈' : '👁'}</button></div><span className="field-error">{errors.confirmPassword}</span></div>
      <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</button>
    </form>
    {verificationEmail && <section aria-label="Xác nhận tài khoản" style={{ marginTop: 20 }}>
      <p>Chưa nhận được email xác nhận tại <strong>{verificationEmail}</strong>?</p>
      <button type="button" className="btn-primary" disabled={resending || loading} onClick={resendVerification}>
        {resending ? 'Đang gửi...' : 'Gửi lại email xác nhận'}
      </button>
      {resendMessage && <p role="status" style={{ marginTop: 12 }}>{resendMessage}</p>}
    </section>}
  </AuthCard>;
}

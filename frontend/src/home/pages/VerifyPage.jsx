import { useEffect, useState } from 'react';
import AuthCard from '../components/AuthCard.jsx';
import { authApi } from '../api/authApi.js';

export default function VerifyPage() {
  const [state, setState] = useState({ loading: true, message: '', messageType: 'info', subtitle: 'Đang xác nhận email...' });

  useEffect(() => {
    let active = true;
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setState({ loading: false, subtitle: 'Link không hợp lệ', message: 'Link xác nhận không hợp lệ hoặc đã hết hạn.', messageType: 'error' });
      return () => { active = false; };
    }
    authApi.verifyEmail(token).then((data) => {
      if (active) setState({ loading: false, subtitle: 'Xác nhận thành công!', message: `${data.message || 'Email đã được xác nhận!'} Bạn có thể đăng nhập ngay bây giờ.`, messageType: 'success' });
    }).catch((error) => {
      if (active) setState({ loading: false, subtitle: 'Xác nhận thất bại', message: error.message || 'Link không hợp lệ hoặc đã hết hạn.', messageType: 'error' });
    });
    return () => { active = false; };
  }, []);

  return <AuthCard title="Xác nhận Email" subtitle={state.subtitle} message={state.message} messageType={state.messageType} links={<a href="index.html">← Quay lại đăng nhập</a>}>
    {state.loading && <div style={{ textAlign: 'center', padding: 20, color: '#555' }}>Vui lòng chờ...</div>}
  </AuthCard>;
}

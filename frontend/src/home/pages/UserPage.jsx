import { useEffect, useState } from 'react';
import { clearSession, normalizeSession } from '../services/authSession.js';

export default function UserPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = normalizeSession();
    if (!session) {
      window.location.replace('/index.html');
      return;
    }
    if (!session.roles?.includes('ROLE_USER')) {
      window.location.replace(session.roles?.includes('ROLE_ADMIN') ? '/admin/' : '/index.html');
      return;
    }
    setUser(session);
  }, []);

  function logout() {
    clearSession();
    window.location.assign('/index.html');
  }

  if (!user) return <div className="dashboard">Đang kiểm tra phiên đăng nhập...</div>;

  return (
    <>
      <nav className="navbar">
        <a href="trangchu.html" className="nav-brand">🏠 Trang chủ</a>
        <div className="nav-info"><span>{user.username}</span><span className="role-badge role-user">USER</span><button className="btn-logout" onClick={logout}>Đăng xuất</button></div>
      </nav>
      <main className="dashboard">
        <div className="dashboard-header"><h2>Xin chào, {user.fullName || user.username}!</h2><p>Chào mừng bạn đến với hệ thống</p></div>
        <div className="card-grid">
          <div className="card"><div className="card-icon">👤</div><div className="card-title">Hồ sơ cá nhân</div><div className="card-desc">Xem thông tin cá nhân của bạn</div></div>
          <div className="card"><div className="card-icon">🔑</div><div className="card-title">Đổi mật khẩu</div><div className="card-desc">Cập nhật mật khẩu tài khoản</div></div>
          <div className="card"><div className="card-icon">📦</div><div className="card-title">Đơn hàng của tôi</div><div className="card-desc">Xem lịch sử và trạng thái đơn hàng</div></div>
          <div className="card"><div className="card-icon">❤️</div><div className="card-title">Yêu thích</div><div className="card-desc">Danh sách sản phẩm đã lưu</div></div>
        </div>
        <div className="session-info">
          <h3>Thông tin tài khoản</h3>
          <table className="info-table"><tbody><tr><td>Email</td><td>{user.email || '—'}</td></tr><tr><td>Vai trò</td><td>{user.roles?.join(', ') || '—'}</td></tr></tbody></table>
        </div>
      </main>
    </>
  );
}

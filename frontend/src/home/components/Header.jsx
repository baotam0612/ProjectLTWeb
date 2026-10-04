import { useEffect, useState } from 'react';
import { clearSession, normalizeSession } from '../services/authSession.js';

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(normalizeSession());
  }, []);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && document.getElementById('store-menu-toggle')?.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        document.getElementById('store-menu-toggle')?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 992px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, []);

  function handleAccountClick(event) {
    if (!user) return;
    event.preventDefault();
    clearSession();
    setUser(null);
    window.location.assign('/index.html');
  }

  return (
    <header className="header">
      <div className="container">
        <div className="inner-wrap">
          <a className="inner-logo" href="/trangchu.html" aria-label="Trang chủ SHYNE">
            <i className="fa-solid fa-gem" />
            <span className="inner-name">SHYNE</span>
          </a>
          <button id="store-menu-toggle" type="button" className="menu-toggle" aria-controls="store-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span> Menu
          </button>
          <nav id="store-navigation" className={`inner-menu${menuOpen ? ' is-open' : ''}`} aria-label="Điều hướng chính" onClick={() => setMenuOpen(false)}>
            <a href="/trangchu.html" className="menu">Trang chủ</a>
            <a href="/sanpham.html" className="menu">Sản phẩm</a>
            <a href="/giohang.html" className="menu">Giỏ hàng</a>
          </nav>
          <div className="inner-dn">
            <div className="inner-lg"><i className="fa-regular fa-user" /></div>
            <a href={user ? '#' : '/index.html'} id="adminLink" className="inner-desc" onClick={handleAccountClick} title={user ? 'Đăng xuất' : 'Đăng nhập'}>
              {user?.fullName || user?.username || 'Tài khoản'}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

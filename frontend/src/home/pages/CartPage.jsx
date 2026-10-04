import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../api/client.js';
import { getToken, getUser } from '../services/authSession.js';
import { readCart, writeCart } from '../services/cartStorage.js';
import { formatCurrency } from '../utils/formatCurrency.js';

const cartCurrency = (value) => Number(value || 0) <= 0 ? '0 VND' : formatCurrency(value);

export default function CartPage() {
  const [cart, setCart] = useState(readCart);
  const [address, setAddress] = useState(() => getUser()?.address || '');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.quantity) || 1), 0), [cart]);

  useEffect(() => {
    const refresh = () => setCart(readCart());
    window.addEventListener('shyne-cart-change', refresh);
    return () => window.removeEventListener('shyne-cart-change', refresh);
  }, []);

  function updateCart(nextCart) {
    setCart(nextCart);
    writeCart(nextCart);
  }

  function changeQuantity(productId, quantity) {
    const value = Number.parseInt(quantity, 10);
    updateCart(cart.map((item) => Number(item.productId) === Number(productId)
      ? { ...item, quantity: Number.isFinite(value) && value > 0 ? value : 1 }
      : item));
  }

  function removeItem(productId) {
    updateCart(cart.filter((item) => Number(item.productId) !== Number(productId)));
  }

  async function checkout(event) {
    event.preventDefault();
    if (!cart.length) return setStatus('Giỏ hàng đang trống.');
    if (!getToken()) {
      window.alert('Vui lòng đăng nhập để đặt hàng.');
      window.location.assign('/index.html');
      return;
    }
    if (!address.trim()) return setStatus('Vui lòng nhập địa chỉ giao hàng.');

    setSubmitting(true);
    setStatus('Đang gửi đơn hàng...');
    try {
      for (const item of cart) {
        await apiRequest('/user/orders', { method: 'POST', body: {
          productId: item.productId,
          quantity: Math.max(1, Number(item.quantity) || 1),
          shippingAddress: address.trim(),
          paymentMethod: 'Thanh toán khi nhận hàng',
        } });
      }
      updateCart([]);
      setStatus('Đặt toàn bộ thành công.');
    } catch (error) {
      setStatus(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <section className="cart-section">
        <div className="container">
          <div className="cart-head"><h2>Giỏ hàng của bạn</h2><a href="sanpham.html" className="cart-link-back">Tiếp tục mua sắm</a></div>
          <div className="row">
            <div className="col-lg-8"><div id="cartItems" className="cart-items-wrap">
              {cart.length === 0 ? <div className="cart-empty"><p>Giỏ hàng đang trống.</p><a href="sanpham.html">Thêm sản phẩm ngay</a></div> : cart.map((item) => (
                <div className="cart-item" key={item.productId}>
                  <img className="cart-item-image" src={item.imageUrl || '/img/ts1.jpg'} alt={item.productName || 'Sản phẩm'} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.productName || 'Sản phẩm'}</div>
                    <div className="cart-item-price">{cartCurrency(item.price)} × {item.quantity} = {cartCurrency(Number(item.price || 0) * Number(item.quantity || 1))}</div>
                    <div className="cart-item-actions"><div className="qty-box">
                      <button type="button" className="qty-btn" onClick={() => changeQuantity(item.productId, Number(item.quantity || 1) - 1)} aria-label="Giảm số lượng">−</button>
                      <input className="qty-input" type="number" min="1" value={item.quantity || 1} onChange={(event) => changeQuantity(item.productId, event.target.value)} aria-label={`Số lượng ${item.productName || 'sản phẩm'}`} />
                      <button type="button" className="qty-btn" onClick={() => changeQuantity(item.productId, Number(item.quantity || 1) + 1)} aria-label="Tăng số lượng">+</button>
                    </div><button type="button" className="cart-item-remove" onClick={() => removeItem(item.productId)}>Xóa</button></div>
                  </div>
                </div>
              ))}
            </div></div>
            <div className="col-lg-4"><form className="cart-summary" onSubmit={checkout}>
              <h4>Tổng đơn</h4>
              <div className="cart-summary-line"><span>Tạm tính</span><strong id="cartSubtotal">{cartCurrency(subtotal)}</strong></div>
              <div className="cart-summary-line"><span>Phí vận chuyển</span><strong>0 VND</strong></div>
              <div className="cart-summary-total"><span>Thành tiền</span><strong id="cartTotal">{cartCurrency(subtotal)}</strong></div>
              <div className="cart-address-wrap"><label htmlFor="shippingAddressInput" className="cart-address-label">Địa chỉ giao hàng</label><textarea id="shippingAddressInput" className="cart-address-input" rows="3" placeholder="Nhập địa chỉ giao hàng..." value={address} onChange={(event) => setAddress(event.target.value)} /></div>
              <div className="cart-address-wrap"><label htmlFor="paymentMethodInput" className="cart-address-label">Phương thức thanh toán</label><select id="paymentMethodInput" className="cart-address-input" defaultValue="Thanh toán khi nhận hàng"><option value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng (COD)</option></select></div>
              <div className="cart-summary-actions"><button type="button" className="btn btn-outline-secondary btn-block" disabled={!cart.length || submitting} onClick={() => { updateCart([]); setStatus('Đã xóa toàn bộ giỏ hàng.'); }}>Xóa giỏ hàng</button><button type="submit" className="btn btn-primary btn-block" disabled={!cart.length || submitting}>{submitting ? 'Đang xử lý...' : 'Đặt toàn bộ'}</button></div>
              <p id="cartStatus" className="cart-status" aria-live="polite">{status}</p>
            </form></div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

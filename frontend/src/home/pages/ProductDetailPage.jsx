import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../api/client.js';
import { getToken, getUser } from '../services/authSession.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function ProductDetailPage() {
  const productId = new URLSearchParams(window.location.search).get('id');
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [orderOpen, setOrderOpen] = useState(false);
  const [address, setAddress] = useState(() => getUser()?.address || '');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canOrder = product?.quantity > 0 && product?.status?.toLowerCase() === 'available';

  useEffect(() => {
    if (!productId) {
      setError('Không tìm thấy sản phẩm.');
      return undefined;
    }
    let active = true;
    apiRequest(`/public/products/${encodeURIComponent(productId)}`, { authenticated: false })
      .then((data) => { if (active) setProduct(data); })
      .catch((e) => { if (active) setError('Lỗi tải dữ liệu sản phẩm.'); });
    return () => { active = false; };
  }, [productId]);

  function openOrder() {
    if (!getToken()) {
      window.alert('Vui lòng đăng nhập để đặt hàng.');
      window.location.assign('/index.html');
      return;
    }
    if (!canOrder) return;
    setAddress(getUser()?.address || '');
    setQuantity(1);
    setStatus('');
    setOrderOpen(true);
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!address.trim()) return setStatus('Vui lòng nhập địa chỉ giao hàng.');
    const safeQuantity = Number.parseInt(quantity, 10);
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1) return setStatus('Số lượng không hợp lệ.');
    if (safeQuantity > product.quantity) return setStatus('Số lượng vượt quá tồn kho.');
    setSubmitting(true);
    try {
      await apiRequest('/user/orders', { method: 'POST', body: { productId: product.id, quantity: safeQuantity, shippingAddress: address.trim(), paymentMethod: 'Thanh toán khi nhận hàng' } });
      setProduct(current => ({ ...current, quantity: current.quantity - safeQuantity }));
      setStatus('Đặt hàng thành công!');
      window.setTimeout(() => setOrderOpen(false), 800);
    } catch (e) {
      setStatus(e.message || 'Đặt hàng thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <section className="product-detail-section">
        <div className="container">
          {!product && !error && <div className="text-center w-100 py-5"><div className="spinner-border text-primary" role="status"><span className="sr-only">Đang tải...</span></div></div>}
          {error && <div className="text-center py-5 w-100"><h3 className="text-danger">{error}</h3><a href="sanpham.html" className="btn btn-outline-secondary mt-3">Quay lại danh sách</a></div>}
          {product && <div className="detail-container">
            <div className="detail-image-side"><img src={product.imageUrl || '/img/ts1.jpg'} alt={product.productName || 'Sản phẩm'} /></div>
            <div className="detail-info-side">
              <h1 className="detail-name">{product.productName || 'Sản phẩm'}</h1>
              <p>Tồn kho: {product.quantity ?? 0}</p>
              <div className="detail-price">{formatCurrency(product.price)}</div>
              <div className="detail-desc-title">Thông tin sản phẩm</div>
              <div className="detail-description">{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</div>
              <div className="detail-desc-title">Chi tiết sản phẩm</div>
              {Array.isArray(product.productDetails) && product.productDetails.length > 0 ? (
                <div className="detail-grid">{product.productDetails.map((detail, index) => <div className="detail-card" key={detail.productDetailID || index}>
                  <div className="detail-item"><span>Chất liệu:</span><strong>{detail.materialName || '-'}</strong></div>
                  <div className="detail-item"><span>Mã chất liệu:</span><strong>{detail.materialID ?? '-'}</strong></div>
                  <div className="detail-item"><span>Trọng lượng tham chiếu:</span><strong>{detail.referenceWeight == null ? '-' : `${detail.referenceWeight} g`}</strong></div>
                  <div className="detail-item"><span>Thành phần:</span><strong>{detail.composition || '-'}</strong></div>
                </div>)}</div>
              ) : <div className="detail-empty">Sản phẩm chưa có dữ liệu chi tiết.</div>}
              <div className="detail-actions"><button type="button" onClick={openOrder} disabled={!canOrder} className="btn-buy-now">{product.status?.toLowerCase() !== 'available' ? "Ngừng bán" : product.quantity > 0 ? "Đặt hàng ngay" : "Hết hàng"}</button><a href="sanpham.html" className="btn-back">Quay lại</a></div>
            </div>
          </div>}
        </div>
      </section>

      <div className="order-overlay" style={{ display: orderOpen ? 'flex' : 'none' }} onClick={(event) => { if (event.target === event.currentTarget) setOrderOpen(false); }}>
        <form className="order-modal" onSubmit={submitOrder}>
          <h3>Xác nhận địa chỉ giao hàng</h3>
          <p className="order-product-name">Sản phẩm: {product?.productName}</p>
          <label htmlFor="shippingAddress">Địa chỉ nhận hàng:</label>
          <input id="shippingAddress" value={address} onChange={(event) => setAddress(event.target.value)} />
          <label htmlFor="orderQuantity">Số lượng:</label>
          <input id="orderQuantity" type="number" value={quantity} min="1" max={product?.quantity ?? 0} step="1" onChange={(event) => setQuantity(event.target.value)} />
          <label htmlFor="paymentMethod">Phương thức thanh toán:</label>
          <select id="paymentMethod" defaultValue="Thanh toán khi nhận hàng"><option value="Thanh toán khi nhận hàng">Thanh toán khi nhận hàng (COD)</option></select>
          <p className="order-status-message" aria-live="polite">{status}</p>
          <div className="order-modal-footer"><button type="button" className="btn-cancel" onClick={() => setOrderOpen(false)}>Hủy</button><button type="submit" className="btn-confirm" disabled={submitting}>{submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}</button></div>
        </form>
      </div>
      <Footer />
    </>
  );
}

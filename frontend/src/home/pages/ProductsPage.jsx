import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../api/client.js';
import { getToken, getUser } from '../services/authSession.js';
import { readCart, writeCart } from '../services/cartStorage.js';
import { formatCurrency } from '../utils/formatCurrency.js';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState(() => getUser()?.address || '');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const subtotal = useMemo(() => Number(selectedProduct?.price || 0) * Math.max(1, Number(quantity) || 1), [selectedProduct, quantity]);

  useEffect(() => {
    let active = true;
    const categoryId = new URLSearchParams(window.location.search).get('categoryId');
    const endpoint = categoryId
      ? `/public/products/category?categoryId=${encodeURIComponent(categoryId)}`
      : '/public/products';
    apiRequest(endpoint, { authenticated: false })
      .then((data) => { if (active) setProducts(Array.isArray(data) ? data : data.content || []); })
      .catch((error) => { if (active) setLoadError(error.message || 'Không tải được danh sách sản phẩm.'); });
    return () => { active = false; };
  }, []);

  function addToCart(product) {
    const cart = readCart();
    const current = cart.find((item) => Number(item.productId) === Number(product.id));
    if (current) current.quantity = Number(current.quantity || 1) + 1;
    else cart.push({ productId: product.id, productName: product.productName, price: Number(product.price || 0), imageUrl: product.imageUrl || '/img/ts1.jpg', quantity: 1 });
    writeCart(cart);
    window.alert('Đã thêm sản phẩm vào giỏ hàng.');
  }

  function openOrder(product) {
    if (!getToken()) {
      window.alert('Vui lòng đăng nhập để đặt hàng.');
      window.location.assign('/index.html');
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setAddress(getUser()?.address || '');
    setStatus('');
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!selectedProduct) return;
    const safeQuantity = Number.parseInt(quantity, 10);
    if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
      setStatus('Số lượng không hợp lệ.');
      return;
    }
    if (!address.trim()) {
      setStatus('Vui lòng nhập địa chỉ nhận hàng.');
      return;
    }
    setSubmitting(true);
    setStatus('Đang gửi đơn hàng...');
    try {
      await apiRequest('/user/orders', { method: 'POST', body: { productId: selectedProduct.id, quantity: safeQuantity, shippingAddress: address.trim() } });
      setStatus('Đặt hàng thành công!');
      window.setTimeout(() => setSelectedProduct(null), 800);
    } catch (error) {
      setStatus(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <div className="section-one" />
      <section className="section-two">
        <div className="container">
          <div className="row"><div className="col-12"><div className="inner-header"><h2>Các mặt hàng</h2></div></div></div>
          <div className="row" id="products">
            {loadError && <div className="col-12"><p className="text-center text-danger">{loadError}</p></div>}
            {!loadError && products.length === 0 && <div className="col-12"><p className="text-center">Chưa có sản phẩm nào trong danh mục này.</p></div>}
            {products.map((product) => (
              <div className="col-lg-4 col-md-6 mb-5" key={product.id}>
                <div className="product-card">
                  <div className="product-image-wrapper"><img src={product.imageUrl || '/img/ts1.jpg'} alt={product.productName || 'Sản phẩm'} /></div>
                  <div className="product-name">{product.productName || 'Sản phẩm'}</div>
                  <div className="product-description">{product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}</div>
                  <div className="product-footer">
                    <div className="product-price">{formatCurrency(product.price)}</div>
                    <div className="product-actions">
                      <a href={`/product-detail.html?id=${encodeURIComponent(product.id)}`} className="btn-detail mr-2">Chi tiết</a>
                      <button type="button" className="btn-order" onClick={() => openOrder(product)}>Đặt hàng</button>
                      <button type="button" className="btn-cart ml-2" onClick={() => addToCart(product)}>Thêm giỏ hàng</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="order-overlay" style={{ display: selectedProduct ? 'flex' : 'none' }} onClick={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
        <form className="order-modal" role="dialog" aria-modal="true" aria-labelledby="orderModalTitle" onSubmit={submitOrder}>
          <button type="button" className="order-close" aria-label="Đóng" onClick={() => setSelectedProduct(null)}>×</button>
          <h3 id="orderModalTitle">Đặt hàng</h3>
          <div className="order-summary-box">
            <p className="order-product-name">{selectedProduct?.productName}</p>
            <div className="order-summary-line"><span>Đơn giá</span><strong>{formatCurrency(selectedProduct?.price)}</strong></div>
            <div className="order-summary-line"><span>Tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
          </div>
          <label htmlFor="orderQuantity" className="order-label">Số lượng</label>
          <input type="number" id="orderQuantity" className="order-input" value={quantity} min="1" step="1" onChange={(event) => setQuantity(event.target.value)} />
          <label htmlFor="shippingAddress" className="order-label">Địa chỉ nhận hàng</label>
          <textarea id="shippingAddress" className="order-input order-textarea" placeholder="Nhập địa chỉ nhận hàng..." rows="3" value={address} onChange={(event) => setAddress(event.target.value)} />
          <p className="order-status-message" aria-live="polite">{status}</p>
          <div className="order-modal-footer">
            <button type="button" className="btn-cancel" onClick={() => setSelectedProduct(null)}>Hủy</button>
            <button type="submit" className="btn-confirm" disabled={submitting}>{submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}</button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}

const CART_STORAGE_KEY = "shyne_cart";
const ORDER_API = "http://localhost:8081/api/user/orders";
const LOGIN_PAGE_URL = "http://localhost:5173/login";

const cartItemsEl = document.getElementById("cartItems");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartTotalEl = document.getElementById("cartTotal");
const cartStatusEl = document.getElementById("cartStatus");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const shippingAddressInput = document.getElementById("shippingAddressInput");

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  cart = readCart();
  prefillShippingAddress();
  bindEvents();
  renderCart();
});

function bindEvents() {
  cartItemsEl?.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;

    const productId = Number(btn.dataset.productId);
    if (!Number.isFinite(productId)) return;

    const action = btn.dataset.action;
    if (action === "inc") updateQuantity(productId, 1);
    if (action === "dec") updateQuantity(productId, -1);
    if (action === "remove") removeItem(productId);
  });

  cartItemsEl?.addEventListener("change", (event) => {
    const input = event.target.closest("input[data-action='inputQty']");
    if (!input) return;

    const productId = Number(input.dataset.productId);
    const nextQty = Number.parseInt(input.value, 10);
    setQuantity(productId, nextQty);
  });

  clearCartBtn?.addEventListener("click", () => {
    cart = [];
    persistCart();
    setStatus("Đã xóa toàn bộ giỏ hàng.");
    renderCart();
  });

  checkoutBtn?.addEventListener("click", checkoutAll);
}

function renderCart() {
  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = '<div class="cart-empty"><p>Giỏ hàng đang trống.</p><a href="sanpham.html">Thêm sản phẩm ngay</a></div>';
    cartSubtotalEl.textContent = "0 VND";
    cartTotalEl.textContent = "0 VND";
    checkoutBtn.disabled = true;
    clearCartBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  clearCartBtn.disabled = false;

  let subtotal = 0;

  cartItemsEl.innerHTML = cart.map((item) => {
    const unitPrice = Number(item.price || 0);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    return `
      <div class="cart-item">
        <img class="cart-item-image" src="${escapeHtml(item.imageUrl || "./img/ts1.jpg")}" alt="${escapeHtml(item.productName || "Sản phẩm")}">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(item.productName || "Sản phẩm")}</div>
          <div class="cart-item-price">${formatCurrency(unitPrice)} x ${item.quantity} = ${formatCurrency(lineTotal)}</div>
          <div class="cart-item-actions">
            <div class="qty-box">
              <button class="qty-btn" data-action="dec" data-product-id="${item.productId}">-</button>
              <input class="qty-input" data-action="inputQty" data-product-id="${item.productId}" type="number" min="1" value="${item.quantity}">
              <button class="qty-btn" data-action="inc" data-product-id="${item.productId}">+</button>
            </div>
            <button class="cart-item-remove" data-action="remove" data-product-id="${item.productId}">Xóa</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartSubtotalEl.textContent = formatCurrency(subtotal);
  cartTotalEl.textContent = formatCurrency(subtotal);
}

function updateQuantity(productId, delta) {
  const index = cart.findIndex((x) => Number(x.productId) === Number(productId));
  if (index === -1) return;

  const nextQty = Number(cart[index].quantity || 1) + delta;
  cart[index].quantity = Math.max(1, nextQty);

  persistCart();
  renderCart();
}

function setQuantity(productId, value) {
  const index = cart.findIndex((x) => Number(x.productId) === Number(productId));
  if (index === -1) return;

  const safeQty = Number.isFinite(value) && value > 0 ? value : 1;
  cart[index].quantity = safeQty;

  persistCart();
  renderCart();
}

function removeItem(productId) {
  cart = cart.filter((x) => Number(x.productId) !== Number(productId));
  persistCart();
  renderCart();
}

async function checkoutAll() {
  if (!cart.length) {
    setStatus("Giỏ hàng đang trống.");
    return;
  }

  const token = getAuthToken();
  if (!token) {
    alert("Vui lòng đăng nhập để đặt hàng.");
    window.location.href = LOGIN_PAGE_URL;
    return;
  }

  const shippingAddress = (shippingAddressInput?.value || "").trim();
  const paymentMethodInput = document.getElementById("paymentMethodInput");
  const paymentMethod = paymentMethodInput?.value || "Thanh toán khi nhận hàng";

  if (!shippingAddress) {
    setStatus("Vui lòng nhập địa chỉ giao hàng.");
    return;
  }

  checkoutBtn.disabled = true;
  setStatus("Đang gửi đơn hàng...");

  try {
    for (const item of cart) {
      const response = await fetch(ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity,
          shippingAddress,
          paymentMethod
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
    }

    cart = [];
    persistCart();
    renderCart();
    setStatus("Đặt toàn bộ thành công.");
  } catch (error) {
    console.error("Checkout error:", error);
    setStatus("Đặt hàng thất bại. Vui lòng thử lại.");
  } finally {
    checkoutBtn.disabled = !cart.length;
  }
}

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function readCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function setStatus(message) {
  if (cartStatusEl) cartStatusEl.textContent = message;
}

function getAuthToken() {
  return localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
}

function getStoredUser() {
  const raw = localStorage.getItem("auth_user") || localStorage.getItem("user") || "{}";
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function prefillShippingAddress() {
  if (!shippingAddressInput) return;

  const user = getStoredUser();
  const address = (user.address || "").trim();
  if (address) {
    shippingAddressInput.value = address;
  }
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "0 VND";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

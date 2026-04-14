const PRODUCT_API = "http://localhost:8081/api/public/products";
const ORDER_API = "http://localhost:8081/api/user/orders";
const LOGIN_PAGE_URL = "http://localhost:5173/login";
const CART_STORAGE_KEY = "shyne_cart";

let selectedProduct = null;
const productMap = new Map();

const orderOverlay = document.getElementById("orderOverlay");
const productsContainer = document.getElementById("products");
const orderProductName = document.getElementById("orderProductName");
const orderUnitPrice = document.getElementById("orderUnitPrice");
const orderSubtotal = document.getElementById("orderSubtotal");
const shippingAddressInput = document.getElementById("shippingAddress");
const orderQuantityInput = document.getElementById("orderQuantity");
const confirmOrderBtn = document.getElementById("confirmOrderBtn");
const cancelOrderBtn = document.getElementById("cancelOrderBtn");
const closeOrderModalBtn = document.getElementById("closeOrderModalBtn");
const orderStatusMessage = document.getElementById("orderStatusMessage");

document.addEventListener("DOMContentLoaded", () => {
  bindOrderEvents();
  loadProducts();
});

function bindOrderEvents() {
  productsContainer?.addEventListener("click", (event) => {
    const orderButton = event.target.closest(".btn-order");
    if (orderButton) {
      const productId = Number(orderButton.dataset.productId);
      if (Number.isFinite(productId)) {
        openOrderModal(productId);
      }
      return;
    }

    const cartButton = event.target.closest(".btn-cart");
    if (!cartButton) return;

    const productId = Number(cartButton.dataset.productId);
    if (!Number.isFinite(productId)) return;

    addToCart(productId);
  });

  orderQuantityInput?.addEventListener("input", updateOrderSubtotal);

  confirmOrderBtn?.addEventListener("click", submitOrder);
  cancelOrderBtn?.addEventListener("click", closeOrderModal);
  closeOrderModalBtn?.addEventListener("click", closeOrderModal);

  orderOverlay?.addEventListener("click", (event) => {
    if (event.target === orderOverlay) {
      closeOrderModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && orderOverlay?.style.display === "flex") {
      closeOrderModal();
    }
  });
}

async function loadProducts() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get("categoryId");

    let apiUrl = PRODUCT_API;
    if (categoryId) {
      apiUrl = `${PRODUCT_API}/category?categoryId=${encodeURIComponent(categoryId)}`;
    }

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    if (!productsContainer) return;

    productMap.clear();
    productsContainer.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      productsContainer.innerHTML = '<div class="col-12"><p class="text-center">Chưa có sản phẩm nào trong danh mục này.</p></div>';
      return;
    }

    products.forEach((item) => {
      productMap.set(item.id, item);

      const formattedPrice = formatCurrency(item.price);
      const imageUrl = item.imageUrl || "./img/ts1.jpg";
      const desc = item.description || "Chưa có mô tả chi tiết cho sản phẩm này.";

      const html = `
        <div class="col-lg-4 col-md-6 mb-5">
          <div class="product-card">
            <div class="product-image-wrapper">
              <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.productName || "Sản phẩm")}">
            </div>
            <div class="product-name">${escapeHtml(item.productName || "Sản phẩm")}</div>
            <div class="product-description">${escapeHtml(desc)}</div>
            <div class="product-footer">
              <div class="product-price">${formattedPrice}</div>
              <div class="d-flex gap-2">
                <a href="product-detail.html?id=${encodeURIComponent(item.id)}" class="btn-detail mr-2">Chi tiết</a>
                <button class="btn-order" data-product-id="${item.id}">Đặt hàng</button>
                <button class="btn-cart ml-2" data-product-id="${item.id}">Thêm giỏ hàng</button>
              </div>
            </div>
          </div>
        </div>
      `;

      productsContainer.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
    if (productsContainer) {
      productsContainer.innerHTML = '<div class="col-12"><p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu sản phẩm.</p></div>';
    }
  }
}

function openOrderModal(productId) {
  const token = getAuthToken();
  if (!token) {
    alert("Vui lòng đăng nhập để đặt hàng!");
    window.location.href = LOGIN_PAGE_URL;
    return;
  }

  const product = productMap.get(productId);
  if (!product) {
    alert("Không tìm thấy thông tin sản phẩm.");
    return;
  }

  selectedProduct = product;

  const savedAddress = getStoredUserAddress();
  if (savedAddress) {
    shippingAddressInput.value = savedAddress;
  }

  orderQuantityInput.value = "1";
  orderProductName.textContent = product.productName || "Sản phẩm";
  orderUnitPrice.textContent = formatCurrency(product.price);

  setOrderStatus("");
  updateOrderSubtotal();

  orderOverlay.style.display = "flex";
}

function closeOrderModal() {
  if (!orderOverlay) return;

  orderOverlay.style.display = "none";
  setOrderSubmitting(false);
  setOrderStatus("");

  orderQuantityInput.value = "1";
  shippingAddressInput.value = "";
  selectedProduct = null;
}

async function submitOrder() {
  if (!selectedProduct) {
    setOrderStatus("Không có sản phẩm được chọn.", true);
    return;
  }

  const quantity = Number.parseInt(orderQuantityInput.value, 10);
  if (!Number.isFinite(quantity) || quantity < 1) {
    setOrderStatus("Số lượng không hợp lệ.", true);
    return;
  }

  const shippingAddress = (shippingAddressInput.value || "").trim();
  if (!shippingAddress) {
    setOrderStatus("Vui lòng nhập địa chỉ nhận hàng.", true);
    return;
  }

  const token = getAuthToken();
  if (!token) {
    alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    window.location.href = LOGIN_PAGE_URL;
    return;
  }

  try {
    setOrderSubmitting(true);
    setOrderStatus("Đang gửi đơn hàng...");

    const response = await fetch(ORDER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: selectedProduct.id,
        quantity,
        shippingAddress
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    setOrderStatus("Đặt hàng thành công!");

    setTimeout(() => {
      closeOrderModal();
    }, 800);
  } catch (error) {
    console.error("Order error:", error);
    setOrderStatus("Đặt hàng thất bại. Vui lòng thử lại.", true);
  } finally {
    setOrderSubmitting(false);
  }
}

function setOrderSubmitting(isSubmitting) {
  if (!confirmOrderBtn) return;

  confirmOrderBtn.disabled = isSubmitting;
  confirmOrderBtn.textContent = isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng";
}

function setOrderStatus(message, isError = false) {
  if (!orderStatusMessage) return;

  orderStatusMessage.textContent = message;
  orderStatusMessage.classList.toggle("is-error", Boolean(isError));
  orderStatusMessage.classList.toggle("is-success", Boolean(message) && !isError);
}

function updateOrderSubtotal() {
  if (!selectedProduct || !orderSubtotal) return;

  const quantity = Number.parseInt(orderQuantityInput.value, 10);
  const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  const subtotal = Number(selectedProduct.price || 0) * safeQty;

  orderSubtotal.textContent = formatCurrency(subtotal);
}

function getAuthToken() {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getStoredUserAddress() {
  const raw = localStorage.getItem("auth_user") || localStorage.getItem("user");
  if (!raw) return "";

  try {
    const user = JSON.parse(raw);
    return user?.address || "";
  } catch (error) {
    return "";
  }
}

function addToCart(productId) {
  const product = productMap.get(productId);
  if (!product) {
    alert("Không tìm thấy thông tin sản phẩm.");
    return;
  }

  const cart = readCart();
  const existingIndex = cart.findIndex((x) => Number(x.productId) === Number(productId));

  if (existingIndex >= 0) {
    const oldQty = Number(cart[existingIndex].quantity || 1);
    cart[existingIndex].quantity = oldQty + 1;
  } else {
    cart.push({
      productId: product.id,
      productName: product.productName || "Sản phẩm",
      price: Number(product.price || 0),
      imageUrl: product.imageUrl || "./img/ts1.jpg",
      quantity: 1
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  alert("Đã thêm sản phẩm vào giỏ hàng.");
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

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "Liên hệ";
  }

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

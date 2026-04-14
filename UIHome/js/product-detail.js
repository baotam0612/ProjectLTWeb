const PRODUCT_API = "http://localhost:8081/api/public/products";
const ORDER_API = "http://localhost:8081/api/user/orders";
const LOGIN_PAGE_URL = "http://localhost:5173/login";

let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  loadProductDetail();
});

async function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    document.getElementById("productDetailContent").innerHTML =
      '<div class="text-center py-5 w-100"><h3>Không tìm thấy sản phẩm!</h3><a href="sanpham.html" class="btn btn-primary mt-3">Quay lại danh sách</a></div>';
    return;
  }

  try {
    const response = await fetch(`${PRODUCT_API}/${productId}`);
    if (!response.ok) throw new Error("Product fetch failed");

    currentProduct = await response.json();
    renderProductDetail(currentProduct);
  } catch (error) {
    console.error("Error loading detail:", error);
    document.getElementById("productDetailContent").innerHTML =
      '<div class="text-center py-5 w-100"><h3 class="text-danger">Lỗi tải dữ liệu sản phẩm!</h3><a href="sanpham.html" class="btn btn-outline-secondary mt-3">Quay lại danh sách</a></div>';
  }
}

function renderProductDetail(product) {
  const container = document.getElementById("productDetailContent");
  const formattedPrice = product.price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(product.price)
    : "Liên hệ";
  const imageUrl = product.imageUrl || "./img/ts1.jpg";
  const desc =
    product.description || "Chưa có mô tả chi tiết cho sản phẩm này.";
  const detailHtml = renderProductDetails(product.productDetails || []);

  container.innerHTML = `
    <div class="detail-image-side">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.productName || "Sản phẩm")}">
    </div>
    <div class="detail-info-side">
      <h1 class="detail-name">${escapeHtml(product.productName || "Sản phẩm")}</h1>
      <div class="detail-price">${formattedPrice}</div>

      <div class="detail-desc-title">Thông tin sản phẩm</div>
      <div class="detail-description">${escapeHtml(desc)}</div>

      <div class="detail-desc-title">Chi tiết sản phẩm</div>
      ${detailHtml}

      <div class="detail-actions">
        <button onclick="openOrderModal()" class="btn-buy-now">Đặt hàng ngay</button>
        <a href="sanpham.html" class="btn-back">Quay lại</a>
      </div>
    </div>
  `;
}

function renderProductDetails(details) {
  if (!Array.isArray(details) || details.length === 0) {
    return '<div class="detail-empty">Sản phẩm chưa có dữ liệu ProductDetail.</div>';
  }

  return `
    <div class="detail-grid">
      ${details
        .map(
          (detail) => `
            <div class="detail-card">
              <div class="detail-item"><span>ID chi tiết:</span><strong>${detail.productDetailID ?? "-"}</strong></div>
              <div class="detail-item"><span>Chất liệu:</span><strong>${escapeHtml(detail.materialName || "-")}</strong></div>
              <div class="detail-item"><span>Mã chất liệu:</span><strong>${detail.materialID ?? "-"}</strong></div>
              <div class="detail-item"><span>Trọng lượng tham chiếu:</span><strong>${formatWeight(detail.referenceWeight)}</strong></div>
              <div class="detail-item"><span>Thành phần:</span><strong>${escapeHtml(detail.composition || "-")}</strong></div>
              <div class="detail-item"><span>Tồn kho:</span><strong>${detail.stockQuantity ?? "-"}</strong></div>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function formatWeight(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `${value} g`;
}

function openOrderModal() {
  const token =
    localStorage.getItem("auth_token") || localStorage.getItem("token");
  if (!token) {
    alert("Vui lòng đăng nhập để đặt hàng!");
    window.location.href = LOGIN_PAGE_URL;
    return;
  }

  const overlay = document.getElementById("orderOverlay");
  const nameField = document.getElementById("orderProductName");
  const addressInput = document.getElementById("shippingAddress");

  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  if (user.address) addressInput.value = user.address;

  nameField.innerText =
    "Sản phẩm: " + (currentProduct?.productName || "Sản phẩm");
  overlay.style.display = "flex";
}

function closeOrderModal() {
  document.getElementById("orderOverlay").style.display = "none";
}

document
  .getElementById("confirmOrderBtn")
  ?.addEventListener("click", async () => {
    const address = document.getElementById("shippingAddress").value;
    const quantity = parseInt(
      document.getElementById("orderQuantity").value || "1",
      10,
    );
    const paymentMethod = document.getElementById("paymentMethod")?.value || "Thanh toán khi nhận hàng";

    if (!address) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    if (isNaN(quantity) || quantity < 1) {
      alert("Số lượng không hợp lệ!");
      return;
    }

    const token =
      localStorage.getItem("auth_token") || localStorage.getItem("token");

    try {
      const response = await fetch(ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: currentProduct.id,
          quantity,
          shippingAddress: address,
          paymentMethod
        }),
      });

      if (response.ok) {
        alert("Đặt hàng thành công!");
        closeOrderModal();
      } else {
        const error = await response.text();
        alert("Đặt hàng thất bại: " + error);
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Có lỗi xảy ra khi đặt hàng.");
    }
  });

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

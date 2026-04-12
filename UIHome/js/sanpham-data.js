document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

async function loadProducts() {
    try {
        // Lấy categoryId từ URL (nếu có)
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('categoryId');
        
        let apiUrl = "http://localhost:8081/api/public/products";
        if (categoryId) {
            apiUrl = `http://localhost:8081/api/public/products/category?categoryId=${categoryId}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        
        const productsContainer = document.getElementById("products");
        if (!productsContainer) return;
        
        productsContainer.innerHTML = ""; // Xóa dữ liệu cứng
        
        if (products.length === 0) {
            productsContainer.innerHTML = `<div class="col-12"><p class="text-center">Chưa có sản phẩm nào trong danh mục này.</p></div>`;
            return;
        }

        products.forEach(item => {
            // Định dạng giá tiền VNĐ
            const formattedPrice = item.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price) : 'Liên hệ';
            const imageUrl = item.imageUrl || './img/ts1.jpg'; // Ảnh mặc định nếu thiếu
            const desc = item.description || 'Chưa có mô tả';

            const html = `
                <div class="col-4 mb-4">
                    <div class="inner-box" style="height: 100%; border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                        <div class="inner-img" style="text-align: center; margin-bottom: 15px;">
                            <img src="${imageUrl}" alt="${item.productName}" style="max-width: 100%; height: 250px; object-fit: cover;">
                        </div>
                        <div class="inner-content">
                            <h4 class="inner-name" style="font-size: 1.1rem; min-height: 48px;">${item.productName}</h4>
                            <div class="inner-desc" style="font-size: 0.9rem; color: #666; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${desc}</div>
                            <div class="inner-gia" style="font-weight: bold; color: #d32f2f;">Giá: ${formattedPrice}</div>
                        </div>
                    </div>
                </div>
            `;
            productsContainer.innerHTML += html;
        });
    } catch (error) {
        console.error("Lỗi khi load products:", error);
        const productsContainer = document.getElementById("products");
        if (productsContainer) {
            productsContainer.innerHTML = `<div class="col-12"><p class="text-center text-danger">Đã xảy ra lỗi khi tải dữ liệu sản phẩm.</p></div>`;
        }
    }
}

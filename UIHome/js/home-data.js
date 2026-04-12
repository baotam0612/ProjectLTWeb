document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadFeaturedProducts();
});

// Danh sách hình ảnh ngẫu nhiên hoặc mặc định cho danh mục vì trong DB chưa có cột ảnh cho Category
const categoryImages = [
    "./img/nhan.png",
    "./img/vong_co.png",
    "./img/vongtay.jpg",
    "./img/bongtai.jpg",
    "./img/vongchan.png",
    "./img/trangsuccuoi.png",
    "./img/charm.png"
];

async function loadCategories() {
    try {
        const response = await fetch("http://localhost:8081/api/public/categories");
        const categories = await response.json();
        
        const categoryContainer = document.getElementById("categoryList");
        if (!categoryContainer) return;
        
        categories.forEach((cat, index) => {
            // Lấy ảnh tuần hoàn từ mảng
            const imgPath = categoryImages[index % categoryImages.length]; 
            
            const html = `
                <div class="col-4 mb-4">
                    <a href="sanpham.html?categoryId=${cat.id}" style="text-decoration: none; color: inherit;">
                        <div class="inner-box" value="${cat.id}">
                            <img src="${imgPath}" alt="${cat.categoryName}">
                            <div class="inner-name">${cat.categoryName}</div>
                        </div>
                    </a>
                </div>
            `;
            categoryContainer.innerHTML += html;
        });
    } catch (error) {
        console.error("Lỗi khi load categories:", error);
    }
}

async function loadFeaturedProducts() {
    try {
        const response = await fetch("http://localhost:8081/api/public/products");
        const products = await response.json();
        
        const productContainer = document.querySelector(".section-four .inner-button .row");
        const mainImg = document.querySelector("#main-img");
        const contentDesc = document.querySelector("#content");
        
        if (!productContainer) return;
        
        productContainer.innerHTML = ""; // Xóa dữ liệu cứng
        
        // Chỉ lấy tối đa 6 sản phẩm nổi bật
        const featuredProducts = products.slice(0, 6);
        
        if (featuredProducts.length > 0) {
            // Set sản phẩm đầu tiên làm mặc định hiển thị
            mainImg.src = featuredProducts[0].imageUrl || "./img/ts1.jpg";
            contentDesc.innerText = featuredProducts[0].description || "Đang cập nhật mô tả...";
        }
        
        featuredProducts.forEach((prod, index) => {
            const isActive = index === 0 ? "active" : "";
            const imgUrl = prod.imageUrl || "./img/ts1.jpg";
            const desc = prod.description || "Chưa có mô tả cho sản phẩm này.";
            
            const html = `
                <div class="col-4 mb-3">
                    <button class="tab-btn ${isActive}" inner-img="${imgUrl}" inner-desc="${desc.replace(/"/g, '&quot;')}">
                        ${prod.productName}
                    </button>
                </div>
            `;
            productContainer.innerHTML += html;
        });
        
        // Gắn lại sự kiện cho các nút tab vừa được tạo mới (thay thế logic của section-four.js)
        reattachTabEvents();
        
    } catch (error) {
        console.error("Lỗi khi load products:", error);
    }
}

function reattachTabEvents() {
    const bt = document.querySelectorAll('.section-four .tab-btn');
    const mainImg = document.querySelector('#main-img');
    const contentDesc = document.querySelector('#content');
    
    bt.forEach(button => {
        button.addEventListener('click', function() {
            document.querySelector('.tab-btn.active')?.classList.remove('active');
            this.classList.add('active');
            
            const newImg = this.getAttribute('inner-img');
            const newDesc = this.getAttribute('inner-desc');

            if(mainImg) mainImg.src = newImg;
            if(contentDesc) contentDesc.innerText = newDesc;
        });
    });
}

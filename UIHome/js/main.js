/**
 * Hàm nạp các file HTML vào các thẻ có thuộc tính [data-include]
 */
async function includeHTML() {
    // 1. Tìm tất cả các thẻ có thuộc tính "data-include"
    const elements = document.querySelectorAll("[data-include]");
    
    // 2. Lặp qua từng phần tử để xử lý
    for (const el of elements) {
        const file = el.getAttribute("data-include");
        
        try {
            // 3. Sử dụng fetch để lấy nội dung file
            const response = await fetch(file);
            
            if (response.ok) {
                const data = await response.text();
                // 4. Chèn nội dung vào thẻ
                el.innerHTML = data;
                // 5. Xóa thuộc tính để tránh nạp lại nhiều lần
                el.removeAttribute("data-include");
            } else {
                console.error(`Không thể nạp file: ${file}`);
            }
        } catch (error) {
            console.error("Lỗi khi lắp ghép giao diện:", error);
        }
    }
}

// Chạy hàm ngay khi toàn bộ cấu trúc trang được tải xong
document.addEventListener("DOMContentLoaded", includeHTML);
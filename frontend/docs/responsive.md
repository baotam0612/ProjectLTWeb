# Giao diện responsive

Trang khách hàng và trang quản trị dùng bố cục cho điện thoại, tablet và desktop.

- Menu khách hàng thu gọn dưới 992px; menu quản trị thu gọn dưới 1024px. Có thể đóng bằng phím Escape. Menu quản trị đóng khi chuyển trang và giữ focus bàn phím trong menu khi mở trên mobile.
- Lưới thương hiệu, danh mục và sản phẩm thay đổi số cột theo chiều rộng. Trang chi tiết sản phẩm xếp ảnh và nội dung theo chiều dọc dưới 992px.
- Footer tự chia cột; nút sản phẩm, giỏ hàng và thông tin dài tự xuống dòng.
- Bảng quản trị cuộn ngang trong vùng bảng. Hộp thoại cuộn dọc theo chiều cao màn hình, biểu mẫu nhiều cột chuyển về một cột trên mobile.
- Các trang đăng nhập, đăng ký, xác minh và tài khoản có khoảng cách và kích thước input phù hợp với điện thoại.

CSS khách hàng nằm trong `src/home/styles/responsive.css`, được nạp sau các stylesheet hiện có trong `src/main.jsx`. CSS quản trị dùng `src/admin/styles/dashboard.css` cùng các lớp responsive trong component.

Chạy từ thư mục `frontend`:

```powershell
npm run dev
npm run build
```

Kiểm tra giao diện bằng trình duyệt ở các chiều rộng 320, 390, 768, 1024 và 1440px, với dữ liệu mẫu gồm tên sản phẩm dài, email dài và giỏ hàng có sản phẩm. Dữ liệu API được mô phỏng để kiểm tra bố cục; kiểm tra này không xác nhận nghiệp vụ backend.

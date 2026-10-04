# Phân trang và tồn kho

Chạy `migrations/V20261004__product_inventory.sql` trên database MySQL hiện có **trước khi khởi động backend mới**. Không dùng `ddl-auto=create` hoặc `create-drop` với database đang có dữ liệu.

Migration thêm `product.quantity`, sao chép tổng `ProductDetail.StockQuantity` theo từng sản phẩm, đặt mặc định 0 và ràng buộc không âm. Chạy lại không ghi đè tồn kho mới. `ProductDetail.StockQuantity` được giữ lại để đối chiếu dữ liệu cũ; ứng dụng dùng `product.quantity` làm nguồn tồn kho. Mô hình hiện không có lựa chọn biến thể/size khi đặt hàng nên tồn kho được quản lý ở cấp sản phẩm.

Đơn hàng mới trừ tồn kho trong cùng transaction với việc tạo đơn và thanh toán, dùng khóa ghi để tránh bán vượt số lượng khi có nhiều yêu cầu đồng thời. `order.inventoryReserved` đánh dấu các đơn đã trừ tồn kho; hủy đơn hoàn lại đúng một lần, mở lại đơn kiểm tra và trừ tồn kho lại. Đơn cũ mặc định chưa trừ tồn kho, nên hủy đơn cũ không làm tăng số lượng.

Các API quản trị nhận `page` (bắt đầu từ 0), `size` (1–100, mặc định 10), `q`, và bộ lọc phù hợp:

| API | Bộ lọc |
| --- | --- |
| `/api/admin/users?page=0&size=10` | `q` theo tài khoản, tên, email, điện thoại, địa chỉ |
| `/admin/products?page=0&size=10` | `q`, `category` |
| `/admin/categorys?page=0&size=10` | `q` |
| `/admin/materials?page=0&size=10` | `q` |
| `/admin/orders?page=0&size=10` | `status` |
| `/admin/payments?page=0&size=10` | `status` |

Kết quả gồm `content`, `number`, `size`, `totalElements`, `totalPages`; tìm kiếm và lọc diễn ra trong database trước khi phân trang. Sắp xếp ID giảm dần. API thanh toán trả thêm `summary` tổng số thanh toán, số thành công và tổng tiền trên toàn bộ dữ liệu, để các thẻ thống kê không phụ thuộc trang hiện tại. Các yêu cầu không có `page` vẫn giữ định dạng danh sách cũ cho dashboard và các client hiện có.

Thay đổi này sửa phân trang và mô hình tồn kho. Những phần thiết kế khác như thông tin đăng nhập trùng giữa `users` và `account`, cùng quan hệ cascade ở một số entity, cần được rà soát riêng trước khi thay đổi schema hoặc di chuyển dữ liệu.

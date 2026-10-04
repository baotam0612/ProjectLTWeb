# ProjectLTWeb

Ứng dụng gồm backend Spring Boot và hai frontend React dùng chung dependencies, cấu hình Vite và `node_modules`, chạy cùng một cổng.

```text
backend/                 Spring Boot API
frontend/
  public/img/            Ảnh dùng chung
  index.html             Entry HTML duy nhất
  src/admin/             Ứng dụng quản trị, phục vụ dưới /admin
  src/home/              Ứng dụng khách hàng, phục vụ tại /
  package.json           Dependencies và scripts dùng chung
  vite.config.js         Cấu hình Vite dùng chung
```

## Chạy frontend

Cài dependencies một lần từ thư mục `frontend`:

```powershell
cd frontend
npm install
```

Chạy một dev server:

```powershell
npm run dev
```

Trang khách hàng chạy tại `http://localhost:5173`; trang quản trị tại `http://localhost:5173/admin`. Vite chuyển tiếp `/api` tới backend ở cổng `8081`.

Build cả hai app bằng `npm run build`.

## Chạy backend

```powershell
cd backend
mvn spring-boot:run
```

Cấu hình riêng cho máy phát triển có thể đặt trong `backend/application-local.properties`; file này được tự nạp khi chạy từ thư mục gốc hoặc thư mục `backend` và được loại khỏi Git. Khóa JWT local phải là chuỗi Base64 của ít nhất 32 byte ngẫu nhiên; không đưa khóa vào repository. Biến `APP_JWT_SECRET` được ưu tiên khi cấu hình local sử dụng `${APP_JWT_SECRET:...}`.

Nếu cấu hình local dùng `app.admin.password=${APP_ADMIN_PASSWORD:}`, backend bỏ qua bước tạo admin khi biến này chưa được đặt. Để bật bước tạo admin, đặt `APP_ADMIN_PASSWORD` dài ít nhất 12 ký tự trước khi chạy.

Backend cần cấu hình database, SMTP, JWT và tài khoản admin qua biến môi trường theo cấu hình ứng dụng. Không commit secret hoặc file `.env` lên repository.

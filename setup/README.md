# 🛠 Hướng dẫn Cài đặt và Triển khai Hệ thống "Jobportal" 🚀

Thư mục `setup` này chứa các tài liệu, cấu hình và tệp cơ sở dữ liệu mẫu phục vụ cho việc cài đặt và chạy thử nghiệm dự án Jobportal dễ dàng nhất.

---

## 📁 Danh sách tệp tin trong thư mục `setup`
1.  **[schema_and_seed.sql](file:///d:/dotnet/jobportal/setup/schema_and_seed.sql):** Tập lệnh SQL hoàn chỉnh chứa toàn bộ lược đồ cơ sở dữ liệu (Database Schema), bao gồm cấu trúc bảng, khóa ngoại, chỉ mục và toàn bộ dữ liệu seed thử nghiệm (doanh nghiệp lớn, việc làm chi tiết, tài khoản demo).
2.  **[README.md](file:///d:/dotnet/jobportal/setup/README.md):** Tài liệu hướng dẫn này.

---

## ⚙️ Yêu cầu môi trường (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
*   **Hệ điều hành:** Windows 10/11, macOS, hoặc Linux.
*   **.NET SDK:** Phiên bản [8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) hoặc mới hơn.
*   **Node.js:** Phiên bản [18.x hoặc 20.x LTS](https://nodejs.org/).
*   **Cơ sở dữ liệu:** Microsoft SQL Server (LocalDB hoặc Express) hoặc Docker.
*   **Docker Desktop (Tùy chọn):** Để chạy toàn bộ hệ thống bằng Docker Compose một cách nhanh chóng.

---

## 🗄️ Cấu hình và Khởi tạo Cơ sở dữ liệu

Bạn có 3 lựa chọn để khởi tạo cơ sở dữ liệu SQL Server:

### Cách 1: Sử dụng Docker Compose (Khuyên dùng - Nhanh nhất)
Docker sẽ tự động tải ảnh SQL Server 2022, tạo cơ sở dữ liệu, chạy Migration để tạo bảng và nạp dữ liệu mẫu mà bạn không cần phải cài đặt SQL Server cục bộ trên máy.
1.  Mở terminal tại thư mục gốc của dự án.
2.  Chạy lệnh:
    ```bash
    docker-compose -f docker/docker-compose.yml up --build
    ```
3.  Docker sẽ dựng 3 container: CSDL SQL Server, API Backend (cổng 5067) và Web Frontend (cổng 5173). Hệ thống sẵn sàng sử dụng ngay!

---

### Cách 2: Sử dụng Entity Framework Core Migrations (Dành cho Lập trình viên)
Nếu máy bạn đã cài sẵn SQL Server cục bộ:
1.  Mở file `src/backend/JobPortal.API/appsettings.json`, chỉnh sửa chuỗi kết nối tại `DefaultConnection` trỏ tới Server của bạn:
    ```json
    "ConnectionStrings": {
      "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=JobPortalDb;Trusted_Connection=True;TrustServerCertificate=True;"
    }
    ```
2.  Mở terminal tại thư mục `src/backend/` và chạy lệnh cập nhật database:
    ```bash
    # Cài đặt công cụ EF Core toàn cục nếu chưa có
    dotnet tool install --global dotnet-ef

    # Thực thi các bản Migration để tự động cấu trúc cơ sở dữ liệu
    dotnet ef database update --project JobPortal.Infrastructure --startup-project JobPortal.API
    ```
3.  **Lưu ý:** Backend đã tích hợp sẵn cơ chế **Tự động chạy Migration khi khởi động**. Do đó, chỉ cần bạn sửa connection string chính xác, ngay lần đầu tiên bạn chạy dự án backend bằng `dotnet run`, hệ thống sẽ tự động cấu hình cơ sở dữ liệu cho bạn.

---

### Cách 3: Nhập dữ liệu thủ công từ file SQL Script (SSMS hoặc Azure Data Studio)
Dành cho trường hợp bạn muốn tạo database thủ công:
1.  Mở SQL Server Management Studio (SSMS) hoặc Azure Data Studio và kết nối vào SQL Server của bạn.
2.  Tạo một cơ sở dữ liệu trống mang tên `JobPortalDb`:
    ```sql
    CREATE DATABASE JobPortalDb;
    ```
3.  Mở file SQL [schema_and_seed.sql](file:///d:/dotnet/jobportal/setup/schema_and_seed.sql) nằm trong thư mục `setup` này.
4.  Chọn cơ sở dữ liệu `JobPortalDb` và thực thi (Execute / F5) toàn bộ nội dung file SQL để hoàn tất khởi tạo bảng biểu và dữ liệu.
5.  Cập nhật connection string trong file `appsettings.json` trỏ tới DB này.

---

## 🏃 Hướng dẫn Khởi chạy thủ công từng phần

### 1. Khởi động Backend API
1.  Mở terminal tại thư mục: `src/backend/`.
2.  Khởi chạy ứng dụng:
    ```bash
    dotnet run --project JobPortal.API
    ```
3.  Màn hình Console hiển thị ứng dụng đang chạy tại: `http://localhost:5067`.
4.  Bạn có thể truy cập Swagger UI để thử nghiệm API tại: `http://localhost:5067/swagger/index.html`.

### 2. Khởi động Frontend Web
1.  Mở một cửa sổ terminal mới tại thư mục: `src/frontend/job-portal-web/`.
2.  Cài đặt các gói thư viện Node.js:
    ```bash
    npm install
    ```
3.  Đảm bảo file `.env` đã được cấu hình đúng cổng API Backend:
    ```env
    VITE_API_URL=http://localhost:5067/api
    VITE_BASE_URL=http://localhost:5067
    ```
4.  Chạy ứng dụng React ở môi trường Dev:
    ```bash
    npm run dev
    ```
5.  Mở trình duyệt truy cập: `http://localhost:5173`.

---

## 👥 Danh sách Tài khoản Kiểm thử (Demo Accounts)

Hệ thống đã nạp sẵn dữ liệu của các doanh nghiệp lớn (FPT, Techcombank, Vinamilk, Grab, VNG...) cùng danh sách công việc tương ứng. Bạn có thể sử dụng các tài khoản sau để đăng nhập kiểm thử:

| Vai trò (Role) | Email | Mật khẩu | Chức năng kiểm thử |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vieclamviet.vn` | `Admin@123` | Quản trị ngành nghề, xét duyệt tin đăng tuyển dụng, ghim tin HOT lên trang chủ, theo dõi giám sát số liệu hệ thống. |
| **Employer** | `recruitment@fpt.com` | `Employer@123` | Quản lý tuyển dụng của FPT Software, cập nhật logo/ảnh bìa công ty, đăng tin tuyển dụng mới (Tag chips kỹ năng), xem danh sách CV và phê duyệt hồ sơ ứng viên. |
| **Employer** | `careers@grab.com` | `Employer@123` | Quản lý tuyển dụng của Grab Vietnam, xem tin đăng và quản lý hồ sơ ứng viên Grab. |
| **Candidate** | `candidate@gmail.com` | `Candidate@123` | Đăng nhập tài khoản ứng viên, chỉnh sửa hồ sơ, tải lên CV mới, đổi Avatar tương tác, lưu việc làm yêu thích (Bookmark trái tim), nộp hồ sơ (Apply) và theo dõi trạng thái duyệt CV. |

---
*Chúc Thầy Cô và các bạn cài đặt thành công! Nếu gặp bất kỳ khó khăn nào trong quá trình setup, vui lòng liên hệ Tạ Thanh Tùng.* 💚

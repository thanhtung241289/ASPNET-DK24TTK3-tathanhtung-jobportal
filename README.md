# 💼 Nền Tảng Tuyển Dụng Trực Tuyến "Jobportal" 🚀

[![.NET 8](https://img.shields.io/badge/.NET-8.0-blueviolet.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://www.docker.com/)
[![Database](https://img.shields.io/badge/Database-SQL_Server-red.svg)](https://www.microsoft.com/en-us/sql-server/)

**Jobportal** là một nền tảng tuyển dụng và tìm kiếm việc làm trực tuyến hiện đại, kết nối nhanh chóng và hiệu quả giữa **Ứng viên** và **Nhà tuyển dụng**, dưới sự quản trị và xét duyệt chặt chẽ từ **Quản trị viên (Admin)**. Dự án được phát triển với sự kết hợp giữa hiệu năng mạnh mẽ của **.NET 8 (Clean Architecture)** ở Backend và sự linh hoạt, giao diện Violet tối giản, sang trọng của **ReactJS (Vite)** ở Frontend.

---

## 🎨 Điểm Nổi Bật của Hệ Thống & Giao Diện
*   **Chủ đề Violet Hiện đại:** Giao diện được thiết kế đồng bộ theo phong cách tối giản với tông màu chủ đạo Violet (tím), tạo cảm giác thanh lịch, chuyên nghiệp và thân thiện với người dùng.
*   **Trải nghiệm Tương tác Mượt mà:** Tích hợp bộ thư viện biểu tượng **Lucide Icons**, căn chỉnh layout dạng Grid chuẩn xác, các hiệu ứng hover mượt mà và thông báo hệ thống trực quan qua **Toast Notifications**.
*   **Hồ sơ Kỹ năng Tương tác:** Ứng viên có thể quản lý kỹ năng của mình dưới dạng các thẻ tag thông minh (Skills Tag Chips) trực quan.
*   **Dashboard Thống kê Đa chiều:** Cung cấp số liệu thống kê thời gian thực dạng biểu đồ cho cả Admin (quản trị hệ thống) và Nhà tuyển dụng (theo dõi CV ứng tuyển).

---

## 📁 Cấu Trúc Thư Mục Dự Án

Hệ thống được tổ chức khoa học để dễ dàng mở rộng và bảo trì:

```text
ASPNET-DK24TTK3-tathanhtung-jobportal/
├── docker/                 # Cấu hình container Docker (docker-compose, v.v.)
├── progress-report/        # Báo cáo tiến độ chi tiết qua các giai đoạn
│   ├── Giai doan 1.md      # Chi tiết Giai đoạn 1 (Thiết kế DB, Core API)
│   └── Giai doan 2.md      # Chi tiết Giai đoạn 2 (UI/UX Violet, Premium Dashboard, Docker)
├── setup/                  # Tài liệu cài đặt và SQL Script seed dữ liệu mẫu
│   ├── schema_and_seed.sql # Script tạo bảng và nạp sẵn dữ liệu thử nghiệm
│   └── README.md           # Hướng dẫn chi tiết thiết lập môi trường
├── src/                    # Mã nguồn chính của dự án
│   ├── backend/            # Giải pháp .NET 8 Web API (Clean Architecture)
│   └── frontend/           # Ứng dụng ReactJS (Vite)
└── thesis/                 # Tài liệu thuyết trình, tài liệu đặc tả nghiệp vụ
    └── docs/
        └── Khao_sat_nghiep_vu.md # Tài liệu đặc tả nghiệp vụ & database schema
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend API:
*   **.NET 8 Web API** làm nền tảng phát triển API RESTful.
*   **Clean Architecture** chia cấu trúc thành 4 lớp rõ ràng: *Domain*, *Application*, *Infrastructure*, và *API*.
*   **Entity Framework Core** hỗ trợ ánh xạ thực thể (ORM) và quản lý cơ sở dữ liệu qua Migrations.
*   **JWT Token (JSON Web Token)** xử lý xác thực và phân quyền người dùng (Role-based Authorization).
*   **Swagger UI** dùng để tài liệu hóa và chạy thử nghiệm các endpoints API.

### Frontend Web:
*   **ReactJS (Vite)** giúp tối ưu hóa thời gian build và tải trang cực nhanh.
*   **React Router DOM** quản lý định tuyến trang (Client-side routing).
*   **Axios** tích hợp Bearer Token gửi yêu cầu HTTP đến Backend.
*   **Lucide React** cung cấp hệ thống icon sắc nét, hiện đại.

### Cơ sở dữ liệu & Triển khai:
*   **SQL Server** lưu trữ dữ liệu an toàn với các ràng buộc khóa ngoại chặt chẽ.
*   **Docker & Docker Compose** hỗ trợ đóng gói và khởi chạy toàn bộ ứng dụng chỉ với một câu lệnh.

---

## 👥 Các Phân Hệ & Tính Năng Chính

### 1. Phân hệ Ứng viên (Candidate / Seeker)
*   **Xác thực:** Đăng ký tài khoản, đăng nhập và bảo mật thông tin.
*   **Hồ sơ cá nhân:** Cập nhật thông tin cá nhân, ảnh đại diện (avatar), vị trí mong muốn và danh sách kỹ năng chuyên môn.
*   **Quản lý CV:** Tải lên nhiều file CV dạng PDF, thiết lập một file CV mặc định phục vụ cho việc ứng tuyển nhanh.
*   **Tìm kiếm & Lọc việc làm:** Lọc tin tuyển dụng theo từ khóa, ngành nghề, địa điểm, mức lương và hình thức làm việc.
*   **Đánh giá độ tương tương thích:** Tự động tính toán mức độ tương thích kỹ năng (%) giữa hồ sơ ứng viên và yêu cầu tuyển dụng.
*   **Tương tác:** Lưu việc làm yêu thích (Bookmark trái tim), ứng tuyển trực tuyến bằng CV mặc định.
*   **Theo dõi ứng tuyển:** Quản lý trạng thái xử lý CV (Mới nộp, Đã xem, Phỏng vấn, Từ chối) theo thời gian thực.

### 2. Phân hệ Nhà tuyển dụng (Employer)
*   **Hồ sơ doanh nghiệp:** Cài đặt thông tin giới thiệu chi tiết, địa chỉ trụ sở, website, quy mô nhân sự và cập nhật ảnh logo/ảnh bìa công ty.
*   **Quản lý tin tuyển dụng:** Đăng tin tuyển dụng mới (hỗ trợ nhập tag kỹ năng tùy chỉnh), sửa tin, xóa tin. Sau khi tạo/sửa tin sẽ ở trạng thái chờ Admin duyệt để đảm bảo chất lượng.
*   **Dashboard tuyển dụng:** Xem số lượng CV ứng tuyển theo từng tin tuyển dụng.
*   **Quản lý ứng viên:** Xem danh sách ứng viên đã nộp hồ sơ, tải trực tiếp CV PDF của ứng viên và cập nhật trạng thái duyệt hồ sơ (Đã xem, Hẹn phỏng vấn, Nhận việc, Từ chối).

### 3. Phân hệ Quản trị viên (Admin)
*   **Dashboard Tổng quan:** Biểu đồ thống kê số lượng việc làm, doanh nghiệp, CV ứng tuyển và cơ cấu ngành nghề.
*   **Quản lý danh mục:** Thêm, sửa, xóa các danh mục ngành nghề (chặn xóa danh mục nếu đang có tin tuyển dụng thuộc danh mục đó để đảm bảo toàn vẹn dữ liệu).
*   **Xét duyệt tin đăng:** Phê duyệt tin đăng hiển thị công khai hoặc Từ chối tin đăng (bắt buộc nhập lý do từ chối gửi về cho nhà tuyển dụng).
*   **Ghim tin nổi bật (Hot Jobs):** Bật/tắt trạng thái tin tuyển dụng nổi bật để đưa lên vị trí ưu tiên tại trang chủ.

---

## 🚀 Hướng Dẫn Cài Đặt Nhanh

Bạn có thể chạy dự án nhanh chóng bằng 2 cách dưới đây:

### Cách 1: Sử dụng Docker Compose (Nhanh & Khuyên dùng)
Yêu cầu máy tính cài đặt sẵn **Docker Desktop**.
1. Mở terminal tại thư mục gốc của dự án.
2. Khởi chạy Docker Compose:
   ```bash
   docker-compose -f docker/docker-compose.yml up --build
   ```
3. Hệ thống sẽ tự tạo Database, cấu hình bảng biểu, nạp sẵn dữ liệu test và khởi chạy:
   *   **Web Frontend:** Truy cập tại [http://localhost:5173](http://localhost:5173)
   *   **API Backend:** Truy cập tại [http://localhost:5067](http://localhost:5067)
   *   **Swagger API Docs:** Truy cập tại [http://localhost:5067/swagger/index.html](http://localhost:5067/swagger/index.html)

---

### Cách 2: Khởi chạy Thủ công bằng Lệnh (Local Development)
Vui lòng đọc tài liệu hướng dẫn chi tiết tại [setup/README.md](file:///d:/lam-muon/jobportal/ASPNET-DK24TTK3-tathanhtung-jobportal/setup/README.md) để biết cách cấu hình SQL Server Connection String và khởi chạy riêng biệt từng dịch vụ thông qua `.NET CLI` (`dotnet run`) và `npm run dev`.

---

## 👥 Danh Sách Tài Khoản Thử Nghiệm (Demo Accounts)

Sử dụng các tài khoản dưới đây để đăng nhập trải nghiệm đầy đủ các phân hệ chức năng:

| Vai trò (Role) | Tài khoản đăng nhập (Email) | Mật khẩu | Chức năng kiểm thử chính |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@vieclamviet.vn` | `Admin@123` | Phê duyệt/từ chối tin tuyển dụng, ghim tin HOT, quản trị ngành nghề, xem biểu đồ thống kê. |
| **Employer** | `recruitment@fpt.com` | `Employer@123` | Đăng tin, sửa/xóa tin tuyển dụng FPT Software, chỉnh sửa thông tin công ty, quản lý CV ứng viên nộp về. |
| **Employer** | `careers@grab.com` | `Employer@123` | Quản lý tuyển dụng của Grab Vietnam, xem tin đăng và quản lý hồ sơ ứng viên Grab. |
| **Candidate** | `candidate@gmail.com` | `Candidate@123` | Cập nhật hồ sơ cá nhân, chọn kỹ năng, tải lên CV PDF, ứng tuyển việc làm và theo dõi trạng thái đơn ứng tuyển. |

---
*Để tìm hiểu kỹ hơn về lộ trình xây dựng và thay đổi qua các mốc thời gian, vui lòng xem mục [Báo cáo tiến độ]
# Báo cáo Tiến độ - Giai đoạn 2: Nâng cấp Giao diện & Docker Hóa

Giai đoạn này tập trung vào việc tinh chỉnh giao diện người dùng, bổ sung các chức năng nâng cao cho Nhà tuyển dụng và Admin, khắc phục các lỗi hệ thống và đóng gói triển khai bằng Docker.

## 1. Tối ưu hóa Thiết kế & UI/UX Đồng bộ
*   **Chủ đề màu Violet (Violet Theme):** Chuyển đổi giao diện sang tone màu tím hiện đại, thanh lịch, tạo cảm giác chuyên nghiệp giống các nền tảng tuyển dụng hàng đầu.
*   **Icon & Layout:** Tích hợp bộ thư viện Lucide Icons, tinh chỉnh căn lề Grid và thiết kế lại trạng thái hoạt động của Navbar, nhãn hiển thị vai trò (Role Badges) động.
*   **Hồ sơ ứng viên:** Tái thiết kế trang thông tin cá nhân của ứng viên (Candidate Profile) đi kèm các thẻ kỹ năng (Skills Tag Chips) tương tác trực quan.

## 2. Dashboard Cao cấp & Tính năng Nâng cao
*   **Phân hệ Nhà tuyển dụng (Employer):** 
    *   Xây dựng trang Dashboard quản trị tuyển dụng cao cấp (Premium Employer Dashboard) giúp thống kê số lượng hồ sơ nhận được.
    *   Phát triển Module cài đặt thông tin doanh nghiệp (Company Settings) cho phép cập nhật thông tin giới thiệu, địa chỉ, website, quy mô và tải lên logo/ảnh bìa của công ty.
    *   Bổ sung chức năng chỉnh sửa và xóa tin tuyển dụng đã đăng (hỗ trợ cả frontend và backend).
    *   Hỗ trợ tạo/nhập các thẻ kỹ năng tùy chỉnh (Custom Skills) khi tạo tin tuyển dụng.
*   **Phân hệ Quản trị viên (Admin):**
    *   Xây dựng hàng đợi duyệt tin (Job Review Queue) giúp Admin phê duyệt hoặc từ chối tin tuyển dụng kèm theo lý do cụ thể.
    *   Tích hợp tính năng ghim tin tuyển dụng nổi bật (Hot Jobs) lên đầu trang chủ.
    *   Thêm module quản lý danh mục ngành nghề (Category Management).
    *   Dashboard hiển thị biểu đồ thống kê thực tế về số liệu toàn hệ thống.

## 3. Khắc phục Lỗi & Cải tiến Kỹ thuật
*   **Lỗi tải file & CSDL:** Giải quyết lỗi 400 Bad Request khi tải file CV PDF, sửa lỗi crash ràng buộc khóa ngoại (Foreign Key constraint crash) và cấu hình static files serving trên server để trả về file logo/CV chính xác.
*   **Trải nghiệm người dùng:** Chuẩn hóa hệ thống thông báo Toast (Toast Notifications), tối ưu hóa tốc độ chuyển hướng sau khi đăng nhập và khắc phục lỗi binding enum khi đăng tuyển dụng.
*   **Định dạng văn bản:** Hỗ trợ hiển thị văn bản xuống dòng tự động (newline formatting) đối với mô tả công việc và yêu cầu ứng viên.

## 4. Container hóa Hệ thống (Dockerization)
*   **Dockerfile:** Xây dựng Dockerfile tối ưu cho cả Backend (.NET 8 Web API) và Frontend (Vite + React).
*   **Docker Compose:** Cấu hình file `docker/docker-compose.yml` để thiết lập hệ thống gồm 3 dịch vụ liên kết: SQL Server, API Backend và Web Frontend, cho phép khởi động dự án chỉ với một dòng lệnh duy nhất.
# Báo cáo Tiến độ - Giai đoạn 1: Phân tích, Thiết kế & Xây dựng Nền tảng Core

Giai đoạn này tập trung vào việc thiết lập kiến trúc dự án, thiết kế cơ sở dữ liệu và xây dựng các chức năng cốt lõi cho cả Backend và Frontend.

## 1. Thiết lập Cấu trúc Dự án & Nghiệp vụ
*   **Mã nguồn & Tài liệu:** Khởi tạo cấu trúc thư mục chuẩn để quản lý mã nguồn (`src/`) và tài liệu nghiệp vụ (`thesis/docs/`).
*   **Thiết kế Cơ sở dữ liệu:** Hoàn thiện đặc tả cơ sở dữ liệu dựa trên tài liệu khảo sát nghiệp vụ [Khao_sat_nghiep_vu.md].
*   **Kiến trúc Backend:** Khởi tạo Solution .NET 8 Web API áp dụng mô hình Clean Architecture chia làm các tầng rõ rệt:
    *   `Domain`: Các thực thể cốt lõi (`User`, `SeekerProfile`, `Company`, `JobPost`, `Resume`, `Application`, v.v.) và Enum.
    *   `Application`: Chứa logic nghiệp vụ, DTOs, interfaces và xử lý dữ liệu.
    *   `Infrastructure`: Cấu hình DbContext, Entity Framework Core, kết nối SQL Server và triển khai repository.
    *   `API`: Controller, Middleware, cấu hình Authentication và Swagger.
*   **Kiến trúc Frontend:** Khởi tạo ứng dụng ReactJS bằng Vite, cấu hình các thư viện bổ trợ.

## 2. Phát triển Tính năng & API Cốt lõi (Backend)
*   **Xác thực & Bảo mật (Authentication):** Triển khai hệ thống đăng nhập, đăng ký và cấp mã xác thực JWT Token (Bearer Token).
*   **Tìm kiếm & Lọc việc làm:** Xây dựng API tìm kiếm việc làm nâng cao hỗ trợ lọc theo từ khóa, ngành nghề, địa điểm, hình thức làm việc và mức lương.
*   **Quản lý CV & Nộp tuyển:** Phát triển API tải file CV (PDF), lưu trữ và cấu hình CV mặc định để nộp nhanh. Triển khai API ứng tuyển (Apply Job) liên kết thông tin.
*   **Phê duyệt của Admin:** API xét duyệt tin tuyển dụng từ nhà tuyển dụng.
*   **Dữ liệu mẫu (Mock Data):** Thiết lập tệp Script SQL nạp dữ liệu mẫu phong phú của các công ty lớn và tin tuyển dụng chi tiết để phục vụ kiểm thử.

## 3. Xây dựng Giao diện Người dùng Cơ bản (Frontend)
*   **Trang Đăng nhập & Đăng ký:** Biểu mẫu xác thực và lưu trữ JWT Token vào LocalStorage để gửi kèm trong Bearer Header của mỗi request API.
*   **Trang Chủ & Tìm kiếm:** Tích hợp bộ lọc tìm kiếm việc làm trực quan.
*   **Trang Chi tiết Việc làm:** Hiển thị thông tin công việc, thông tin công ty và nút ứng tuyển nhanh.
*   **Trang Theo dõi Hồ sơ (Application Tracker):** Giúp ứng viên theo dõi danh sách việc làm đã ứng tuyển kèm trạng thái duyệt CV thời gian thực.
*   **Trang Đăng tin Tuyển dụng:** Giao diện cho nhà tuyển dụng nhập thông tin công việc cơ bản.
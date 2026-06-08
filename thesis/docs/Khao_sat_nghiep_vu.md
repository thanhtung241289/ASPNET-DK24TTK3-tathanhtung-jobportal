# NGHIỆP VỤ & CƠ SỞ DỮ LIỆU


## 1. KHẢO SÁT THỰC TẾ (THAM KHẢO TOPCV & FPT JOBS)

Hệ thống được học hỏi từ hai trang tuyển dụng lớn tại Việt Nam là TopCV và FPT Jobs với các đặc đặc điểm:

*   **Tham khảo từ TopCV:**
    *   Ứng viên có "Kho CV" để tải lên nhiều file PDF, chọn ra 1 file CV mặc định nộp nhanh.
    *   Có tính năng theo dõi xem hồ sơ của mình đang ở bước nào (Nhà tuyển dụng đã xem, Hẹn phỏng vấn, Nhận việc hay Từ chối).
    *   Tính điểm % tương thích kỹ năng của ứng viên so với mô tả công việc.
    *   Có nút Lưu (Trái tim) để đánh dấu các việc làm thích để xem lại sau.
*   **Tham khảo từ FPT Jobs:**
    *   Chia việc làm rõ ràng theo danh mục ngành nghề, kỹ năng cần thiết và nơi làm việc.
    *   Tin tuyển dụng do công ty đăng lên bắt buộc phải qua Admin duyệt mới được hiển thị công khai, tránh lừa đảo hoặc thông tin ảo. Nếu Admin từ chối thì phải ghi rõ lý do để công ty sửa lại.
*   **Áp dụng:** Kết hợp cả 2 mô hình trên: Ứng viên tải CV PDF lên ứng tuyển nhanh, đo % kỹ năng; Admin duyệt tin đăng và nhập lý do nếu từ chối duyệt.

---

## 2. NGHIỆP VỤ CỐT LÕI CỦA HỆ THỐNG

### Phân hệ Ứng viên:
- Đăng ký tài khoản, đăng nhập.
- Sửa thông tin cá nhân (họ tên, sđt, địa chỉ, ảnh đại diện) và chọn các thẻ kỹ năng của mình.
- Tải lên nhiều CV dạng file PDF, chọn 1 cái làm mặc định để nộp nhanh.
- Tìm việc làm theo từ khóa, lọc theo ngành nghề, địa điểm, hình thức (Fulltime/Parttime) và mức lương tối thiểu.
- Xem chi tiết việc làm, hệ thống tự động hiện điểm % tương thích kỹ năng.
- Lưu việc làm yêu thích (saved jobs).
- Nộp CV ứng tuyển và xem trạng thái đơn nộp (đã được xem chưa, có được gọi phỏng vấn không).

### Phân hệ Nhà tuyển dụng:
- Cập nhật thông tin công ty (tên, mô tả, website, quy mô) và up ảnh logo/ảnh bìa.
- Đăng tin tuyển dụng mới (sau khi đăng tin sẽ ở trạng thái chờ duyệt).
- Sửa tin tuyển dụng đã đăng (sửa xong sẽ quay về trạng thái chờ duyệt để Admin duyệt lại).
- Xóa tin tuyển dụng của công ty mình.
- Quản lý danh sách ứng viên nộp hồ sơ: xem thông tin, tải file CV PDF, đổi trạng thái đơn nộp (Đã xem, Phỏng vấn, Từ chối).

### Phân hệ Quản trị viên:
- Dashboard xem nhanh thống kê: tổng số việc làm, doanh nghiệp, CV ứng viên và biểu đồ ngành nghề.
- Xem danh sách tin đang chờ duyệt để bấm Duyệt (hiển thị công khai) hoặc Từ chối (bắt buộc nhập lý do từ chối).
- Ghim tin tuyển dụng nổi bật (tin HOT) lên trang chủ.
- Thêm, sửa, xóa các danh mục ngành nghề (chặn xóa nếu ngành nghề đó đang có tin tuyển dụng sử dụng).

---

## 3. THIẾT KẾ CÁC BẢNG CƠ SỞ DỮ LIỆU

Dưới đây là sơ đồ liên kết và cấu trúc chi tiết của 10 bảng dữ liệu thực tế đang chạy trong code:

### 3.2. Cấu trúc các bảng dữ liệu
1. **Users (Tài khoản người dùng)**
   - `Id`: Khóa chính (GUID).
   - `Email`: Email đăng nhập (độc nhất).
   - `PasswordHash`: Mật khẩu đã mã hóa.
   - `Role`: Vai trò (1: Admin, 2: Ứng viên Seeker, 3: Nhà tuyển dụng Employer).
   - `Status`: Trạng thái (Hoạt động, bị khóa).
   - `CreatedAt`: Ngày tạo tài khoản.

2. **SeekerProfiles (Hồ sơ ứng viên)**
   - `Id`: Khóa chính (GUID).
   - `UserId`: Khóa ngoại nối sang tài khoản `Users` (quan hệ 1-1).
   - `FullName`: Họ và tên ứng viên.
   - `Dob`: Ngày sinh.
   - `Gender`: Giới tính.
   - `Phone`: Số điện thoại.
   - `Address`: Địa chỉ.
   - `AvatarUrl`: Ảnh đại diện.
   - `Title`: Vị trí mong muốn (ví dụ: .NET Developer).
   - `Experience`: Kinh nghiệm làm việc.
   - `Education`: Học vấn.
   - `SkillsSummary`: Tóm tắt kỹ năng.
   - `Description`: Giới thiệu bản thân.

3. **Companies (Hồ sơ doanh nghiệp tuyển dụng)**
   - `Id`: Khóa chính (GUID).
   - `UserId`: Khóa ngoại nối sang tài khoản `Users` (quan hệ 1-1).
   - `CompanyName`: Tên công ty.
   - `LogoUrl`: Ảnh đại diện của công ty.
   - `CoverUrl`: Ảnh bìa của công ty.
   - `ShortDescription`: Giới thiệu ngắn.
   - `Address`: Địa chỉ trụ sở.
   - `CompanySize`: Quy mô nhân viên (ví dụ: 50-100 người).
   - `Website`: Trang web công ty.
   - `IsVerified`: Trạng thái xác thực (duyệt tích xanh).
   - `IsLocked`: Trạng thái khóa (nếu vi phạm).
   - `Description`: Giới thiệu chi tiết (dạng HTML).

4. **Categories (Danh mục ngành nghề)**
   - `Id`: Khóa chính (Số tự tăng).
   - `Name`: Tên ngành nghề (ví dụ: Công nghệ thông tin).

5. **Skills (Danh mục kỹ năng)**
   - `Id`: Khóa chính (Số tự tăng).
   - `Name`: Tên kỹ năng chuyên môn (ví dụ: ASP.NET, ReactJS).

6. **Locations (Danh mục Tỉnh thành)**
   - `Id`: Khóa chính (Số tự tăng).
   - `Name`: Tên tỉnh thành (ví dụ: TP. Hồ Chí Minh).

7. **JobPosts (Tin đăng tuyển dụng)**
   - `Id`: Khóa chính (GUID).
   - `CompanyId`: Khóa ngoại nối sang `Companies`.
   - `CategoryId`: Khóa ngoại nối sang `Categories`.
   - `Title`: Tiêu đề tin tuyển dụng.
   - `JobLevel`: Cấp bậc yêu cầu (Intern, Fresher, Junior, Senior...).
   - `WorkType`: Hình thức làm việc (FullTime, PartTime, Remote...).
   - `Quantity`: Số lượng tuyển.
   - `SalaryMin` / `SalaryMax`: Khoảng lương tối thiểu / tối đa.
   - `IsNegotiable`: Thỏa thuận lương (Đúng/Sai).
   - `Description`: Chi tiết công việc.
   - `Requirements`: Yêu cầu ứng viên.
   - `Benefits`: Quyền lợi ứng viên.
   - `ExpirationDate`: Ngày hết hạn nộp.
   - `Status`: Trạng thái tin đăng (Chờ duyệt, Đã đăng, Hết hạn, Từ chối).
   - `IsHot`: Ghim tin nổi bật lên trang chủ.
   - `CreatedAt`: Ngày tạo tin tuyển dụng.
   - *Ràng buộc Nhiều - Nhiều:* Liên kết với bảng `Skills` và `Locations`.

8. **Resumes (File CV của ứng viên)**
   - `Id`: Khóa chính (GUID).
   - `SeekerId`: Khóa ngoại nối sang hồ sơ ứng viên `SeekerProfiles`.
   - `FileName`: Tên gốc của file PDF tải lên.
   - `FileUrl`: Đường dẫn tải file trên server.
   - `IsDefault`: Có phải CV mặc định để nộp nhanh không.
   - `CreatedAt`: Ngày tải CV lên.

9. **Applications (Đơn ứng tuyển)**
   - `Id`: Khóa chính (GUID).
   - `JobId`: Khóa ngoại nối sang tin tuyển dụng `JobPosts`.
   - `SeekerId`: Khóa ngoại nối sang hồ sơ ứng viên `SeekerProfiles`.
   - `ResumeId`: Khóa ngoại nối sang CV `Resumes` cụ thể được chọn.
   - `Status`: Trạng thái đơn nộp (Mới nộp, Đã xem, Hẹn phỏng vấn, Nhận việc, Từ chối).
   - `AppliedAt`: Ngày nộp đơn.

10. **SavedJobs (Lưu tin tuyển dụng)**
    - `SeekerId`: Khóa chính kép (phần 1), trỏ tới `SeekerProfiles`.
    - `JobId`: Khóa chính kép (phần 2), trỏ tới `JobPosts`.
    - `SavedAt`: Ngày bấm lưu tin.

---

## 4. TÍNH BẢO MẬT & TOÀN VẸN CƠ SỞ DỮ LIỆU

- **Bảo mật phân quyền chéo (Cross-tenant):** Ở backend kiểm tra cực kỳ kỹ, chỉ có tài khoản nào đăng tin đó (Employer sở hữu tin) mới được quyền Sửa hoặc Xóa tin đăng của mình. Tránh việc công ty A sửa/xóa tin công ty B qua API.
- **Ràng buộc khóa ngoại khi xóa:**
  - *Xóa dây chuyền (Cascade Delete):* Xóa tài khoản hoặc hồ sơ ứng viên thì các CV đã upload và các đơn ứng tuyển liên quan sẽ bị hệ thống tự động xóa theo để dọn rác cơ sở dữ liệu.
  - *Chặn xóa (Restrict Delete):* Không cho phép xóa ngành nghề (Category) nếu có tin tuyển dụng đang thuộc ngành nghề đó, tránh lỗi mất liên kết dữ liệu.

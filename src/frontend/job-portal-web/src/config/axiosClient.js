// File: src/config/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. REQUEST INTERCEPTOR: Tự động đính kèm Token trước khi gửi API
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage (Nơi ta sẽ lưu sau khi login thành công)
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. RESPONSE INTERCEPTOR: Xử lý dữ liệu trả về và bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu Backend trả về thành công, chỉ lấy phần "data" để code UI gọn hơn
    return response.data;
  },
  (error) => {
    // Bắt các lỗi phổ biến từ Backend .NET gửi về
    const { response } = error;

    if (response) {
      if (response.status === 401) {
        // Lỗi 401: Không có quyền (Chưa đăng nhập hoặc token hết hạn)
        console.warn("Token hết hạn hoặc không hợp lệ. Đang đăng xuất...");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");

        // Chuyển hướng người dùng về trang đăng nhập
        window.location.href = "/login";
      } else if (response.status === 403) {
        // Lỗi 403: Cấm truy cập (Ví dụ: Ứng viên cố tình gọi API của Admin)
        alert("Bạn không có quyền thực hiện hành động này!");
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;

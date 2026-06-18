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

// Helper chuyển đổi thông điệp lỗi kỹ thuật sang tiếng Việt thân thiện
const friendlyErrorMap = {
  "The request field is required.":
    "Dữ liệu yêu cầu không hợp lệ hoặc bị thiếu.",
  "The JSON value could not be converted to JobPortal.Domain.Enums.JobLevel":
    "Cấp bậc chuyên môn được chọn không hợp lệ.",
  "The JSON value could not be converted to JobPortal.Domain.Enums.WorkType":
    "Hình thức làm việc được chọn không hợp lệ.",
  "The File field is required.": "Vui lòng chọn tệp tin tải lên.",
};

const extractErrorMessage = (error) => {
  if (!error) return "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau!";

  const data = error.response?.data;
  if (!data)
    return error.message || "Đã xảy ra lỗi kết nối mạng. Vui lòng thử lại!";

  // 1. Nếu backend trả về thông báo cụ thể
  if (data.message) return data.message;

  // 2. Nếu có lỗi validation chi tiết (ModelState của ASP.NET Core)
  if (data.errors && typeof data.errors === "object") {
    const errorMessages = [];
    Object.keys(data.errors).forEach((key) => {
      const messages = data.errors[key];
      if (Array.isArray(messages)) {
        messages.forEach((msg) => {
          let friendlyMsg = msg;
          for (const [techStr, friendlyStr] of Object.entries(
            friendlyErrorMap,
          )) {
            if (msg.includes(techStr)) {
              friendlyMsg = friendlyStr;
              break;
            }
          }
          errorMessages.push(friendlyMsg);
        });
      } else if (typeof messages === "string") {
        let friendlyMsg = messages;
        for (const [techStr, friendlyStr] of Object.entries(friendlyErrorMap)) {
          if (messages.includes(techStr)) {
            friendlyMsg = friendlyStr;
            break;
          }
        }
        errorMessages.push(friendlyMsg);
      }
    });

    if (errorMessages.length > 0) {
      const uniqueMessages = [...new Set(errorMessages)];
      return uniqueMessages.join(" | ");
    }
  }

  // 3. Nếu chỉ có tiêu đề lỗi
  if (data.title) {
    let friendlyTitle = data.title;
    for (const [techStr, friendlyStr] of Object.entries(friendlyErrorMap)) {
      if (data.title.includes(techStr)) {
        friendlyTitle = friendlyStr;
        break;
      }
    }
    return friendlyTitle;
  }

  return "Đã xảy ra lỗi không xác định.";
};

// 2. RESPONSE INTERCEPTOR: Xử lý dữ liệu trả về và bắt lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu Backend trả về thành công, chỉ lấy phần "data" để code UI gọn hơn
    return response.data;
  },
  (error) => {
    // Bắt các lỗi phổ biến từ Backend .NET gửi về
    const { response, config } = error;

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
        if (window.showToast) {
          window.showToast(
            "Bạn không có quyền thực hiện hành động này!",
            "error",
          );
        } else {
          alert("Bạn không có quyền thực hiện hành động này!");
        }
      } else {
        // Hiển thị thông báo lỗi bằng Toast cho các lỗi khác (400, 500, v.v...) nếu không được bỏ qua cấu hình
        if (!config?.skipErrorToast && window.showToast) {
          const errMsg = extractErrorMessage(error);
          window.showToast(errMsg, "error");
        }
      }
    } else {
      // Lỗi kết nối mạng (no response)
      if (!config?.skipErrorToast && window.showToast) {
        window.showToast(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng!",
          "error",
        );
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;

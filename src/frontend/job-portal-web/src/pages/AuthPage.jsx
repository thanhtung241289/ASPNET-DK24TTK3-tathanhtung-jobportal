// File: src/pages/AuthPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // State điều hướng chế độ Đăng nhập / Đăng ký
  const [loading, setLoading] = useState(false);

  // Khởi tạo state chung cho cả 2 form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Candidate", // Mặc định là Ứng viên, có thể chọn Employer
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- XỬ LÝ ĐĂNG NHẬP ---
        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
        });

        // Lưu thông tin xác thực vào kho lưu trữ trình duyệt (LocalStorage)
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", response.role); // Lưu chuỗi chữ: "Candidate", "Employer", "Admin"

        alert("Đăng nhập thành công!");

        // Điều hướng thông minh dựa trên Role sau khi nhận token
        if (response.role === "Admin") navigate("/admin/jobs");
        else if (response.role === "Employer") navigate("/employer/dashboard");
        else navigate("/");

        // F5 nhẹ để Header cập nhật lại trạng thái Auth (Nếu chưa làm Context phức tạp)
        window.location.reload();
      } else {
        // --- XỬ LÝ ĐĂNG KÝ ---
        await authApi.register({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        alert("Đăng ký tài khoản thành công! Hãy đăng nhập để tiếp tục.");
        setIsLogin(true); // Tự động chuyển về tab đăng nhập
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      alert(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-background px-4 py-12 animate-fade-in">
      <div className="bg-surface w-full max-w-md p-8 rounded-2xl shadow-card border border-gray-100 space-y-6">
        {/* Tiêu đề & Chuyển đổi trạng thái */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="text-primary-600 font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập tại đây"}
            </button>
          </p>
        </div>

        {/* Biểu mẫu Form chính */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lựa chọn Vai trò (Chỉ hiển thị khi Đăng ký) */}
          {!isLogin && (
            <div className="animate-slide-down">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Bạn tham gia với vai trò:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "Candidate" }))
                  }
                  className={`py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${formData.role === "Candidate" ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500" : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"}`}
                >
                  Ứng viên tìm việc
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "Employer" }))
                  }
                  className={`py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${formData.role === "Employer" ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500" : "border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100"}`}
                >
                  Nhà tuyển dụng
                </button>
              </div>
            </div>
          )}

          {/* Ô nhập Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
            />
          </div>

          {/* Ô nhập Mật khẩu */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              {isLogin && (
                <a
                  href="#"
                  className="text-xs text-primary-600 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              )}
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-surface transition-all"
            />
          </div>

          {/* Nút bấm Submit gửi dữ liệu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-sm transition-colors cursor-pointer active:scale-95 mt-2"
          >
            {loading
              ? "Đang xử lý..."
              : isLogin
                ? "Đăng Nhập"
                : "Đăng Ký Tài Khoản"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;

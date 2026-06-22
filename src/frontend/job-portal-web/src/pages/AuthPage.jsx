// File: src/pages/AuthPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authApi";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true); // State điều hướng chế độ Đăng nhập / Đăng ký
  const [loading, setLoading] = useState(false);

  // Khởi tạo state chung cho cả 2 form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "", // Thêm họ và tên cho đăng ký
    role: "2", // 2 = Seeker, 3 = Employer (Khớp chuẩn với C# Enum)
  });

  // Tự động chuyển hướng nếu người dùng đã đăng nhập sẵn
  useEffect(() => {
    if (user && !loading) {
      if (user.role === "Admin") {
        navigate("/admin/jobs");
      } else if (user.role === "Employer") {
        navigate("/employer/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate, loading]);

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

        login(response.token, response.role);
        showToast("Đăng nhập thành công!", "success");
      } else {
        // --- XỬ LÝ ĐĂNG KÝ ---
        await authApi.register({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || "Người dùng mới",
          role: parseInt(formData.role),
        });

        showToast(
          "Đăng ký tài khoản thành công! Hãy đăng nhập để tiếp tục.",
          "success",
        );
        setIsLogin(true); // Tự động chuyển về tab đăng nhập
      }
    } catch (error) {
      console.error("Lỗi xác thực:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-50/50 px-4 py-16">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-card hover:shadow-card-hover border border-gray-100/80 space-y-6 transition-all duration-300">
        {/* Tiêu đề & Chuyển đổi trạng thái */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-primary-600 tracking-tight">
            {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
              }}
              className="text-primary-600 font-semibold hover:text-primary-700 hover:underline cursor-pointer transition-colors"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập tại đây"}
            </button>
          </p>
        </div>

        {/* Biểu mẫu Form chính */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lựa chọn Vai trò (Chỉ hiển thị khi Đăng ký) */}
          {!isLogin && (
            <div className="animate-slide-down space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Bạn tham gia với vai trò:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "2" }))
                  }
                  className={`py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    formData.role === "2"
                      ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Ứng viên
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: "3" }))
                  }
                  className={`py-2.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                    formData.role === "3"
                      ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm"
                      : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Nhà tuyển dụng
                </button>
              </div>
            </div>
          )}

          {/* Ô nhập Họ tên (Chỉ hiển thị khi Đăng ký) */}
          {!isLogin && (
            <div className="animate-slide-down">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>
          )}

          {/* Ô nhập Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Ô nhập Mật khẩu */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-gray-700">
                Mật khẩu
              </label>
              {isLogin && (
                <a
                  href="#"
                  className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium"
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
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
          </div>

          {/* Nút bấm Submit gửi dữ liệu */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg shadow-sm transition-all duration-150 cursor-pointer active:scale-98 disabled:opacity-50 mt-4 hover:shadow-md"
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

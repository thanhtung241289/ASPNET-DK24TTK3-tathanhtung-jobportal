// File: src/layouts/MainLayout.jsx
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Hàm xử lý Đăng xuất (Logout) xóa sạch dấu vết token
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 1. Header Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100/80 sticky top-0 z-50 shadow-xs">
        <div className="container-custom h-16 flex items-center justify-between">
          {/* Khối bên trái: Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-primary-600 tracking-tight flex-shrink-0 hover:scale-[1.02] transition-transform duration-200"
          >
            JobPortal<span className="text-gray-800">.</span>
          </Link>

          {/* Khối ở giữa: Điều hướng Menu thông minh dựa theo Vai trò (Role) */}
          <nav className="hidden md:flex gap-8 font-semibold text-sm text-slate-600">
            <Link
              to="/"
              className="hover:text-primary-600 transition-colors py-1 relative group"
            >
              Trang chủ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/jobs"
              className="hover:text-primary-600 transition-colors py-1 relative group"
            >
              Việc làm
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>

            {/* Nếu là Ứng viên (Seeker) -> Hiện menu theo dõi đơn nộp */}
            {user && user.role === "Seeker" && (
              <Link
                to="/my-applications"
                className="hover:text-primary-600 transition-colors py-1 relative group"
              >
                Đơn đã nộp
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}

            {/* Nếu là Nhà tuyển dụng (Employer) -> Hiện menu quản lý tin */}
            {user && user.role === "Employer" && (
              <Link
                to="/employer/dashboard"
                className="hover:text-primary-600 transition-colors py-1 relative group"
              >
                Quản lý tuyển dụng
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}

            {/* Nếu là Quản trị viên (Admin) -> Hiện cổng duyệt bài */}
            {user && user.role === "Admin" && (
              <Link
                to="/admin/jobs"
                className="hover:text-amber-600 font-semibold text-amber-600 transition-colors py-1 relative group"
              >
                Hàng đợi duyệt bài
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          {/* Khối bên phải: Cụm nút bấm logic động */}
          <div className="flex items-center gap-4">
            {/* TRƯỜNG HỢP 1: CHƯA ĐĂNG NHẬP -> Hiện cặp nút Auth gốc */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-slate-600 font-semibold text-sm hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-all active:scale-[0.98] shadow-md shadow-primary-500/10"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/employer/post-job"
                  className="hidden md:block bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                  Đăng tin tuyển dụng
                </Link>
              </>
            ) : (
              // TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP THÀNH CÔNG -> Hiện avatar tròn click mở Dropdown
              <div className="relative flex items-center gap-3">
                {/* Nút đăng tin nhanh cho Employer ngay bên cạnh avatar */}
                {user.role === "Employer" && (
                  <Link
                    to="/employer/post-job"
                    className="hidden sm:inline-flex bg-primary-600 hover:bg-primary-700 text-white text-xs px-4 py-2 rounded-xl font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    + Đăng tin mới
                  </Link>
                )}

                {/* Avatar container */}
                <div className="relative">
                  {/* Avatar tròn kích hoạt Dropdown */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md border border-slate-100 hover:scale-105 transition-all duration-200 cursor-pointer outline-none"
                    title="Menu tài khoản"
                  >
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </button>
                  {/* Badge hiển thị role nằm gọn góc phải dưới của avatar */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white border-2 border-white shadow-xs select-none ${
                      user.role === "Admin"
                        ? "bg-amber-500"
                        : user.role === "Employer"
                          ? "bg-indigo-600"
                          : "bg-emerald-500"
                    }`}
                    title={
                      user.role === "Admin"
                        ? "Quản trị viên"
                        : user.role === "Employer"
                          ? "Nhà tuyển dụng"
                          : "Ứng viên"
                    }
                  >
                    {user.role === "Admin"
                      ? "A"
                      : user.role === "Employer"
                        ? "E"
                        : "S"}
                  </span>
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    {/* Lớp phủ click ra ngoài để đóng */}
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setDropdownOpen(false)}
                    ></div>

                    {/* Khung nội dung Dropdown */}
                    <div className="absolute right-0 top-full mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100/80 py-3 z-50 animate-scale-up">
                      {/* Tiêu đề & Thông tin tài khoản */}
                      <div className="px-4 py-2 border-b border-slate-100/80 mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Tài khoản
                        </p>
                        <p
                          className="text-xs font-bold text-slate-800 truncate mt-0.5"
                          title={user.email}
                        >
                          {user.email}
                        </p>
                        <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-slate-150 mt-1.5">
                          {user.role === "Admin"
                            ? "Quản trị viên"
                            : user.role === "Employer"
                              ? "Nhà tuyển dụng"
                              : "Ứng viên"}
                        </span>
                      </div>

                      {/* Các lựa chọn Menu động theo Role */}
                      <div className="space-y-0.5">
                        {user.role === "Seeker" && (
                          <>
                            <Link
                              to="/profile"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                            >
                              📁 Hồ sơ của tôi
                            </Link>
                            <Link
                              to="/my-applications"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                            >
                              📝 Đơn đã ứng tuyển
                            </Link>
                          </>
                        )}

                        {user.role === "Employer" && (
                          <>
                            <Link
                              to="/employer/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                            >
                              📊 Bảng điều khiển
                            </Link>
                            <Link
                              to="/employer/post-job"
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
                            >
                              ➕ Đăng tin tuyển dụng
                            </Link>
                          </>
                        )}

                        {user.role === "Admin" && (
                          <Link
                            to="/admin/jobs"
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-amber-600 transition-colors"
                          >
                            🛡️ Hàng đợi duyệt bài
                          </Link>
                        )}
                      </div>

                      {/* Ngăn cách đăng xuất */}
                      <div className="border-t border-slate-100/80 mt-2 pt-2 px-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Đăng xuất ➔
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-grow animate-fade-in">
        <Outlet />
      </main>

      {/* 3. Footer */}
      <footer className="bg-surface border-t border-gray-200 mt-auto">
        <div className="container-custom py-8 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Job Portal. Nền tảng kết nối việc làm
            chuyên nghiệp.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

// File: src/layouts/MainLayout.jsx
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { profileApi } from "../services/profileApi";
import {
  User,
  Briefcase,
  Shield,
  LogOut,
  FileText,
  LayoutDashboard,
  Plus,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  QrCode,
  Heart,
} from "lucide-react";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Synchronize database bookmarked jobs with localStorage for candidates
  useEffect(() => {
    const syncBookmarks = async () => {
      if (user && user.role === "Seeker") {
        try {
          const savedIds = await profileApi.getSavedJobIds();
          localStorage.setItem(
            "bookmarkedJobs",
            JSON.stringify(savedIds || []),
          );
          window.dispatchEvent(new Event("bookmarksChanged"));
        } catch (error) {
          console.error("Lỗi đồng bộ danh sách việc làm đã lưu:", error);
        }
      } else if (!user) {
        localStorage.removeItem("bookmarkedJobs");
        window.dispatchEvent(new Event("bookmarksChanged"));
      }
    };
    syncBookmarks();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* --- HEADER NAVBAR --- */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all duration-300 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="container-custom h-[72px] flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold text-primary-600 tracking-tight flex-shrink-0 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <img
              src="/favicon.svg"
              alt="Logo"
              className="w-8 h-8 rounded-lg shadow-sm"
            />
            <span>
              ViệcLàm<span className="text-slate-900">Việt</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                isActive("/")
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/jobs"
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                isActive("/jobs")
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Việc làm IT
            </Link>

            {user?.role === "Seeker" && (
              <>
                <Link
                  to="/my-applications"
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                    isActive("/my-applications")
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Đơn đã nộp
                </Link>
                <Link
                  to="/saved-jobs"
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                    isActive("/saved-jobs")
                      ? "bg-primary-50 text-primary-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  Việc làm đã lưu
                </Link>
              </>
            )}

            {user?.role === "Employer" && (
              <Link
                to="/employer/dashboard"
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  isActive("/employer")
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Quản lý tuyển dụng
              </Link>
            )}

            {user?.role === "Admin" && (
              <Link
                to="/admin/jobs"
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  isActive("/admin")
                    ? "bg-amber-50 text-amber-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Quản trị hệ thống
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 hover:text-primary-600 transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-md shadow-primary-600/20 hover:shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Đăng ký
                </Link>
                <div className="hidden lg:block w-px h-6 bg-slate-200 mx-1"></div>
                <Link
                  to="/employer/post-job"
                  className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Đăng tin <ChevronRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <div className="relative flex items-center gap-4">
                {user.role === "Employer" && (
                  <Link
                    to="/employer/post-job"
                    className="hidden sm:flex items-center gap-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Đăng tin mới
                  </Link>
                )}

                <div className="relative">
                  {/* Nút Avatar nguyên bản của bạn */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-extrabold text-sm shadow border border-white/30 hover:scale-105 transition-all duration-200 cursor-pointer outline-none"
                  >
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </button>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm select-none ${
                      user.role === "Admin"
                        ? "bg-amber-500"
                        : user.role === "Employer"
                          ? "bg-primary-700"
                          : "bg-emerald-500"
                    }`}
                  >
                    {user.role === "Admin" ? (
                      <Shield className="w-2.5 h-2.5" />
                    ) : user.role === "Employer" ? (
                      <Briefcase className="w-2.5 h-2.5" />
                    ) : (
                      <User className="w-2.5 h-2.5" />
                    )}
                  </span>

                  {/* Dropdown Menu Mới - Không có lớp mờ, thiết kế gọn gàng hơn */}
                  {dropdownOpen && (
                    <>
                      {/* Vùng vô hình để click ra ngoài đóng menu */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      ></div>

                      <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-slide-up origin-top-right">
                        {/* Header của Menu */}
                        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                          <p
                            className="text-sm font-bold text-slate-800 truncate"
                            title={user.email}
                          >
                            {user.email}
                          </p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {user.role === "Admin"
                              ? "Quản trị viên"
                              : user.role === "Employer"
                                ? "Nhà tuyển dụng"
                                : "Ứng viên"}
                          </p>
                        </div>

                        {/* Danh sách Links */}
                        <div className="p-1.5 flex flex-col">
                          {user.role === "Seeker" && (
                            <>
                              <Link
                                to="/profile"
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors"
                              >
                                <FileText className="w-4 h-4 text-slate-400" />{" "}
                                Hồ sơ của tôi
                              </Link>
                              <Link
                                to="/my-applications"
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors"
                              >
                                <Briefcase className="w-4 h-4 text-slate-400" />{" "}
                                Đơn đã ứng tuyển
                              </Link>
                              <Link
                                to="/saved-jobs"
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors"
                              >
                                <Heart className="w-4 h-4 text-slate-400" />{" "}
                                Việc làm đã lưu
                              </Link>
                            </>
                          )}

                          {user.role === "Employer" && (
                            <>
                              <Link
                                to="/employer/dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4 text-slate-400" />{" "}
                                Bảng điều khiển
                              </Link>
                              <Link
                                to="/employer/post-job"
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-primary-600 rounded-xl transition-colors"
                              >
                                <Plus className="w-4 h-4 text-slate-400" /> Đăng
                                tin tuyển dụng
                              </Link>
                            </>
                          )}

                          {user.role === "Admin" && (
                            <Link
                              to="/admin/jobs"
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors"
                            >
                              <Shield className="w-4 h-4 text-slate-400" />{" "}
                              Trang quản trị
                            </Link>
                          )}
                        </div>

                        {/* Nút Đăng xuất */}
                        <div className="p-1.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" /> Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow animate-fade-in">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-300 mt-auto">
        <div className="container-custom py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-800">
            {/* Brand */}
            <div className="space-y-5 md:col-span-1">
              <Link
                to="/"
                className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <img
                  src="/favicon.svg"
                  alt="Logo"
                  className="w-8 h-8 rounded-lg brightness-0 invert"
                />
                <span>
                  ViệcLàm<span className="text-primary-500">Việt</span>
                </span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                Nền tảng kết nối tài năng và cơ hội nghề nghiệp hàng đầu Việt
                Nam — nhanh chóng, hiệu quả, tin cậy.
              </p>
              <div className="flex gap-3 pt-2">
                {[
                  {
                    icon: Briefcase,
                    hoverClass: "hover:bg-blue-600",
                    title: "Facebook",
                  },
                  {
                    icon: QrCode,
                    hoverClass: "hover:bg-sky-500",
                    title: "Twitter",
                  },
                  {
                    icon: FileText,
                    hoverClass: "hover:bg-blue-700",
                    title: "LinkedIn",
                  },
                  {
                    icon: Mail,
                    hoverClass: "hover:bg-pink-500",
                    title: "Instagram",
                  },
                ].map(({ icon: Icon, hoverClass, title }) => (
                  <a
                    key={title}
                    href="#"
                    title={title}
                    className={`w-9 h-9 rounded-xl bg-slate-800 ${hoverClass} text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* For Candidates */}
            <div className="space-y-5">
              <h4 className="text-white font-bold text-sm tracking-wide">
                Dành cho Ứng viên
              </h4>
              <ul className="space-y-3">
                {[
                  { to: "/jobs", label: "Tìm kiếm việc làm" },
                  { to: "/register", label: "Tạo tài khoản ứng viên" },
                  { to: "/profile", label: "Quản lý hồ sơ" },
                  { to: "/my-applications", label: "Đơn ứng tuyển của tôi" },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-slate-400 hover:text-primary-400 text-sm font-medium flex items-center gap-2 transition-colors group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Employers */}
            <div className="space-y-5">
              <h4 className="text-white font-bold text-sm tracking-wide">
                Dành cho Nhà tuyển dụng
              </h4>
              <ul className="space-y-3">
                {[
                  { to: "/employer/post-job", label: "Đăng tin tuyển dụng" },
                  { to: "/employer/dashboard", label: "Bảng điều khiển" },
                  { to: "/register", label: "Đăng ký doanh nghiệp" },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-slate-400 hover:text-primary-400 text-sm font-medium flex items-center gap-2 transition-colors group"
                    >
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <h4 className="text-white font-bold text-sm tracking-wide">
                Liên hệ & Hỗ trợ
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-400 text-sm">
                  <div className="bg-slate-800 p-2 rounded-lg shrink-0">
                    <MapPin className="w-4 h-4 text-primary-400" />
                  </div>
                  <span className="mt-1">
                    123 Đường Nguyễn Huệ, Quận 1,
                    <br />
                    TP. Hồ Chí Minh
                  </span>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <div className="bg-slate-800 p-2 rounded-lg shrink-0">
                    <Mail className="w-4 h-4 text-primary-400" />
                  </div>
                  <a
                    href="mailto:support@vieclamviet.vn"
                    className="hover:text-white transition-colors"
                  >
                    support@vieclamviet.vn
                  </a>
                </li>
                <li className="flex items-center gap-3 text-slate-400 text-sm">
                  <div className="bg-slate-800 p-2 rounded-lg shrink-0">
                    <Phone className="w-4 h-4 text-primary-400" />
                  </div>
                  <a
                    href="tel:02838123456"
                    className="hover:text-white transition-colors"
                  >
                    028 3812 3456
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} ViệcLàmViệt. Bảo lưu mọi quyền.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;

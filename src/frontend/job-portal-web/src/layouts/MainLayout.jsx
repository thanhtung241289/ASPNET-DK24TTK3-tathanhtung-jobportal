// File: src/layouts/MainLayout.jsx
import { Link, Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 1. Header Navbar */}
      <header className="bg-surface shadow-sm sticky top-0 z-50">
        <div className="container-custom h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-primary-600 tracking-tight"
          >
            JobPortal<span className="text-gray-800">.</span>
          </Link>

          {/* Navigation Links (Giữa) */}
          <nav className="hidden md:flex gap-8 font-medium text-gray-600">
            <Link to="/" className="hover:text-primary-600 transition-colors">
              Trang chủ
            </Link>
            <Link
              to="/jobs"
              className="hover:text-primary-600 transition-colors"
            >
              Việc làm IT
            </Link>
            <Link
              to="/companies"
              className="hover:text-primary-600 transition-colors"
            >
              Công ty
            </Link>
          </nav>

          {/* Action Buttons (Phải) */}
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 font-medium hover:text-primary-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
            >
              Đăng ký
            </Link>
            {/* Nút dành cho nhà tuyển dụng */}
            <Link
              to="/employer/post-job"
              className="hidden md:block bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content (Khu vực hiển thị nội dung các trang) */}
      <main className="flex-grow animate-fade-in">
        {/* Outlet chính là "lỗ hổng" để React Router bơm Component trang con vào */}
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

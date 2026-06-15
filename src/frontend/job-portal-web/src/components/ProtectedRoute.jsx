// File: src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Nếu Context đang giải mã token, hiển thị màn hình chờ tạm thời
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 1. Nếu chưa đăng nhập -> Đá về trang /login và lưu lại vị trí định truy cập
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Nếu đã đăng nhập nhưng sai Role -> Đá về trang không có quyền truy cập (hoặc trang chủ)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Nếu thỏa mãn tất cả -> Cho phép render nội dung trang con
  return children;
}

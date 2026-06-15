// File: src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";

// Giả lập các component giao diện (Bạn sẽ thay thế bằng file thực tế sau)
const Home = () => (
  <div className="p-8">🏠 Trang chủ tìm việc (Ai cũng vào được)</div>
);
const CandidateProfile = () => (
  <div className="p-8">📄 Hồ sơ cá nhân của Ứng viên (Role 2)</div>
);
const EmployerDashboard = () => (
  <div className="p-8">💼 Bảng điều khiển của Nhà tuyển dụng (Role 3)</div>
);
const AdminDashboard = () => (
  <div className="p-8">👑 Trang quản trị tối cao của Admin (Role 1)</div>
);
const Unauthorized = () => (
  <div className="p-8 text-red-600 font-bold">
    🚫 Bạn không có quyền truy cập vào chức năng này!
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= ROUTES CÔNG KHAI (PUBLIC) ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ================= ROUTES CHO ỨNG VIÊN (SEEKER - ROLE 2) ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={[2]}>
              <CandidateProfile />
            </ProtectedRoute>
          }
        />

        {/* ================= ROUTES CHO NHÀ TUYỂN DỤNG (EMPLOYER - ROLE 3) ================= */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute allowedRoles={[3]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= ROUTES CHO ADMIN (ADMIN - ROLE 1) ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[1]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Tự động bắt các route bậy bạ trả về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// File: src/services/adminApi.js
import axiosClient from "../config/axiosClient";

export const adminApi = {
  // Lấy danh sách tin tuyển dụng đang chờ phê duyệt (Status = Pending)
  getPendingJobs: () => axiosClient.get("/admin/jobs/pending"),

  // Phê duyệt hoặc từ chối bài viết cụ thể
  reviewJob: (id, data) => {
    const apiData = {
      status: data.status === "Approved" ? 1 : 3,
      rejectReason: data.reason || null,
    };
    return axiosClient.put(`/admin/jobs/${id}/approve`, apiData);
  },

  // Tạo ngành nghề mới (chỉ Admin)
  createCategory: (name) => axiosClient.post("/admin/categories", { name }),
  // Sửa ngành nghề (chỉ Admin)
  updateCategory: (id, name) =>
    axiosClient.put(`/admin/categories/${id}`, { name }),
  // Xóa ngành nghề (chỉ Admin)
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),

  // Lấy tất cả tin tuyển dụng trong hệ thống (chỉ Admin)
  getAllJobs: () => axiosClient.get("/admin/jobs"),
  // Bật/tắt trạng thái nổi bật (IsHot) cho tin tuyển dụng
  toggleJobHot: (id) => axiosClient.put(`/admin/jobs/${id}/toggle-hot`),

  // ===== QUẢN LÝ CÔNG TY =====
  // Lấy danh sách tất cả công ty
  getCompanies: () => axiosClient.get("/admin/companies"),
  // Khóa/Mở khóa tài khoản công ty
  toggleLockCompany: (id) =>
    axiosClient.put(`/admin/companies/${id}/toggle-lock`),
  // Xác thực/Hủy xác thực công ty
  toggleVerifyCompany: (id) =>
    axiosClient.put(`/admin/companies/${id}/toggle-verify`),

  // Lấy dữ liệu thống kê giám sát hệ thống (Dashboard)
  getDashboardStats: () => axiosClient.get("/admin/jobs/dashboard-stats"),
};

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
};

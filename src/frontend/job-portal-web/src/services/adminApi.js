import axiosClient from "../config/axiosClient";

export const adminApi = {
  // Lấy danh sách tin tuyển dụng đang chờ phê duyệt (Status = Pending)
  getPendingJobs: () => axiosClient.get("/admin/jobs/pending"),

  // Phê duyệt hoặc từ chối bài viết cụ thể
  reviewJob: (id, data) => axiosClient.put(`/admin/jobs/${id}/review`, data),
};

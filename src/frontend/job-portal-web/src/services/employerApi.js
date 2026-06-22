// File: src/services/employerApi.js
import axiosClient from "../config/axiosClient";

export const employerApi = {
  // Gửi object chứa thông tin bài đăng và mảng các ID liên kết
  createJobPost: (jobData) => axiosClient.post("/job", jobData),

  // Lấy thông tin hồ sơ doanh nghiệp
  getProfile: () => axiosClient.get("/employer/profile"),

  // Cập nhật thông tin hồ sơ doanh nghiệp
  updateProfile: (data) => axiosClient.put("/employer/profile", data),

  // Tải lên logo công ty
  uploadLogo: (formData) =>
    axiosClient.post("/employer/logo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Tải lên cover công ty
  uploadCover: (formData) =>
    axiosClient.post("/employer/cover", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Lấy danh sách tin tuyển dụng đã đăng của công ty
  getJobs: () => axiosClient.get("/employer/jobs"),

  // Lấy danh sách hồ sơ ứng tuyển vào công ty
  getApplications: () => axiosClient.get("/employer/applications"),

  // Cập nhật trạng thái xử lý hồ sơ
  updateApplicationStatus: (id, status) =>
    axiosClient.put(`/employer/applications/${id}/status`, { status }),

  // Tạo kỹ năng mới
  createSkill: (data) => axiosClient.post("/employer/skills", data),

  // Xem profile ứng viên (public view dành cho employer)
  getCandidateProfile: (userId) =>
    axiosClient.get(`/employer/candidate/${userId}`),

  // Cập nhật tin tuyển dụng
  updateJobPost: (id, jobData) => axiosClient.put(`/job/${id}`, jobData),

  // Xóa tin tuyển dụng
  deleteJobPost: (id) => axiosClient.delete(`/job/${id}`),
};

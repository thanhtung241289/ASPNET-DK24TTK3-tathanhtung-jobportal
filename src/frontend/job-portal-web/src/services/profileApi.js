// File: src/services/profileApi.js
import axiosClient from "../config/axiosClient";

export const profileApi = {
  getMyProfile: () => axiosClient.get("/candidate/profile"),
  getProfile: (id) => axiosClient.get(`/candidate/${id}/profile`),
  updateProfile: (data) => axiosClient.put("/candidate/profile", data),
  getResumes: () => axiosClient.get("/candidate/resume"),

  // Quản lý việc làm yêu thích
  getSavedJobs: () => axiosClient.get("/candidate/saved-jobs"),
  getSavedJobIds: () => axiosClient.get("/candidate/saved-jobs/ids"),
  saveJob: (jobId) => axiosClient.post(`/candidate/saved-jobs/${jobId}`),
  unsaveJob: (jobId) => axiosClient.delete(`/candidate/saved-jobs/${jobId}`),

  // Tải lên CV cần chỉ định rõ Content-Type là multipart/form-data để ghi đè cấu hình mặc định của axiosClient
  uploadResume: (formData) =>
    axiosClient.post("/candidate/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Tải lên ảnh đại diện ứng viên
  uploadAvatar: (formData) =>
    axiosClient.post("/candidate/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  setDefaultResume: (id) =>
    axiosClient.put(`/candidate/resume/${id}/set-default`),
  deleteResume: (id) => axiosClient.delete(`/candidate/resume/${id}`),
};

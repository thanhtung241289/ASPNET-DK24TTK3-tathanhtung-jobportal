// File: src/services/jobApi.js
import axiosClient from "../config/axiosClient";

export const jobApi = {
  // Trực tiếp truyền params (object gồm keyword, locationId, pageNumber...) vào request
  searchJobs: (params) => axiosClient.get("/job/search", { params }),
  getJobDetail: (id) => axiosClient.get(`/job/${id}`),

  getMyResumes: () => axiosClient.get("/candidate/resume"),
  applyJob: (data) => axiosClient.post("/candidate/apply", data),

  getMyApplications: () => axiosClient.get("/candidate/applications"),

  // 2. [SỬA LỖI]: Đổi tên từ getJobDetail thành getById để khớp với JobDetailPage.jsx
  getById: (id) => axiosClient.get(`/job/${id}`),

  // 3. [BỔ SUNG]: Hàm lấy toàn bộ hoặc lọc việc làm theo Category để làm "Việc làm tương tự"
  getAll: (params) => axiosClient.get("/job/search", { params }),
};

// File: src/services/jobApi.js
import axiosClient from "../config/axiosClient";

export const jobApi = {
  // Trực tiếp truyền params (object gồm keyword, locationId, pageNumber...) vào request
  searchJobs: (params) => axiosClient.get("/job/search", { params }),
  getJobDetail: (id) => axiosClient.get(`/job/${id}`),

  getMyResumes: () => axiosClient.get("/candidate/resume"),
  applyJob: (data) => axiosClient.post("/candidate/apply", data),
};

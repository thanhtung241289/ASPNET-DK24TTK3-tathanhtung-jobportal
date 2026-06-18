// File: src/services/employerApi.js
import axiosClient from "../config/axiosClient";

export const employerApi = {
  // Gửi object chứa thông tin bài đăng và mảng các ID liên kết
  createJobPost: (jobData) => axiosClient.post("/job", jobData),
};

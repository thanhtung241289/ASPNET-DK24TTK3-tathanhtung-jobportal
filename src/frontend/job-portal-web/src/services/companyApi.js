// File: src/services/companyApi.js
import axiosClient from "../config/axiosClient";

export const companyApi = {
  getCompanyDetail: (id) => axiosClient.get(`/company/${id}`),
  getCompanies: (params) => axiosClient.get("/company", { params }),
};

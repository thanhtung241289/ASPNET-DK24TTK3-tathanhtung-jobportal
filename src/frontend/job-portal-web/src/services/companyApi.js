import axiosClient from "../config/axiosClient";

export const companyApi = {
  getCompanyDetail: (id) => axiosClient.get(`/company/${id}`),
};

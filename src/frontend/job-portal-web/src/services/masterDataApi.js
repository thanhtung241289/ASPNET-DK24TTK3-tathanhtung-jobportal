import axiosClient from "../config/axiosClient";

export const masterDataApi = {
  getCategories: () => axiosClient.get("/masterdata/categories"),
  getSkills: () => axiosClient.get("/masterdata/skills"),
  getLocations: () => axiosClient.get("/masterdata/locations"),
  getStats: () => axiosClient.get("/masterdata/stats"),
};

// File: src/services/authApi.ts
import axiosClient from '../config/axiosClient';

export const authApi = {
  login: (data) => axiosClient.post('/auth/login', data),
  register: (data) => axiosClient.post('/auth/register', data),
};
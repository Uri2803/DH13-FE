// src/services/api.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true, // gửi/nhận cookie HttpOnly
});

// Trả thẳng response.data cho tiện
api.interceptors.response.use(
  (res) => (res && res.data) ? res.data : res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean });
    const status = error.response?.status || 0;
    const url = String(original?.url || '');

    // Nếu 401 và chưa retry, tránh tự bắn /user/refresh lồng nhau
    if (status === 401 && !original?._retry && !url.includes('/user/refresh')) {
      original._retry = true;

      try {
        // Dùng instance tách riêng để không dính interceptor vòng lặp
        const refreshClient = axios.create({
          baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
          withCredentials: true,
        });

        // Backend đã set cookie mới khi refresh thành công
        await refreshClient.post('/user/refresh');

        // Retry request cũ với cookie mới
        return api(original);
      } catch (e) {
        // Refresh thất bại -> coi như hết phiên
        // TODO: nếu bạn có store, dispatch signOut() ở đây
        // ví dụ đơn giản:
        // window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    // Các lỗi khác giữ nguyên
    return Promise.reject(error);
  }
);

export default api;

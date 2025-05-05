import axios from 'axios';

/*
 * 全站共用 axios instance。
 * 可在此統一：
 *  - baseURL
 *  - 預設 header
 *  - 請求／回應攔截器（自動帶入 JWT、錯誤處理）
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

// 自動附帶 JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    } as any;
  }
  return config;
});

// 簡易錯誤攔截（可擴充）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 401 可選擇自動登出或刷新 token
      console.warn('未授權或 Token 失效');
    }
    return Promise.reject(error);
  }
);

export default api; 
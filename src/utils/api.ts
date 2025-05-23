import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, ERROR_MESSAGES } from './apiConfig'

/*
 * 全站共用 axios instance。
 * 可在此統一：
 *  - baseURL
 *  - 預設 header
 *  - 請求／回應攔截器（自動帶入 JWT、錯誤處理）
 */
const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// 自動附帶 JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 簡易錯誤攔截（可擴充）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
        case 403:
          return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));
        case 404:
          return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));
        case 422:
          return Promise.reject(new Error(ERROR_MESSAGES.VALIDATION_ERROR));
        default:
          return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
      }
    }
    if (error.request) {
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }
    return Promise.reject(error);
  }
);

// API 请求方法封装
export const apiClient = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  }
};

export default apiClient; 
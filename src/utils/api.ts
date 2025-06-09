import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { API_CONFIG } from './apiConfig'

const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)
    if (token) {
      config.headers[API_CONFIG.AUTH.HEADER] = `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 
export const apiClient = api
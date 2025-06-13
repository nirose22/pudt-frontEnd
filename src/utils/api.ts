import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { API_CONFIG } from './apiConfig'
import { errorHandler } from '@/utils/errorHandler'

const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 從 pinia 持久化存儲中讀取 token
    const authData = localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY)
    let token = null
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData)
        token = parsedAuth.token
      } catch (error) {
        console.warn('解析 auth 數據失敗:', error)
      }
    }
    if (token) {
      config.headers[API_CONFIG.AUTH.HEADER] = `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`
    }
    return config
  },
  (error) => {
    return errorHandler.handleApiError(error, '請求錯誤')
  }
)


// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 處理未授權錯誤
      localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 
export const apiClient = api
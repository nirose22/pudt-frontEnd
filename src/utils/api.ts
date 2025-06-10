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
    // 從 pinia 持久化存儲中讀取 token
    // authStore 使用 persist 配置，key 為 'auth'，存儲格式為 {token: 'xxx', role: 'xxx'}
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
    
    console.log('從 localStorage 獲取的 token:', token);
    
    if (token) {
      config.headers[API_CONFIG.AUTH.HEADER] = `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`
      console.log('設置 Authorization header:', config.headers[API_CONFIG.AUTH.HEADER]);
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
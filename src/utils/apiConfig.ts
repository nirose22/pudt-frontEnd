// API 基础配置
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
    }
}

// API 路径常量
export const API_ROUTES = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        GOOGLE_LOGIN: '/auth/google/login',
        FACEBOOK_LOGIN: '/auth/facebook/login',
    },
    // 其他 API 路由...
}

// 错误消息常量
export const ERROR_MESSAGES = {
    NETWORK_ERROR: '網絡連接失敗，請檢查您的網絡設置',
    TIMEOUT: '請求超時，請稍後重試',
    SERVER_ERROR: '服務器錯誤，請稍後重試',
    UNAUTHORIZED: '未授權，請重新登錄',
    FORBIDDEN: '沒有權限訪問該資源',
    NOT_FOUND: '請求的資源不存在',
    VALIDATION_ERROR: '輸入數據驗證失敗',
}
// API 基础配置
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    AUTH: {
        HEADER: 'Authorization',
        TOKEN_PREFIX: 'Bearer',
        TOKEN_KEY: 'authToken'
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
        PROFILE: (id: number | 'me') => `/users/${id}`,
    },
    COURSE: {
        LIST: '/courses',
        SEARCH: '/courses/search',
        DETAIL: (id: number) => `/courses/${id}`,
        CREATE: '/courses',
        UPDATE: (id: number) => `/courses/${id}`,
        DELETE: (id: number) => `/courses/${id}`,
        POPULAR: '/courses/popular',
        LATEST: '/courses/latest',
        RECOMMENDED: (userId: number) => `/courses/recommended/${userId}`,
        SESSIONS: (id: number) => `/courses/${id}/sessions`,
        IMAGES: (id: number) => `/courses/${id}/images`,
        ENROLLMENTS: (id: number) => `/courses/${id}/enrollments`,
        FAVORITE: (courseId: number) => `/courses/${courseId}/favorite`,
        FAVORITES: (userId: number) => `/courses/favorites?userId=${userId}`,
    },
    USER: {
        PROFILE: (id: number | 'me') => `/users/${id}`,
        INTERESTS: (userId: number) => `/users/${userId}/interests`,
        BEHAVIOR: (userId: number) => `/users/${userId}/behavior`,
        ADDRESS: (userId: number) => `/users/${userId}/address`,
        PURCHASE_HISTORY: (userId: number) => `/users/${userId}/purchase-history`,
        UNPAID_ITEMS: (userId: number) => `/users/${userId}/unpaid-items`,
        ABSENCES: (userId: number | string) => `/users/${userId}/absences`,
    },
    BOOKING: {
        LIST: (userId: number, queryString: string) => `/booking/users/${userId}${queryString}`,
        DETAIL: (id: number) => `/booking/${id}`,
        CREATE: '/booking',
        CANCEL: (id: number) => `/booking/${id}/cancel`,
        CHECK: '/booking/check',
        SCHEDULE: (userId: number, queryString: string) => `/booking/users/${userId}/schedule${queryString}`,
    },
    PURCHASE: {
        HISTORY: (userId: number) => `/purchase/${userId}/purchase-history`,
        UNPAID: (userId: number) => `/purchase/${userId}/unpaid-items`,
        PAY: (id: number) => `/purchase/${id}/pay`,
    },
    ACTIVITY: {
        RECORD: '/activities',
        PROFILE: (userId: number) => `/activities/profile/${userId}`,
    },
    MERCHANT: {
        BASE: '/merchants',
        DETAIL: (id: number | 'me') => `/merchants/${id}`,
        COURSES: (id: number | 'me') => `/merchants/${id}/courses`,
        STATS: (id: number | 'me') => `/merchants/${id}/stats`,
        INSTRUCTORS: (id: number | 'me') => `/merchants/${id}/instructors`,
        BOOKINGS: (id: number) => `/merchants/${id}/bookings`,
    },
    POINTS: {
        CARDS: '/points/cards',
        HISTORY: '/points/history',
        BUY: '/points/buy',
        TRANSFER: '/points/transfer',
    }
}

// 错误消息常量
export const ERROR_MESSAGES = {
    NETWORK_ERROR: '網絡連接失敗，請檢查您的網絡設置',
    COURSE_ERROR: '課程操作失敗，請稍後重試',
    BOOKING_ERROR: '預約操作失敗，請稍後重試',
    TIMEOUT: '請求超時，請稍後重試',
    SERVER_ERROR: '服務器錯誤，請稍後重試',
    UNAUTHORIZED: '未授權，請重新登錄',
    FORBIDDEN: '沒有權限訪問該資源',
    NOT_FOUND: '請求的資源不存在',
    VALIDATION_ERROR: '輸入數據驗證失敗',
    USER_ERROR: '用戶操作失敗',
    PURCHASE_ERROR: '購買操作失敗',
    AUTH: {
        LOGIN_ERROR: '登錄失敗，請檢查您的賬號密碼',
        REGISTER_ERROR: '註冊失敗，請稍後重試',
        LOGOUT_ERROR: '登出失敗'
    }
}

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
        PROFILE: (id: number | 'me') => `/users/${id}`,
    },
    COURSE: {
        LIST: '/courses',
        DETAIL: (id: number) => `/courses/${id}/detail`,
        SESSIONS: (id: number) => `/courses/${id}/sessions`,
        IMAGES: (id: number) => `/courses/${id}/images`,
        FAVORITES: (userId: number) => `/users/${userId}/favorites`,
        ADD_FAVORITE: (userId: number) => `/users/${userId}/favorites`,
        REMOVE_FAVORITE: (userId: number, courseId: number) => `/users/${userId}/favorites/${courseId}`,
    },
    BOOKING: {
        LIST: (userId: number) => `/users/${userId}/bookings`,
        DETAIL: (courseId: number) => `/bookings/course/${courseId}/detail`,
        CREATE: '/bookings',
        CANCEL: (bookingId: number) => `/bookings/${bookingId}/cancel`,
        CHECK: '/bookings/check',
    },
    MERCHANT: {
        DETAIL: (id: number | 'me') => `/merchants/${id}`,
        COURSES: (id: number | 'me') => `/merchants/${id}/courses`,
        UPDATE: (id: number) => `/merchants/${id}`,
    },
    PURCHASE: {
        HISTORY: (userId: number) => `/users/${userId}/purchase-history`,
        INVOICE: (invoiceNo: string) => `/invoices/${invoiceNo}/download`,
        UNPAID: (userId: number) => `/users/${userId}/unpaid-items`,
        PAY_UNPAID: (itemId: number) => `/payments/unpaid/${itemId}`,
    },
    POINTS: {
        CARDS: '/points/cards',
        HISTORY: '/points/history',
        BUY: '/points/buy',
        TRANSFER: '/points/transfer',
    },
    ATTENDANCE: {
        LIST: (userId: number | string) => `/users/${userId}/absences`,
        SUBMIT_LEAVE: (bookingId: number) => `/bookings/${bookingId}/leave`,
        CANCEL_LEAVE: (leaveId: number) => `/absences/leave/${leaveId}`
    },
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
    BOOKING_ERROR: '預約失敗，請稍後重試',
    COURSE_ERROR: '課程操作失敗，請稍後重試',
    MERCHANT_ERROR: '商家信息獲取失敗，請稍後重試',
    PURCHASE_ERROR: '購買記錄獲取失敗，請稍後重試',
    POINTS_ERROR: '點數操作失敗，請稍後重試',
    ATTENDANCE_ERROR: '出勤記錄操作失敗',
}
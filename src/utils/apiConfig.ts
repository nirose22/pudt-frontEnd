// API 基础配置
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/',
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
        // 課程基本操作
        LIST: '/courses',                           // GET - 獲取課程列表
        DETAIL: (id: number) => `/courses/${id}`,   // GET - 獲取課程詳情（移除多餘的 /detail）
        CREATE: '/courses',                         // POST - 創建課程
        UPDATE: (id: number) => `/courses/${id}`,   // PUT - 更新課程
        DELETE: (id: number) => `/courses/${id}`,   // DELETE - 刪除課程
        // 課程子資源
        SESSIONS: (id: number) => `/courses/${id}/sessions`,     // GET - 獲取課程章節
        IMAGES: (id: number) => `/courses/${id}/images`,         // GET - 獲取課程圖片
        ENROLLMENTS: (id: number) => `/courses/${id}/enrollments`, // GET - 獲取課程報名情況
    },
    FAVORITES: {
        LIST: (userId: number) => `/users/${userId}/favorites`,
        ADD: '/favorites',
        REMOVE: (id: number) => `/favorites/${id}`,
        CHECK: '/favorites/check',
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
        STATS: (id: number | 'me') => `/merchants/${id}/stats`,
        INSTRUCTORS: (id: number | 'me') => `/merchants/${id}/instructors`,
        INSTRUCTOR_DETAIL: (id: number | 'me', instructorId: number) => `/merchants/${id}/instructors/${instructorId}`,
        POINTS_STATS: (id: number) => `/merchants/${id}/points/stats`,
        POINTS_TRANSACTIONS: (id: number) => `/merchants/${id}/points/transactions`,
        POINTS_SETTLEMENT: (id: number) => `/merchants/${id}/points/settlement`,
        BOOKINGS: (id: number) => `/merchants/${id}/bookings`,
        BOOKING_DETAIL: (id: number, bookingId: number) => `/merchants/${id}/bookings/${bookingId}`,
        BOOKING_STATUS: (id: number, bookingId: number) => `/merchants/${id}/bookings/${bookingId}/status`,
        BOOKING_NOTES: (id: number, bookingId: number) => `/merchants/${id}/bookings/${bookingId}/notes`,
        BOOKING_MESSAGE: (id: number, bookingId: number) => `/merchants/${id}/bookings/${bookingId}/message`
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
    USER_ERROR: '用戶操作失敗',
    AUTH: {
        LOGIN_ERROR: '登錄失敗，請檢查您的賬號密碼',
        GOOGLE_LOGIN_ERROR: 'Google 登錄失敗',
        FACEBOOK_LOGIN_ERROR: 'Facebook 登錄失敗',
        REGISTER_ERROR: '註冊失敗，請稍後重試',
        LOGOUT_ERROR: '登出失敗'
    }
}

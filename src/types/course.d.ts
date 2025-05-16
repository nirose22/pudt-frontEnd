/* ---------- 講師 ---------- */
export interface Instructor {
  id: number                  // PK
  merchantId: number          // FK -> Merchant.id
  name: string
  avatar?: string             // 頭像 URL
  bio?: string                // 個人介紹
}


/* ---------- 課程核心 ---------- */
export interface Course {
  id: number                  // PK
  merchantId: number          // FK -> Merchant.id
  title: string
  description?: string
  points: number              // 預約所需點數
  price?: number              // 若有現金價格
  coverUrl?: string           // 封面圖片 URL
  region?: string             // 區域代碼 (TPE/KHH…)
  createdAt: Date
}

/* 每張課程附圖（多對一）*/
export interface CourseImage {
  id: number                  // PK
  courseId: number            // FK -> Course.id
  url: string                 // 圖片 URL
  alt?: string                // 圖片替代文字
}

/* 課程與分類連結 (多選 tag) */
export interface CourseCategoryLink {
  courseId: number
  category: string            // ENUM 代碼，如 SPF_YOG
}


/* 單一課程場次 (可多天多時段) */
export interface CourseSession {
  id: number
  courseId: number
  date: Date                  // 上課日期
  start: string               // HH:mm
  end: string
  seats: number               // 總席位
  seatsLeft: number           // 剩餘席位
}

/* ---------- 預約 ---------- */
export interface Booking {
  id: number
  userId: number
  sessionId: number           // FK -> CourseSession.id
  points: number
  status: BookingStatus
  rating?: number
  comment?: string
  createdAt: Date
}


/* ---------- 點數流水 ---------- */
export interface PointTxn {
  id: number
  userId: number
  type: 'deposit' | 'consume' | 'reward' | 'expire'
  amount: number              // 正或負值
  balance: number             // 當下餘額
  relatedId?: number          // 關聯 Order.id / Booking.id
  note?: string
  createdAt: Date
  expireAt?: Date
}

/* ---------- 會員活動 ---------- */
export interface Activity {
  id: number
  userId: number
  occurredAt: Date
  kind: 'login' | 'booking' | 'purchase' | 'account' | 'participation'
  refId?: number              // 依 kind 對應 bookingId / orderId…
  ip?: string
  device?: string
  memo?: string
}

import type { MainCategory } from '@/enums/CourseCategory'

/* ────────────────────────────  商  家  ──────────────────────────── */
export interface Merchant {
  id: number                    /** PK */
  name: string
  email: string
  phone: string
  address: string
  description?: string
  bizHours?: string             /** 營業時間 */
  category?: MainCategory             /** 業態，如 yoga / gym */
  website?: string
  logoUrl?: string
  coverUrl?: string
  rating?: number               /** 平均評分 */
  reviewCount?: number
  createdAt: Date
}

/* ────────────────────────────  商  家  統  計  ──────────────────────────── */
export interface MerchantStats {
  merchantId: number /** PK */
  totalBookings: number /** 總預約數 */
  totalRevenue: number /** 總營收 */
  totalCustomers: number /** 總顧客數 */
  topCourses: {
    courseId: number /** FK */
    title: string
    bookings: number /** 預約數 */
    revenue: number /** 營收 */
    rating: number /** 平均評分 */
  }[]
}

/* ---------- 講師 ---------- */
export interface Instructor {
  id: number                  // PK
  merchantId: number          // FK -> Merchant.id
  name: string
  avatarUrl?: string             // 頭像 URL
  bio?: string                // 個人介紹
}

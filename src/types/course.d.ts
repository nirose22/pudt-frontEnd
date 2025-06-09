import { RegionCode } from '@/enums/RegionCode'
import { Merchant } from './merchant'
import { CourseStatus } from '@/enums/Course'
import { MainCategory, SubCategory } from '@/enums/Category'

/* ---------- 課程基礎類型 ---------- */
export interface BaseCourse {
  id: number                  // PK
  title: string               // 課程標題
  description?: string        // 課程描述
  status?: CourseStatus       // 課程狀態
  publishDate?: Date | null   // 上架時間
  points: number              // 課程點數
}

/* ---------- 課程核心 ---------- */
export interface Course extends BaseCourse {
  merchantId: number          // FK -> Merchant.id
  coverUrl?: string           // 封面圖片
  region: RegionCode          // 地區碼
  createdAt: Date             // 創建時間
  categories?: string[]       // 課程分類列表
  mainCategory?: MainCategory // 主分類
  subCategory?: SubCategory   // 子分類
  joinCount?: number          // 參與人數
  recommended?: boolean       // 是否推薦
}

/* 課程與分類連結 (多選 tag) */
export interface CourseCategoryLink {
  courseId: number
  category: string            // ENUM 代碼，如 SPF_YOG
}

/* 時間區間接口 */
export interface TimeRange {
  start: string | Date  // HH:mm or Date
  end: string | Date
}

/* 單一課程場次 (可多天多時段) */
export interface CourseSession extends TimeRange {
  id: number
  courseId: number
  date: Date                  // 上課日期
  seats: number               // 總席位
  seatsLeft: number           // 剩餘席位
}

/* 課程詳情數據傳輸對象 */
export interface CourseDetailDTO extends Course {
  merchant: Merchant
  sessions: CourseSession[]
  images: PhotoItem[]
}

/**
 * 课程列表项，用于商家端课程列表展示
 */
export interface CourseListItem {
  id: number;
  title: string;
  description: string;
  coverUrl: string;
  status: CourseStatus;
  points: number;
  bookedSlots: number;
  totalSlots: number;
  startDate: Date;
}



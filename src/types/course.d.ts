import { RegionCode } from '@/enums/RegionCode'
import { Merchant } from './merchant'
import { CourseStatus } from '@/enums/Course'
import { MainCategory, SubCategory } from '@/enums/Category'
import { Photo } from './photo'

/* ---------- 課程基礎類型 ---------- */
export interface BaseCourse {
  id: number                  // PK
  title: string               // 課程標題
  description?: string        // 課程描述
  status?: CourseStatus       // 課程狀態
  points: number              // 課程點數
}

/* ---------- 課程核心 ---------- */
export interface Course extends BaseCourse {
  merchantId: number          // FK -> Merchant.id
  coverUrl?: string           // 封面圖片
  region: RegionCode          // 地區碼
  createdAt: Date             // 創建時間
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
  start: string  // HH:mm or Date
  end: string
}

/* 單一課程場次 (可多天多時段) */
export interface CourseSession extends TimeRange {
  id: number
  courseId: number
  date: Date              // 上課日期
  seats: number               // 總席位
  seatsLeft: number           // 剩餘席位

  // 支持兩種數據結構：嵌套對象或扁平化
  instructor?: InstructorDTO  // 嵌套對象結構
  instructorId?: number       // 扁平化結構
  instructorName?: string     // 扁平化結構
  instructorAvatar?: string   // 扁平化結構
}

/* 講師資料傳輸對象 */
export interface InstructorDTO {
  id: number                  // 講師ID
  name: string                // 講師姓名
  avatarUrl?: string          // 講師頭像
  bio?: string                // 講師介紹
}

/* 課程詳情數據傳輸對象 */
export interface CourseDetailDTO extends Course {
  merchant: Merchant
  sessions: CourseSession[]
  images: Photo[]
  isFavorite?: boolean
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



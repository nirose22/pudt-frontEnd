import { RegionCode } from '@/enums/RegionCode'
import { Merchant } from './merchant'
import { CourseStatus } from '@/enums/CourseStatus'

// 定義課程分類相關枚舉
export enum CourseMainCategory {
  SPORT = 'SPORT',           // 運動健身
  COOKING = 'COOKING',       // 烹飪美食
  ART = 'ART',               // 藝術創作
  LANGUAGE = 'LANGUAGE',     // 語言學習
  PROFESSIONAL = 'PROFESSIONAL' // 專業技能
}

// 定義子分類的命名模式，可用於驗證
export type SubCategoryCode = `${CourseMainCategory}_${string}`;

/* ---------- 課程基礎類型 ---------- */
export interface BaseCourse {
  id: number                  // PK
  title: string               // 課程標題
  description?: string        // 課程描述
  status?: CourseStatus       // 課程狀態
  publishDate?: Date | null   // 上架時間
}

/* ---------- 課程核心 ---------- */
export interface Course extends BaseCourse {
  merchantId: number          // FK -> Merchant.id
  points: number              // 課程點數
  coverUrl?: string           // 封面圖片
  region?: RegionCode         // 地區碼
  createdAt: Date             // 創建時間
  categories?: string[]       // 課程分類列表
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

/* 時間區間接口 */
export interface TimeRange {
  start: string               // HH:mm
  end: string                 // HH:mm
}

/* 單一課程場次 (可多天多時段) */
export interface CourseSession extends TimeRange {
  id: number
  courseId: number
  date: Date                  // 上課日期
  seats: number               // 總席位
  seatsLeft: number           // 剩餘席位
}

/* 課程表單專用的時段結構 */
export interface CourseScheduleItem {
  id?: number
  date: Date
  startTime: Date
  endTime: Date
  totalSeats: number
}

/* 課程表單數據結構 */
export interface CourseFormData extends BaseCourse {
  mainImage: string
  images: string[]
  pointsRequired: number
  region: string
  categories: string[]
  schedule: CourseScheduleItem[]
}

/* 課程DTO基礎類型 */
export interface BaseDTO {
  joinCount: number           // 參與人數
  recommended: boolean        // 是否推薦
}

/* 課程數據傳輸對象 */
export interface CourseDTO extends Course, BaseDTO {
  image: CourseImage
}

/* 課程詳情數據傳輸對象 */
export interface CourseDetailDTO extends CourseDTO {
  merchant: Merchant
  sessions: CourseSession[]
  images: CourseImage[]
}



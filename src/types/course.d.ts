 import { RegionCode } from '@/enums/RegionCode'
import { Merchant } from './merchant'
/* ---------- 課程核心 ---------- */
export interface Course {
  id: number                  // PK
  merchantId: number          // FK -> Merchant.id
  title: string
  description?: string
  points: number
  coverUrl?: string
  region?: RegionCode
  createdAt: Date
}

/* 每張課程附圖（多對一）*/
export interface CourseImage  {
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

export interface CourseDTO extends Course {
  joinCount: number // 參與人數
  recommended: boolean // 是否推薦
  image: CourseImage
}

export interface CourseDetailDTO extends CourseDTO {
  merchant: Merchant;
  sessions: CourseSession[]
  images: CourseImage[]
}


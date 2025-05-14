import type { BookingStatus } from '@/enums/BookingStatus';
import type { Photo, PhotoItem } from './photo'

export interface Course {
  courseId: number;
  merchantId: number;
  title: string;
  description: string;
  price: number;
  pointsRequired: number;
  joinCount: number;
  images: PhotoItem[];       // 課程圖片
  merchant: MerchantInfo;
}

export interface CourseDTO {
  merchantId: number;
  courseId: number;
  title: string;
  pointsRequired: number;
  image: Photo;       // 課程圖片
  merchantName: string;
  description?: string;
  createdAt?: Date;   // 課程創建日期，用於判斷新上架
  region?: string;    // 課程所在地區
  categories?: string[]; // 課程分類
  joinCount?: number; // 課程參與人數
  recommended?: boolean; // 是否為推薦課程
}

export interface MerchantInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  description: string;
  rating: number;
  reviewCount: number;
  businessHours: string;
  type: string;
  website: string;
  googleMapUrl: string;
}

export interface CourseTime {
  id: number;
  date: Date;
  time: string;
  availableSeats: number;
  totalSeats: number;
}

// 預約課程
export interface CourseBooking {
  id: number;
  userId: number;
  courseId: number;
  courseTitle: string;
  date: Date;
  time: string;
  merchantName: string;
  instructor?: {
    name: string;
    avatar: string;
  };
  status: BookingStatus;
  points: number;
}

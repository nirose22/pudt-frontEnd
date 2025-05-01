import type { BookingStatus } from '@/enums/bookingStatus';
import type { PhotoItem } from './photo'

export interface Course {
  classuid: number;
  title: string;
  description: string;
  price: number;
  pointsRequired: number;
  joinCount: number;
  images: PhotoItem[];       // 課程圖片
  merchant: MerchantInfo;
}

export interface MerchantInfo {
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

// 预约课程类型定义
export interface CourseBooking {
  id: number;
  userId: number;
  courseId: number;
  courseTitle: string;
  date: string;
  time: string;
  location: string;
  instructor?: {
    name: string;
    avatar: string;
  };
  status: BookingStatus;
}

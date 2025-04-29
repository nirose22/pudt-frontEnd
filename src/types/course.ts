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

export interface CourseAvailableTime {
  id: number;
  date: Date;
  time: string;
  availableSeats: number;
  totalSeats: number;
}

export interface CourseBooking {
  id: number;
  userId: number;
  courseId: number;
  slotId: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

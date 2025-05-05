export interface Merchant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  businessHours: string;
  type: string;
  rating: number;
  reviewCount: number;
  website: string;
  isVerified: boolean;
  createdAt: Date;
  logo?: string;
  coverImage?: string;
}

export interface MerchantCourse {
  id: number;
  merchantId: number;
  title: string;
  description: string;
  price: number;
  pointsRequired: number;
  availableSlots: number;
  totalSlots: number;
  schedule: MerchantCourseSchedule[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantCourseSchedule {
  id: number;
  courseId: number;
  date: Date;
  startTime: string;
  endTime: string;
  availableSeats: number;
  totalSeats: number;
}

export interface MerchantStats {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  courseStats: {
    courseId: number;
    title: string;
    bookingsCount: number;
    revenue: number;
    rating: number;
  }[];
} 
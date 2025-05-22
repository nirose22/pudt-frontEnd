import { BookingStatus } from '@/enums/BookingStatus';

/**
 * 預約基本信息
 */
export interface BaseBooking {
  id: number;                // 预约ID
  customerId: number;        // 客户ID (对应旧的userId)
  customerName: string;      // 客户姓名
  customerPhone: string;     // 客户电话
  sessionId?: number;        // 課程場次ID (FK -> CourseSession.id)
  courseId: number;          // 课程ID
  courseTitle: string;       // 课程标题
  points: number;            // 點數
  date: Date;                // 预约日期
  startTime: Date;           // 开始时间
  endTime: Date;             // 结束时间
  status: BookingStatus;     // 预约状态
  location?: string;         // 地点 (從舊接口整合)
  merchantName?: string;     // 商家名称 (從舊接口整合)
  rating?: number;           // 評分 (從舊接口整合)
  comment?: string;          // 評論 (從舊接口整合)
}

/**
 * 標準預約接口，用於列表顯示
 */
export interface Booking extends BaseBooking {
  notes?: string;            // 客戶備註，可选
  merchantNotes?: string;    // 商家備註，可选
  createdAt: Date;           // 創建時間
  updatedAt: Date;           // 更新時間
  instructor?: {             // 教练信息 (從舊接口整合)
    id: number;
    name: string;
    avatar?: string;
  };
}

/**
 * 詳細預約信息，用於詳情頁
 */
export interface BookingDetail extends Booking {
  customerEmail: string;     // 客户邮箱
  bookingCount: number;      // 客户预约次数
  history: BookingHistory[]; // 预约历史记录
}

/**
 * 預約歷史記錄
 */
export interface BookingHistory {
  status: string;            // 狀態描述
  time: Date;                // 時間
  note?: string;             // 備註
}

/**
 * 精簡版預約接口，用於日曆視圖
 */
export interface BookingCalendarItem {
  id: number;
  title: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  customer: {
    id: number;
    name: string;
  };
}


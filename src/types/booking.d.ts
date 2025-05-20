/* ---------- 預約 ---------- */
export interface Booking {
    id: number
    userId: number
    sessionId: number           // FK -> CourseSession.id
    points: number
    status: BookingStatus
    rating?: number
    comment?: string
    createdAt: Date

    // 课程信息
    courseTitle?: string        // 课程标题
    date?: Date                 // 预约日期
    time?: string               // 预约时间段
    location?: string           // 地点
    merchantName?: string       // 商家名称
    instructor?: {              // 教练信息
        id: number;
        name: string;
        avatar?: string;
    };
}


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
}

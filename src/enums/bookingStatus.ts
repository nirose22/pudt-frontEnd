export enum BookingStatus {
    Pending = 'pending',     // 等待確認／未處理
    Confirmed = 'confirmed',   // 已確認預約
    Completed = 'completed',   // 課程已結束
    Cancelled = 'cancelled',    // 使用者取消預約
    NoShow = 'noshow'       // 缺席未到
}

export const BookingStatusLabel: Record<BookingStatus, string> = {
    [BookingStatus.Pending]: '待確認',
    [BookingStatus.Confirmed]: '已預約',
    [BookingStatus.Completed]: '已完成',
    [BookingStatus.Cancelled]: '已取消',
    [BookingStatus.NoShow]: '未出席'
};

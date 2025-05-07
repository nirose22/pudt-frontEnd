export enum BookingStatus {
    Confirmed = 'C',
    Pending = 'P',
    Canceled = 'X'
}

export const BookingStatusLabel: Record<BookingStatus, string> = {
    [BookingStatus.Confirmed]: '已確認',
    [BookingStatus.Pending]: '待確認',
    [BookingStatus.Canceled]: '已取消'
}

import { BookingStatus } from "@/enums";

// 获取状态严重性
export function getBookingStatusSeverity(status: BookingStatus): string {
    switch (status) {
        case BookingStatus.Confirmed:
            return 'success';
        case BookingStatus.Cancelled:
            return 'danger';
        case BookingStatus.Pending:
            return 'warning';
        default:
            return 'info';
    }
}

// 获取状态标签
export function getBookingStatusLabel(status: BookingStatus) {
    switch (status) {
        case BookingStatus.Pending:
            return '待確認';
        case BookingStatus.Confirmed:
            return '已確認';
        case BookingStatus.Completed:
            return '已完成';
        case BookingStatus.Cancelled:
            return '已取消';
        default:
            return '未知狀態';
    }
};
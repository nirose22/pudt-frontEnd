/**
 * 狀態工具函數
 */
import { BookingStatus } from '@/enums/BookingStatus';
import { CourseStatus } from '@/enums/Course';

/**
 * 獲取預約狀態標籤
 * @param status 預約狀態
 * @returns 狀態對應的中文標籤
 */
export function getBookingStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    [BookingStatus.Pending]: '待確認',
    [BookingStatus.Confirmed]: '已確認',
    [BookingStatus.Completed]: '已完成',
    [BookingStatus.Cancelled]: '已取消',
    [BookingStatus.NoShow]: '未出席'
  };
  return statusMap[status] || status;
}

/**
 * 獲取預約狀態嚴重性（用於 UI 顯示）
 * @param status 預約狀態
 * @returns 狀態對應的嚴重性級別
 */
export function getBookingStatusSeverity(status: string): string {
  const severityMap: Record<string, string> = {
    [BookingStatus.Pending]: 'warning',
    [BookingStatus.Confirmed]: 'success',
    [BookingStatus.Completed]: 'info',
    [BookingStatus.Cancelled]: 'secondary',
    [BookingStatus.NoShow]: 'danger'
  };
  return severityMap[status] || 'info';
}

/**
 * 獲取預約狀態顏色（用於日曆顯示）
 * @param status 預約狀態
 * @returns 狀態對應的顏色代碼
 */
export function getBookingStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    [BookingStatus.Pending]: '#F59E0B', // amber-500
    [BookingStatus.Confirmed]: '#22C55E', // green-500
    [BookingStatus.Completed]: '#3B82F6', // blue-500
    [BookingStatus.Cancelled]: '#9CA3AF', // gray-400
    [BookingStatus.NoShow]: '#EF4444' // red-500
  };
  return colorMap[status] || '#3B82F6';
}

/**
 * 獲取課程狀態標籤
 * @param status 課程狀態
 * @returns 狀態對應的中文標籤
 */
export function getCourseStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    [CourseStatus.ACTIVE]: '已上架',
    [CourseStatus.INACTIVE]: '已下架',
    [CourseStatus.DRAFT]: '草稿',
    [CourseStatus.SCHEDULED]: '定時上架'
  };
  return statusMap[status] || status;
}

/**
 * 獲取課程狀態嚴重性（用於 UI 顯示）
 * @param status 課程狀態
 * @returns 狀態對應的嚴重性級別
 */
export function getCourseStatusSeverity(status: string): string {
  const severityMap: Record<string, string> = {
    [CourseStatus.ACTIVE]: 'success',
    [CourseStatus.INACTIVE]: 'secondary',
    [CourseStatus.DRAFT]: 'info',
    [CourseStatus.SCHEDULED]: 'warning'
  };
  return severityMap[status] || 'info';
} 
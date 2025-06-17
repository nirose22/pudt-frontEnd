import { date } from "zod";

export function formatDateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function formatDateString(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW');
}

export function isSameDate(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export function inRange<T>(start: Date, end: Date, data: T[], getDate?: (item: T) => Date): T[] {
    const range = { start, end };
    return !range
        ? data
        : data.filter(item => {
            const dateObj = getDate ? getDate(item) : (item as any).date;
            return isWithinInterval(dateObj, range);
        });
}

export function byDate<T>(data: T[], getDate?: (item: T) => Date): Record<string, T[]> {
    return data.reduce<Record<string, T[]>>((map, item) => {
        // 如果提供了獲取日期的函數，則使用它，否則假設有 date 屬性
        const dateObj = getDate ? getDate(item) : (item as any).date;
        const date = formatDateKey(new Date(dateObj));
        
        if (!map[date]) {
            map[date] = [];
        }
        map[date].push(item);
        return map;
    }, {});
}

export function isWithinInterval(date: Date, interval: { start: Date; end: Date }) {
    return date >= interval.start && date <= interval.end;
}

/**
 * 格式化日期為 YYYY/MM/DD 格式
 * @param date 日期對象或日期字符串
 * @returns 格式化後的日期字符串
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * 格式化時間為 HH:MM 格式
 * @param date 日期對象或日期字符串
 * @returns 格式化後的時間字符串
 */
export function formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 格式化日期和時間為 YYYY/MM/DD HH:MM 格式
 * @param date 日期對象或日期字符串
 * @returns 格式化後的日期時間字符串
 */
export function formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 格式化為自定義格式的日期時間
 * @param date 日期對象或日期字符串
 * @param format 自定義格式，支持以下占位符：
 *  - YYYY: 年份（4位）
 *  - MM: 月份（2位，補0）
 *  - M: 月份（不補0）
 *  - DD: 日期（2位，補0）
 *  - D: 日期（不補0）
 *  - HH: 小時（24小時制，2位，補0）
 *  - H: 小時（24小時制，不補0）
 *  - mm: 分鐘（2位，補0）
 *  - m: 分鐘（不補0）
 *  - ss: 秒（2位，補0）
 *  - s: 秒（不補0）
 * @returns 格式化後的字符串
 */
export function formatCustom(date: Date | string, format: string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();
    
    return format
        .replace('YYYY', year.toString())
        .replace('MM', month.toString().padStart(2, '0'))
        .replace('M', month.toString())
        .replace('DD', day.toString().padStart(2, '0'))
        .replace('D', day.toString())
        .replace('HH', hours.toString().padStart(2, '0'))
        .replace('H', hours.toString())
        .replace('mm', minutes.toString().padStart(2, '0'))
        .replace('m', minutes.toString())
        .replace('ss', seconds.toString().padStart(2, '0'))
        .replace('s', seconds.toString());
}

/**
 * 格式化為相對時間（例如：剛剛、10分鐘前、1小時前等）
 * @param date 日期對象或日期字符串
 * @returns 相對時間字符串
 */
export function formatRelativeTime(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return '剛剛';
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 30) return `${days}天前`;
    
    return formatDate(date);
}

export function getBookingStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        'pending': '待確認',
        'confirmed': '已確認',
        'completed': '已完成',
        'cancelled': '已取消',
        'noshow': '未出席'
    };
    return statusMap[status] || status;
}

export function getBookingStatusSeverity(status: string): string {
    const severityMap: Record<string, string> = {
        'pending': 'warning',
        'confirmed': 'success',
        'completed': 'info',
        'cancelled': 'secondary',
        'noshow': 'danger'
    };
    return severityMap[status] || 'info';
}

/**
 * 創建相對日期
 * @param days 相對天數（負數表示過去，正數表示未來）
 * @returns Date 對象
 */
export function createRelativeDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

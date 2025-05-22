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
        // 如果提供了获取日期的函数，则使用它，否则假设有 date 属性
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
 * 格式化日期为 YYYY/MM/DD 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    return `${dateObj.getFullYear()}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;
}

/**
 * 格式化时间为 HH:MM 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    return `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 格式化日期和时间为 YYYY/MM/DD HH:MM 格式
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * 格式化为自定义格式的日期时间
 * @param date 日期对象或日期字符串
 * @param format 自定义格式，支持以下占位符：
 *  - YYYY: 年份（4位）
 *  - MM: 月份（2位，补0）
 *  - M: 月份（不补0）
 *  - DD: 日期（2位，补0）
 *  - D: 日期（不补0）
 *  - HH: 小时（24小时制，2位，补0）
 *  - H: 小时（24小时制，不补0）
 *  - mm: 分钟（2位，补0）
 *  - m: 分钟（不补0）
 *  - ss: 秒（2位，补0）
 *  - s: 秒（不补0）
 * @returns 格式化后的字符串
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
 * 格式化为相对时间（例如：刚刚、10分钟前、1小时前等）
 * @param date 日期对象或日期字符串
 * @returns 相对时间字符串
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

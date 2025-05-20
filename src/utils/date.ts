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

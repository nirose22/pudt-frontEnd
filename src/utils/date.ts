
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

export function inRange(start: Date, end: Date, data: any[]) {
    const range = { start, end };
    return !range
        ? data
        : data.filter(b =>
            isWithinInterval(new Date(b.date), range)
        )
}

export function byDate(data: any[]) {
    return data.reduce<Record<string, any[]>>((map, b) => {
        const date = formatDateKey(new Date(b.date));
        if (!map[date]) {
            map[date] = []
        }
        map[date].push(b)
        return map
    }, {})
}

export function isWithinInterval(date: Date, interval: { start: Date; end: Date }) {
    return date >= interval.start && date <= interval.end;
}

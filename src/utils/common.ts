export function formatDateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function isSameDate(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export function isWithinInterval(date: Date, interval: { start: Date; end: Date }) {
    return date >= interval.start && date <= interval.end;
}

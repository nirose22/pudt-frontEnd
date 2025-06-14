/**
 * 簡單的 debounce 函數
 * @param func 要防抖的函數
 * @param delay 防抖延遲時間
 * @returns 防抖後的函數
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: ReturnType<typeof setTimeout>;
    return ((...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
}
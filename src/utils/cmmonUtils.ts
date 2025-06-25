/**
 * 增強的 debounce 函數，支持手動取消
 * @param func 要防抖的函數
 * @param delay 防抖延遲時間
 * @returns 防抖後的函數，包含 cancel 方法
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const debouncedFunc = ((...args: any[]) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
            timeoutId = null;
        }, delay);
    }) as T;
    
    // 添加取消方法
    (debouncedFunc as any).cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };
    
    return debouncedFunc as T & { cancel: () => void };
}
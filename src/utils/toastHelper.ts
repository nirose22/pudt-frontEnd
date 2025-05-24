import { useToast } from 'primevue/usetoast';
import type { ToastServiceMethods } from 'primevue/toastservice';

// Toast 配置類型
interface ToastOptions {
  summary?: string;
  detail?: string;
  life?: number;
  group?: string;
  sticky?: boolean;
  closable?: boolean;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

// 默認配置
const DEFAULT_OPTIONS: ToastOptions = {
  life: 3000,
  group: 'global',
  sticky: false,
  closable: true,
  position: 'top-right'
};

// 全局 toast 實例
let toast: ToastServiceMethods | null = null;

// 初始化 toast
export function initToast(toastInstance?: ToastServiceMethods) {
  toast = toastInstance || useToast();
}

/**
 * 顯示 Toast 消息
 * @param severity 消息類型
 * @param options Toast 配置選項
 */
function showToast(severity: 'success' | 'error' | 'info' | 'warn', options: ToastOptions) {
  if (!toast) {
    console.warn('Toast not initialized. Call initToast() first.');
    return;
  }

  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    severity
  };

  // 檢查是否在短時間內重複顯示相同消息
  const key = `${severity}-${options.summary}-${options.detail}`;
  const now = Date.now();
  const lastShown = (window as any).__lastToastShown?.[key] || 0;
  
  if (now - lastShown < 2000) { // 2秒內不重複顯示
    return;
  }

  // 記錄最後顯示時間
  if (!(window as any).__lastToastShown) {
    (window as any).__lastToastShown = {};
  }
  (window as any).__lastToastShown[key] = now;

  toast.add(mergedOptions);
}

/**
 * 顯示成功消息
 * @param detail 詳細信息
 * @param summary 標題，默認為"成功"
 * @param options 其他配置選項
 */
export function showSuccess(detail: string, summary = '成功', options: Partial<ToastOptions> = {}) {
  showToast('success', { summary, detail, ...options });
}

/**
 * 顯示錯誤消息
 * @param detail 詳細信息
 * @param summary 標題，默認為"錯誤"
 * @param options 其他配置選項
 */
export function showError(detail: string, summary = '錯誤', options: Partial<ToastOptions> = {}) {
  showToast('error', { summary, detail, ...options });
}

/**
 * 顯示信息提示
 * @param detail 詳細信息
 * @param summary 標題，默認為"提示"
 * @param options 其他配置選項
 */
export function showInfo(detail: string, summary = '提示', options: Partial<ToastOptions> = {}) {
  showToast('info', { summary, detail, ...options });
}

/**
 * 顯示警告消息
 * @param detail 詳細信息
 * @param summary 標題，默認為"警告"
 * @param options 其他配置選項
 */
export function showWarn(detail: string, summary = '警告', options: Partial<ToastOptions> = {}) {
  showToast('warn', { summary, detail, ...options });
}

/**
 * 清除所有 Toast 消息
 */
export function clearToasts() {
  toast?.removeAllGroups();
}

/**
 * 清除指定 group 的 Toast 消息
 * @param group Toast 組名
 */
export function clearToastGroup(group: string) {
  toast?.removeGroup(group);
} 
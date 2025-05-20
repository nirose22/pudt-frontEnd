import { useToast } from 'primevue/usetoast';

// 全局 toast 實例
let toast: ReturnType<typeof useToast> | null = null;

// 初始化 toast
export function initToast(toastInstance?: ReturnType<typeof useToast>) {
  toast = toastInstance || useToast();
}

/**
 * 顯示成功消息
 * @param detail 詳細信息
 * @param summary 標題，默認為"成功"
 * @param life 顯示時間（毫秒），默認3000
 */
export function showSuccess(detail: string, summary = '成功', life = 3000) {
  toast?.add({
    severity: 'success',
    summary,
    detail,
    life
  });
}

/**
 * 顯示錯誤消息
 * @param detail 詳細信息
 * @param summary 標題，默認為"錯誤"
 * @param life 顯示時間（毫秒），默認3000
 */
export function showError(detail: string, summary = '錯誤', life = 3000) {
  toast?.add({
    severity: 'error',
    summary,
    detail,
    life
  });
}

/**
 * 顯示信息提示
 * @param detail 詳細信息
 * @param summary 標題，默認為"提示"
 * @param life 顯示時間（毫秒），默認3000
 */
export function showInfo(detail: string, summary = '提示', life = 3000) {
  toast?.add({
    severity: 'info',
    summary,
    detail,
    life
  });
}

/**
 * 顯示警告消息
 * @param detail 詳細信息
 * @param summary 標題，默認為"警告"
 * @param life 顯示時間（毫秒），默認3000
 */
export function showWarn(detail: string, summary = '警告', life = 3000) {
  toast?.add({
    severity: 'warn',
    summary,
    detail,
    life
  });
} 
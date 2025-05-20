import { useConfirm } from 'primevue/useconfirm';

// 定義確認對話框選項介面
interface ConfirmationOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
  onHide?: () => void;
  acceptClass?: string;
  rejectClass?: string;
  acceptIcon?: string;
  rejectIcon?: string;
  [key: string]: any;
}

// 全局 confirm 實例
let confirm: ReturnType<typeof useConfirm> | null = null;

// 初始化 confirm
export function initConfirm(confirmInstance?: ReturnType<typeof useConfirm>) {
  confirm = confirmInstance || useConfirm();
}

/**
 * 顯示確認對話框
 * @param options 確認對話框選項
 */
export function showConfirm(options: ConfirmationOptions) {
  confirm?.require(options);
}

/**
 * 關閉所有確認對話框
 */
export function closeConfirm() {
  confirm?.close();
} 
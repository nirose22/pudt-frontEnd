import { CardType } from '@/enums/Cards';
import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus';

/**
 * 購買記錄介面 - 擴展自Order
 * 頁面展示使用的購買記錄，包含Order的基本字段和一些展示需要的附加字段
 */
export interface PurchaseItem {
  id: number;                  // 訂單號
  date: string;                // 購買日期 (字符串格式，与UI端配合)
  cardType: CardType;          // 課卡類型
  amount: number;              // 金額
  points: number;              // 點數
  status: OrderStatus;         // 狀態
  paymentMethod: PaymentMethod; // 支付方式
  invoiceNo?: string;          // 發票號碼
}

/**
 * 擴展購買記錄介面 - 包含更多顯示信息
 */
export interface ExtendedPurchaseItem extends PurchaseItem {
  invoiceAvailable?: boolean;  // 是否可下載發票
  invoiceNumber?: string;      // 發票號碼
  invoiceDate?: string;        // 發票日期
  paymentDate?: string;        // 支付日期
  expiry?: string;             // 有效期
} 

// 定義未付清項目介面
export interface UnpaidItem {
  id: number;
  date: string;
  cardType: CardType;
  amount: number;
  dueDate: string;
}
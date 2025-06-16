import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus';

// Order 訂單主表
export interface Order {
  id: number;               // PK，自動遞增 ID
  userId: number;           // FK → User.id，表示是哪位會員下單
  sn: string;               // 唯一訂單號（建議使用流水號或 UUID）
  total: number;            // 訂單總金額（單位：TWD）
  status: OrderStatus;      // 訂單狀態（如 pending / paid / completed）
  payMethod: PaymentMethod; // 支付方式（如 credit_card / line_pay）
  txnId?: string;           // 第三方支付回傳的交易編號（可選）
  invoiceNo?: string;       // 發票號碼（可選）
  createdAt: Date;          // 建立時間
}

// OrderItem 訂單明細表
export interface OrderItem {
  id: number;             // PK
  orderId: number;        // FK → Order.id（關聯主表）
  name: string;           // 購買項目名稱（如「課程點數卡 - PRO」）
  qty: number;            // 數量（通常為 1）
  unitPrice: number;      // 單價（單位：TWD）
}
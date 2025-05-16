
// 統一訂單狀態（適用於購買、預約、付款等流程）
export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Processing = 'PROCESSING',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
  Refunded = 'REFUNDED'
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: '待付款',
  [OrderStatus.Paid]: '已付款',
  [OrderStatus.Processing]: '處理中',
  [OrderStatus.Completed]: '已完成',
  [OrderStatus.Cancelled]: '已取消',
  [OrderStatus.Refunded]: '已退款'
}


export enum PaymentMethod {
  CreditCard = 'CREDIT_CARD',
  LinePay = 'LINE_PAY',
  ApplePay = 'APPLE_PAY',
  BankTransfer = 'BANK_TRANSFER',
  GooglePay = 'GOOGLE_PAY',
  Cash = 'CASH',
  MobilePayment = 'MOBILE_PAYMENT'
}

export const PaymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: '信用卡',
  [PaymentMethod.LinePay]: 'LINE Pay',
  [PaymentMethod.ApplePay]: 'Apple Pay',
  [PaymentMethod.BankTransfer]: '銀行轉帳',
  [PaymentMethod.GooglePay]: 'Google Pay',
  [PaymentMethod.Cash]: '現金',
  [PaymentMethod.MobilePayment]: '行動支付'
}


/**
 * 獲取訂單狀態標籤
 * @param status 訂單狀態
 * @returns 訂單狀態標籤
 */
export function getOrderStatusLabel(status: string): string {
  return OrderStatusLabel[status as OrderStatus] || '未知狀態';
}

/**
 * 獲取付款方式標籤
 * @param method 付款方式
 * @returns 付款方式標籤
 */
export function getPaymentMethodLabel(method: string): string {
  return PaymentMethodLabel[method as PaymentMethod] || '未知付款方式';
}



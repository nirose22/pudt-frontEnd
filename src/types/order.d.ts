import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus';

export interface Order {
  id: number
  userId: number
  sn: string                  // 訂單流水號
  total: number
  status: OrderStatus
  payMethod: PaymentMethod
  txnId?: string  // 交易 ID
  invoiceNo?: string
  createdAt: Date
}

export interface OrderItem {
  id: number
  orderId: number
  name: string
  qty: number
  unitPrice: number
  courseId?: number           // 若購買為課程點數
}
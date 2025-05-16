import type { CardType } from "@/enums/Cards"
import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus'

/**
 * 購買歷史記錄項目
 */
export interface PurchaseItem {
  id: number
  date: string | Date
  cardType: CardType,    // 課卡名稱
  amount: number      // 金額
  points: number      // 點數
  status: OrderStatus
  paymentMethod?: PaymentMethod // 付款方式
  invoiceNo?: string  // 發票號碼
}

/**
 * 未付清項目
 */
export interface UnpaidItem {
  id: number
  date: string | Date
  cardType: CardType // 課卡名稱
  amount: number // 金額
  dueDate?: string | Date // 到期日
}
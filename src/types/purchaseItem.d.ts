import type { CardType } from "@/enums/Cards"
import type { PurchaseStatus, PurchaseType, PurchasePaymentMethod } from "@/enums/Purchase"

/**
 * 購買歷史記錄項目
 */
export interface PurchaseItem {
  id: number
  date: string | Date
  cardType: CardType,    // 課卡名稱
  amount: number      // 金額
  points: number      // 點數
  status: PurchaseStatus
  paymentMethod?: PurchasePaymentMethod // 付款方式
  invoiceNo?: string  // 發票號碼
}

/**
 * 未付清項目
 */
export interface UnpaidItem {
  id: number
  date: string | Date
  itemName: string
  amount: number
  amountPaid: number
  amountDue: number
  dueDate?: string | Date
}
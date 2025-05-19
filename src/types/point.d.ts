import type { PointType, PointKind } from "@/enums/Point"
import type { CardType } from "@/enums/Cards"
/**
 * 點數歷史
 */
// export interface PointTxn {
//   date: string | Date
//   type: PointType
//   description: string,
//   points: number
//   balance: number
// }
/* ---------- 點數流水 ---------- */
export interface PointTxn {
  id: number
  userId: number
  kind: PointKind
  amount: number              // 正或負值
  balance: number             // 當下餘額
  refType?: PointRefType
  refId?: number          // 關聯 Order.id / Booking.id
  note?: string
  createdAt: Date
  expireAt?: Date
}

/**
 * 點數套餐
 * 資料表 points_card
 */
export interface PointsCard {
  id: number
  type: CardType
  points: number
  price: number
  description: string
  discount?: string
}
import type { PointType } from "@/enums/Point"
import type { CardType } from "@/enums/Cards"
/**
 * 點數歷史
 */
export interface PointHistoryItem {
  date: string | Date
  type: PointType
  description: string,
  points: number
  balance: number
}

/**
 * 點數套餐
 */
export interface PointsCard {
  id: number
  type: CardType
  points: number
  price: number
  description: string
  discount?: string
}
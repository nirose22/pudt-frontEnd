import type { Result } from '@/types';
import type { Order } from '@/types/order';
import type { ExtendedPurchaseItem } from '@/types/purchase';
import { CardType } from '@/enums/Cards';
import  api from '@/utils/api';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig';
import { request } from '@/utils/requestHelper';

/**
 * 購買服務 - 處理購買記錄和訂單相關功能
 */
export const PurchaseService = {
    /**
     * 獲取用戶的購買歷史
     * @param userId 用戶ID
     * @returns Promise<ExtendedPurchaseItem[]> 購買記錄列表
     */
    async getPurchaseHistory(userId: number): Promise<Result<ExtendedPurchaseItem[]>> {
        return request<ExtendedPurchaseItem[]>(
            () => api.get(API_ROUTES.PURCHASE.HISTORY(userId)),
            ERROR_MESSAGES.PURCHASE_ERROR
        );
    },
    
    /**
     * 將Order轉換為ExtendedPurchaseItem
     * @param orders Order數組
     * @returns ExtendedPurchaseItem數組
     */
    convertOrdersToPurchaseItems(orders: Order[]): ExtendedPurchaseItem[] {
        return orders.map(order => ({
            id: order.id,
            date: order.createdAt.toISOString().split('T')[0],
            cardType: CardType.Basic, // 使用正確的枚舉值
            amount: order.total,
            points: 0, // 需要從OrderItem中計算
            status: order.status,
            paymentMethod: order.payMethod,
            invoiceNo: order.invoiceNo,
            invoiceAvailable: !!order.invoiceNo,
            invoiceNumber: order.invoiceNo,
            invoiceDate: order.createdAt.toISOString().split('T')[0]
        }));
    },
    
    /**
     * 下載發票
     * @param invoiceNo 發票號碼
     * @returns 下載結果
     */
    async downloadInvoice(invoiceNo: string): Promise<Result<void>> {
        return request<void>(
            () => api.get(API_ROUTES.PURCHASE.INVOICE(invoiceNo)),
            ERROR_MESSAGES.PURCHASE_ERROR
        );
    }
}; 
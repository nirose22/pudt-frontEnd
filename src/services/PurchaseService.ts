import type { Result } from '@/types';
import type { Order } from '@/types/order';
import type { ExtendedPurchaseItem } from '@/types/purchase';
import { CardType } from '@/enums/Cards';
import { apiClient } from '@/utils/api';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig';
import { request } from '@/utils/requestHelper';

/**
 * 购买服务 - 处理购买记录和订单相关功能
 */
export const PurchaseService = {
    /**
     * 获取用户的购买历史
     * @param userId 用户ID
     * @returns Promise<ExtendedPurchaseItem[]> 购买记录列表
     */
    async getPurchaseHistory(userId: number): Promise<Result<ExtendedPurchaseItem[]>> {
        return request<ExtendedPurchaseItem[]>(
            () => apiClient.get(API_ROUTES.PURCHASE.HISTORY(userId)),
            ERROR_MESSAGES.PURCHASE_ERROR
        );
    },
    
    /**
     * 将Order转换为ExtendedPurchaseItem
     * @param orders Order数组
     * @returns ExtendedPurchaseItem数组
     */
    convertOrdersToPurchaseItems(orders: Order[]): ExtendedPurchaseItem[] {
        return orders.map(order => ({
            id: order.id,
            date: order.createdAt.toISOString().split('T')[0],
            cardType: CardType.Basic, // 使用正确的枚举值
            amount: order.total,
            points: 0, // 需要从OrderItem中计算
            status: order.status,
            paymentMethod: order.payMethod,
            invoiceNo: order.invoiceNo,
            invoiceAvailable: !!order.invoiceNo,
            invoiceNumber: order.invoiceNo,
            invoiceDate: order.createdAt.toISOString().split('T')[0]
        }));
    },
    
    /**
     * 下载发票
     * @param invoiceNo 发票号码
     * @returns 下载结果
     */
    async downloadInvoice(invoiceNo: string): Promise<Result<void>> {
        return request<void>(
            () => apiClient.get(API_ROUTES.PURCHASE.INVOICE(invoiceNo)),
            ERROR_MESSAGES.PURCHASE_ERROR
        );
    }
}; 
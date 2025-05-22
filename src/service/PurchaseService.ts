import type { Result } from '@/types';
import type { Order, OrderItem } from '@/types/order';
import type { ExtendedPurchaseItem } from '@/types/purchase';
import { OrderStatus, PaymentMethod } from '@/enums/PurchaseStatus';
import { CardType } from '@/enums/Cards';

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
        try {
            // TODO: 实际环境调用后端API
            // API: GET /api/users/{userId}/purchase-history
            
            // 模拟数据
            const mockPurchases: ExtendedPurchaseItem[] = [
                {
                    id: 1,
                    date: '2025-05-01',
                    cardType: CardType.Advanced,
                    amount: 1000,
                    points: 10,
                    status: OrderStatus.Paid,
                    paymentMethod: PaymentMethod.CreditCard,
                    invoiceNo: 'INV-001',
                    invoiceAvailable: true,
                    invoiceNumber: 'INV-001',
                    invoiceDate: '2025-05-01',
                    paymentDate: '2025-05-01',
                    expiry: '2026-05-01'
                },
                {
                    id: 2,
                    date: '2025-04-15',
                    cardType: CardType.Advanced,
                    amount: 1800,
                    points: 20,
                    status: OrderStatus.Pending,
                    paymentMethod: PaymentMethod.CreditCard,
                    invoiceAvailable: false
                },
                {
                    id: 3,
                    date: '2025-03-20',
                    cardType: CardType.VIP,
                    amount: 5000,
                    points: 100,
                    status: OrderStatus.Paid,
                    paymentMethod: PaymentMethod.CreditCard,
                    invoiceNo: 'INV-003',
                    invoiceAvailable: true,
                    invoiceNumber: 'INV-003',
                    invoiceDate: '2025-03-20',
                    paymentDate: '2025-03-20',
                    expiry: '2026-03-20'
                },
                {
                    id: 4,
                    date: '2025-02-10',
                    cardType: CardType.VIP,
                    amount: 2000,
                    points: 50,
                    status: OrderStatus.Pending,
                    paymentMethod: PaymentMethod.CreditCard,
                    invoiceAvailable: false
                },
                {
                    id: 5,
                    date: '2025-01-01',
                    cardType: CardType.VIP,
                    amount: 1000,
                    points: 10,
                    status: OrderStatus.Paid,
                    paymentMethod: PaymentMethod.CreditCard,
                    invoiceNo: 'INV-005',
                    invoiceAvailable: true,
                    invoiceNumber: 'INV-005',
                    invoiceDate: '2025-01-01',
                    paymentDate: '2025-01-01',
                    expiry: '2026-01-01'
                }
            ];
            
            return { success: true, data: mockPurchases };
        } catch (error) {
            console.error('获取购买历史失败:', error);
            return { success: false, message: '获取购买历史失败', error };
        }
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
        try {
            // TODO: 实际环境调用后端API
            // API: GET /api/invoices/{invoiceNo}/download
            
            // 模拟下载成功
            return { success: true, message: '发票下载成功' };
        } catch (error) {
            console.error('下载发票失败:', error);
            return { success: false, message: '下载发票失败', error };
        }
    }
}; 
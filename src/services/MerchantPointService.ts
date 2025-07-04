import type { PointTransaction, PointStats } from '@/types/point';
import type { Result } from '@/types';
import  api from '@/utils/api';
import { API_ROUTES, ERROR_MESSAGES } from '@/utils/apiConfig';
import { request } from '@/utils/requestHelper';

export const MerchantPointService = {
    /**
     * 獲取商家點數統計
     * @param merchantId 商家ID
     * @returns 點數統計資訊
     */
    async getPointsStats(merchantId: number): Promise<Result<PointStats>> {
        return request<PointStats>(
            () => api.get(API_ROUTES.MERCHANT.POINTS_STATS(merchantId))
        );
    },

    /**
     * 獲取商家點數交易記錄
     * @param merchantId 商家ID
     * @returns 交易記錄列表
     */
    async getTransactions(merchantId: number): Promise<Result<PointTransaction[]>> {
        return request<PointTransaction[]>(
            () => api.get(API_ROUTES.MERCHANT.POINTS_TRANSACTIONS(merchantId))
        );
    },

    /**
     * 提交點數結算申請
     * @param merchantId 商家ID
     * @param amount 結算點數
     * @param bankInfo 銀行帳戶資訊
     * @returns 申請結果
     */
    async submitSettlement(
        merchantId: number,
        amount: number,
        bankInfo: {
            code: string;
            account: string;
            name: string;
        }
    ): Promise<Result<void>> {
        return request<void>(
            () => api.post(API_ROUTES.MERCHANT.POINTS_SETTLEMENT(merchantId), {
                amount,
                bankInfo
            })
        );
    }
}; 
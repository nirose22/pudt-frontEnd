import type { PointTransaction, PointStats } from '@/types/point';
import type { Result } from '@/types';
import apiClient from '@/utils/api';

export const MerchantPointService = {
    /**
     * 獲取商家點數統計
     * @param merchantId 商家ID
     * @returns 點數統計資訊
     */
    async getPointsStats(merchantId: number): Promise<PointStats> {
        try {
            return await apiClient.get<PointStats>(`/merchants/${merchantId}/points/stats`);
        } catch (error) {
            console.error('獲取點數統計失敗:', error);
            throw error;
        }
    },

    /**
     * 獲取商家點數交易記錄
     * @param merchantId 商家ID
     * @returns 交易記錄列表
     */
    async getTransactions(merchantId: number): Promise<PointTransaction[]> {
        try {
            return await apiClient.get<PointTransaction[]>(`/merchants/${merchantId}/points/transactions`);
        } catch (error) {
            console.error('獲取交易記錄失敗:', error);
            throw error;
        }
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
    ): Promise<Result> {
        try {
            return await apiClient.post<Result>(`/merchants/${merchantId}/points/settlement`, {
                amount,
                bankInfo
            });
        } catch (error) {
            console.error('提交結算申請失敗:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : '提交結算申請失敗，請稍後再試'
            };
        }
    }
}; 
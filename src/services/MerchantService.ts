import type { Merchant } from "@/types";
import apiClient from '@/utils/api';
import { API_ROUTES } from '@/utils/apiConfig';

export const MerchantService = {
    /**
     * 獲取商家信息
     * @param merchantId 商家ID
     * @returns 商家詳細信息
     */
    async getMerchant(merchantId: number): Promise<Merchant> {
        try {
            // 使用 apiClient 調用 API
            return await apiClient.get<Merchant>(`/merchants/${merchantId}`);
            
            /* 暫時保留模擬數據，待後端 API 完成後移除
            return Promise.resolve({
                id: merchantId,
                email: 'merchant@example.com',
                name: `商家 ${merchantId}`,
                address: '台北市信義區和平東路一段100號',
                phone: '02-2345-6789',
                description: '專業課程提供商，提供多種優質課程選擇。',
                rating: Number((4.5 + Math.random() * 0.5).toFixed(1)), 
                reviewCount: Math.floor(Math.random() * 50) + 10,
                businessHours: '週一至週五 9:00-21:00，週六至週日 10:00-18:00',
                type: '教育培訓',
                website: 'https://example.com',
                googleMapUrl: 'https://maps.google.com/?q=台北市信義區和平東路一段100號',
                createdAt: new Date(),
            });
            */
        } catch (error) {
            console.error('获取商家信息失败:', error);
            throw error;
        }
    }
}; 
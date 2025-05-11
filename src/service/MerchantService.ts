import type { MerchantInfo } from "@/types/course";

export const MerchantService = {
    /**
     * 獲取商家信息
     * @param merchantId 商家ID
     * @returns 商家詳細信息
     */
    getMerchantInfo(merchantId: number): Promise<MerchantInfo> {
        // TODO: 從後端獲取商家詳細信息
        // API: /api/merchants/{merchantId}
        // 模擬 API 響應
        return Promise.resolve({
            id: merchantId,
            name: `商家 ${merchantId}`,
            address: '台北市信義區和平東路一段100號',
            phone: '02-2345-6789',
            description: '專業課程提供商，提供多種優質課程選擇。',
            rating: 4.5 + Math.random() * 0.5, // 4.5-5.0 之間的隨機評分
            reviewCount: Math.floor(Math.random() * 50) + 10, // 10-60 之間的隨機評論數
            businessHours: '週一至週五 9:00-21:00，週六至週日 10:00-18:00',
            type: '教育培訓',
            website: 'https://example.com',
            googleMapUrl: 'https://maps.google.com/?q=台北市信義區和平東路一段100號'
        });
    }
}; 
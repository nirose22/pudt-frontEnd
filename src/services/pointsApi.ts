import type { Result, User } from '@/types'
import api from '@/utils/api'
import { API_ROUTES } from '@/utils/apiConfig'
import { request } from '@/utils/requestHelper'
import axios from 'axios';

export interface PointsCard {
    id: number;
    name: string;
    description: string;
    points: number;
    price: number;
}

export interface PointTransaction {
    id: number;
    userId: number;
    kind: string;
    amount: number;
    balance: number;
    refType: string;
    refId?: number;
    note: string;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

/**
 * 點數管理 API 服務類
 */
export class PointsApiService {
    /**
     * 獲取可購買的點數卡列表
     */
    static async getPointsCards(): Promise<Result<PointsCard[]>> {
        return request<PointsCard[]>(() => api.get(API_ROUTES.POINTS.CARDS));
    }

    /**
     * 獲取當前用戶的點數交易歷史
     */
    static async getPointsHistory(): Promise<Result<PointTransaction[]>> {
        return request<PointTransaction[]>(() => api.get(API_ROUTES.POINTS.HISTORY));
    }

    /**
     * 獲取指定用戶的點數交易歷史（管理員功能）
     */
    static async getUserPointsHistory(userId: number): Promise<Result<PointTransaction[]>> {
        return request<PointTransaction[]>(() => api.get(`${API_ROUTES.POINTS.HISTORY}/${userId}`));
    }

    /**
     * 購買點數卡（簡化流程）
     */
    static async buyPointsCard(cardId: number): Promise<Result<string>> {
        return request<string>(() => api.post(API_ROUTES.POINTS.BUY, { cardId }));
    }

    /**
     * 點數轉移（預留功能）
     */
    static async transferPoints(data: {
        fromUserId: number;
        toUserId: number;
        amount: number;
        note?: string;
    }): Promise<Result<string>> {
        return request<string>(() => api.post(API_ROUTES.POINTS.TRANSFER, data));
    }

    /**
     * 調整用戶點數（管理員功能）
     */
    static async adjustUserPoints(userId: number, data: {
        amount: number;
        note?: string;
     }): Promise<Result<PointTransaction>> {
        return request<PointTransaction>(() => api.post(`${API_ROUTES.POINTS.ADJUST}/${userId}`, data));
    }
}

// 導出便利方法
export const pointsApi = PointsApiService; 
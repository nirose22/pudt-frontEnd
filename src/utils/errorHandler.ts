import type { Result } from '@/types';
import { ERROR_MESSAGES } from './apiConfig';

/**
 * 統一錯誤處理工具
 */
export const errorHandler = {
    /**
     * 處理 API 錯誤
     * @param error 錯誤對象
     * @param message 錯誤消息
     * @returns 標準化的錯誤結果
     */
    handleApiError<T>(error: unknown, message: string, code?: number): Result<T> {
        console.error(message, error);
        return {
            success: false,
            message: message,
            code: code,
            data: null as unknown as T
        };
    },

    /**
     * 處理業務邏輯錯誤
     * @param error 錯誤對象
     * @param message 錯誤消息
     * @returns 標準化的錯誤結果
     */
    handleBusinessError<T>(error: unknown, message: string): Result<T> {
        console.error(message, error);
        return {
            success: false,
            message: message,
            data: null as unknown as T
        };
    },

    /**
     * 處理網絡錯誤
     * @param error 錯誤對象
     * @param message 錯誤消息
     * @returns 標準化的錯誤結果
     */
    handleNetworkError<T>(error: unknown, message: string): Result<T> {
        console.error(message, error);
        return {
            success: false,
            message: message,
            data: null as unknown as T
        };
    }
}; 
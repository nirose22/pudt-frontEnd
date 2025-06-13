import type { Result } from '@/types'
import { errorHandler } from './errorHandler'
import { ERROR_MESSAGES } from './apiConfig'

/**
 * 統一封裝 API 請求，處理錯誤並返回標準化結果
 * @param fn API 請求函數
 * @returns Promise<Result<T>>
 */
export async function request<T>(
    fn: () => Promise<Result<T>>
): Promise<Result<T>> {
    return await fn().then(res => {
        return res.data as unknown as Result<T>;
    }).catch(error => {
        return errorHandler.handleApiError(
            new Error(error.response.data.message),
            error.response.data.message || ERROR_MESSAGES.SERVER_ERROR,
            error.response.data.code
        );
    });
}

/**
 * 構建查詢字符串
 * @param params 查詢參數對象
 * @returns 查詢字符串
 */
export function buildQueryString(params: Record<string, string | string[] | undefined>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) return
        if (Array.isArray(value)) {
            value.length && searchParams.append(key, value.join(','))
        } else {
            searchParams.append(key, value)
        }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
} 
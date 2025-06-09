import type { Result } from '@/types'
import { errorHandler } from './errorHandler'
import { ERROR_MESSAGES } from './apiConfig'

/**
 * 统一封装 API 请求，处理错误并返回标准化结果
 * @param fn API 请求函数
 * @param errorMessage 错误提示信息
 * @returns Promise<Result<T>>
 */
export async function request<T>(
    fn: () => Promise<any>,
): Promise<Result<T>> {
    const data = await fn().then(res => res.data);
    if (data.success) {
        return data.data;
    } else {
        return errorHandler.handleApiError(new Error(data.message), data.message || ERROR_MESSAGES.SERVER_ERROR)
    }
}

/**
 * 构建查询字符串
 * @param params 查询参数对象
 * @returns 查询字符串
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
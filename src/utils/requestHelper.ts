import type { Result } from '@/types'
import { errorHandler } from './errorHandler'
import { ERROR_MESSAGES } from './apiConfig'

/**
 * 统一封装 API 请求，处理错误并返回标准化结果
 * @param fn API 请求函数
 * @returns Promise<Result<T>>
 */
export async function request<T>(
    fn: () => Promise<Result<T>>
): Promise<Result<T>> {
    try {
        const response = await fn().then(res => res.data) as Result<T>;
        if (response.success) {
            console.log(response);
            
            return response;
        } else {
            console.log("*****************");
            console.log(response);
            console.log("*****************");
            
            return errorHandler.handleApiError(
                new Error(response.message), 
                response.message || ERROR_MESSAGES.SERVER_ERROR,
                response.code
            );
        }
    } catch (error) {
        return errorHandler.handleApiError(
            error instanceof Error ? error : new Error(ERROR_MESSAGES.SERVER_ERROR),
            ERROR_MESSAGES.SERVER_ERROR
        );
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
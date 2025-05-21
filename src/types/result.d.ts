/**
 * API 响应通用接口
 */
export interface Result<T = unknown> {
    success: boolean;
    data?: T;
    error?: unknown;
    message?: string;
}

// 导出别名，保持向后兼容性
export type ApiResponse<T = unknown> = Result<T>;

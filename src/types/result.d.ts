/**
 * API 響應通用接口
 */
export interface Result<T = unknown> {
    success: boolean;
    message?: string;
    code?: number;
    data?: T;
    timestamp?: number;
}

// 导出别名，保持向后兼容性
export type ApiResponse<T = unknown> = Result<T>;

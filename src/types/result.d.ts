/**
 * API 响应通用接口
 */
export interface Result<T = unknown> {
    success: boolean
    message?: string
    data?: T
    token?: string
    role?: UserRole
} 

// 导出别名，保持向后兼容性
export type ApiResponse<T = unknown> = Result<T>;

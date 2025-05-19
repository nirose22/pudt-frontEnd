// src/types/index.d.ts

export * from './photo'
export * from './course'
export * from './user'
export * from './booking'
export * from './result'
export * from './order'
export * from './merchant'
export * from './admin'
export * from './point'
export * from './message'
export * from './purchase'

/**
 * API 响应通用接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface Result<T = any> extends ApiResponse<T> {} 

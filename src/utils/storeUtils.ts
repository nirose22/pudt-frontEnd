import type { Result } from '@/types/result'

/**
 * Store 工具類
 * 提供 store 中常用的工具方法
 * 
 * 使用示例：
 * ```typescript
 * import { withLoading, clearError } from '@/utils/storeUtils'
 * 
 * // 在 store 中
 * const state = reactive({
 *   data: [],
 *   loading: false,
 *   error: null
 * })
 * 
 * async function fetchData() {
 *   return await withLoading(
 *     state,
 *     () => apiService.getData(),
 *     (data) => { state.data = data },
 *     '載入資料失敗'
 *   )
 * }
 * ```
 */

/**
 * 統一的 loading 和錯誤處理封裝
 * @param state 包含 loading 和 error 屬性的響應式狀態對象
 * @param action 要執行的異步操作
 * @param onSuccess 操作成功時的回調函數
 * @param customErrorMessage 自定義錯誤訊息
 * @returns Promise<Result<T>>
 */
export async function withLoading<T>(
  state: { loading: boolean; error: string | null },
  action: () => Promise<Result<T>>,
  onSuccess?: (data: T) => void,
  customErrorMessage?: string
): Promise<Result<T>> {
  state.loading = true
  state.error = null
  
  try {
    const result = await action()
    
    if (result.success && result.data && onSuccess) {
      onSuccess(result.data)
    } else if (!result.success) {
      state.error = customErrorMessage || result.message || '操作失敗'
    }
    
    return result
  } catch (error) {
    const errorMessage = customErrorMessage || '網路錯誤，請稍後再試'
    state.error = errorMessage
    console.error('Store operation failed:', error)
    
    return {
      success: false,
      message: errorMessage,
      data: null as T
    } as Result<T>
  } finally {
    state.loading = false
  }
}

/**
 * 清除狀態中的錯誤
 * @param state 包含 error 屬性的響應式狀態對象
 */
export function clearError(state: { error: string | null }) {
  state.error = null
}

/**
 * 創建基礎 store 狀態
 * @returns 包含 loading 和 error 的基礎狀態對象
 */
export function createBaseState() {
  return {
    loading: false,
    error: null as string | null
  }
}

/**
 * 重置基礎狀態
 * @param state 要重置的狀態對象
 */
export function resetBaseState(state: { loading: boolean; error: string | null }) {
  state.loading = false
  state.error = null
} 
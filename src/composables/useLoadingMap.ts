import { ref } from 'vue';

export function useLoadingMap() {
  const loadingMap = ref<Map<number, boolean>>(new Map());
  
  // 判斷某個 ID 是否正在加載中
  const isLoading = (id: number): boolean => {
    return loadingMap.value.get(id) === true;
  };
  
  // 設置某個 ID 的加載狀態
  const setLoading = (id: number, status: boolean): void => {
    loadingMap.value.set(id, status);
  };
  
  // 清空所有加載狀態
  const clearLoadingStates = (): void => {
    loadingMap.value.clear();
  };
  
  // 批量設置加載狀態
  const setLoadingBatch = (ids: number[], status: boolean): void => {
    ids.forEach(id => loadingMap.value.set(id, status));
  };
  
  return {
    loadingMap,
    isLoading,
    setLoading,
    clearLoadingStates,
    setLoadingBatch
  };
} 
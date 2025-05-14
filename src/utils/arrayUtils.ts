/**
 * 切換數組中的某個值（如果存在則移除，不存在則添加）
 * @param array 目標數組的 ref
 * @param value 要切換的值
 * @returns 切換後該值是否在數組中
 */
export function toggleItem<T>(array: T[], value: T): boolean {
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
    return false;
  } else {
    array.push(value);
    return true;
  }
}

/**
 * 檢查某個值是否在數組中
 * @param array 目標數組的 ref
 * @param value 要檢查的值
 * @returns 該值是否在數組中
 */
export function isItemInArray<T>(array: T[], value: T): boolean {
  return array.includes(value);
}

/**
 * 按主分類分組的子分類
 * @param mainCategories 主分類列表
 * @param subCategories 子分類列表
 * @param getMainCategory 從子分類獲取主分類的函數
 * @returns 按主分類分組的子分類
 */
export function groupByMainCategory<T, M>(
  mainCategories: M[],
  subCategories: T[],
  getMainCategory: (subCat: T) => M
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  
  // 初始化每個主分類的空數組
  mainCategories.forEach(mainCat => {
    groups[String(mainCat)] = [];
  });
  
  // 將子分類按主分類分組
  subCategories.forEach(subCat => {
    const mainCat = getMainCategory(subCat);
    console.log(mainCat);
    
    if (groups[String(mainCat)]) {
      groups[String(mainCat)].push(subCat);
    }
  });
  
  return groups;
} 
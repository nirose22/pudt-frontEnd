import { MainCategory, SubCategory, MainCategoryLabel, SubCategoryLabel } from '@/enums/CourseCategory';

/**
 * 獲取主分類列表
 * @returns 主分類列表
 */
export function getMainCategories() {
  return Object.keys(MainCategory).map(key => ({
    code: MainCategory[key as keyof typeof MainCategory],
    name: MainCategoryLabel[MainCategory[key as keyof typeof MainCategory]]
  }));
}

/**
 * 獲取子分類列表
 * @returns 子分類列表
 */
export function getSubCategories() {
  return Object.keys(SubCategory).map(key => ({
    code: SubCategory[key as keyof typeof SubCategory],
    name: SubCategoryLabel[SubCategory[key as keyof typeof SubCategory]],
    mainCategory: SubCategory[key as keyof typeof SubCategory].split('_')[0] as MainCategory
  }));
}

/**
 * 按主分類分組的子分類
 * @returns 按主分類分組的子分類
 */
export function getGroupedSubCategories() {
  const groups: Record<string, { code: string, name: string }[]> = {};
  
  // 初始化每個主分類的空數組
  Object.values(MainCategory).forEach(mainCat => {
    groups[mainCat] = [];
  });
  
  // 將子分類按主分類分組
  Object.keys(SubCategory).forEach(key => {
    const subCat = SubCategory[key as keyof typeof SubCategory];
    const mainCat = subCat.split('_')[0] as MainCategory;
    
    groups[mainCat].push({
      code: subCat,
      name: SubCategoryLabel[subCat]
    });
  });
  
  return groups;
}

/**
 * 從子分類獲取主分類
 * @param subCategory 子分類
 * @returns 主分類
 */
export function getMainCategoryFromSub(subCategory: string): string {
  return subCategory.split('_')[0];
} 
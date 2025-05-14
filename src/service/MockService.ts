import type { CourseDTO } from '@/types/course';
import { MainCategory, SubCategory } from '@/enums/CourseCategory';

// 篩選選項數據 - 地區
export const mockRegions = [
  { code: 'TPE', name: '台北' },
  { code: 'TAI', name: '台中' },
  { code: 'KHH', name: '高雄' },
  { code: 'TNN', name: '台南' },
  { code: 'HSZ', name: '新竹' }
];

// 生成模拟课程数据
export function generateMockCourses(): CourseDTO[] {
  const mockCourses: CourseDTO[] = [];
  
  for (let i = 1; i <= 30; i++) {
    mockCourses.push({
      courseId: i,
      merchantId: Math.floor(i / 3) + 1,
      title: `測試課程 ${i}`,
      description: `這是第 ${i} 個測試課程的詳細描述。包含了課程內容、適合對象、學習目標等信息。`,
      pointsRequired: Math.floor(Math.random() * 50) + 10,
      merchantName: `測試商家 ${Math.floor(i / 3) + 1}`,
      image: {
        imageSrc: `https://picsum.photos/id/${i + 20}/300/200`,
        alt: `課程 ${i} 圖片`
      },
      joinCount: Math.floor(Math.random() * 100),
      createdAt: generateRandomDate(),
      region: getRandomRegion(),
      categories: generateRandomCategories()
    });
  }
  
  return mockCourses;
}

// 生成随机日期（1-30天前）
function generateRandomDate(): Date {
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// 获取随机地区
function getRandomRegion(): string {
  return mockRegions[Math.floor(Math.random() * mockRegions.length)].code;
}

// 生成随机分类
function generateRandomCategories(): string[] {
  const mainCategoryKeys = Object.keys(MainCategory);
  const randomMainCatKey = mainCategoryKeys[Math.floor(Math.random() * mainCategoryKeys.length)];
  const mainCat = MainCategory[randomMainCatKey as keyof typeof MainCategory];
  
  const categories = [mainCat];
  
  // 可能添加子分类
  const subCategoryKeys = Object.keys(SubCategory);
  const matchingSubCats = subCategoryKeys.filter(key => {
    const subCat = SubCategory[key as keyof typeof SubCategory];
    return subCat.startsWith(mainCat);
  });
  
  if (matchingSubCats.length > 0) {
    const randomSubCatKey = matchingSubCats[Math.floor(Math.random() * matchingSubCats.length)];
    const subCat = SubCategory[randomSubCatKey as keyof typeof SubCategory];
    categories.push(subCat as any);
  }
  
  return categories;
} 
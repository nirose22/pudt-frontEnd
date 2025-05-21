import { UserLevel } from '@/enums/UserLevel';

// 等級對應的課程數閾值
export const levelThresholds = {
  [UserLevel.Seed]: 0,
  [UserLevel.Sprout]: 1,
  [UserLevel.Grass]: 10,
  [UserLevel.Flower]: 30,
  [UserLevel.Fruit]: 50,
  [UserLevel.Tree]: 80,
  [UserLevel.BigTree]: 120
};

// 等級顯示名稱
export const levelNames = {
  [UserLevel.Seed]: '小種子',
  [UserLevel.Sprout]: '好奇芽',
  [UserLevel.Grass]: '草地精靈',
  [UserLevel.Flower]: '花花學徒',
  [UserLevel.Fruit]: '果實高手',
  [UserLevel.Tree]: '知識樹靈',
  [UserLevel.BigTree]: '學林守護者'
};

// 等級對應角色
export const levelRoles = {
  [UserLevel.Seed]: 'Seedling 小種',
  [UserLevel.Sprout]: 'Sprout 小芽',
  [UserLevel.Grass]: 'Leafy 小草',
  [UserLevel.Flower]: 'Bloom 小花',
  [UserLevel.Fruit]: 'Fruity 小果',
  [UserLevel.Tree]: 'Tree 小樹',
  [UserLevel.BigTree]: 'Grandroot 大樹'
};

// 等級對應圖示
export const levelEmojis = {
  [UserLevel.Seed]: '🌱',
  [UserLevel.Sprout]: '✨',
  [UserLevel.Grass]: '🧚',
  [UserLevel.Flower]: '🌼',
  [UserLevel.Fruit]: '🍎',
  [UserLevel.Tree]: '🌳',
  [UserLevel.BigTree]: '🌲'
};

// 等級對應風格描述
export const levelDescriptions = {
  [UserLevel.Seed]: '安靜內向，喜歡聽故事的萌芽種子',
  [UserLevel.Sprout]: '愛冒險、東問西問的知識萌芽精靈',
  [UserLevel.Grass]: '積極參與活動，像草一樣成群結隊',
  [UserLevel.Flower]: '開始分享知識，愛交朋友的小花妖',
  [UserLevel.Fruit]: '熟成穩重、幫助他人的課程導師',
  [UserLevel.Tree]: '冥想型大師，腦中藏著無數課堂故事',
  [UserLevel.BigTree]: '擁有傳奇資歷，學林中的活歷史'
};

/**
 * 根據課程數計算用戶等級
 * @param courseCount 用戶完成的課程數
 * @returns 對應的等級
 */
export function calculateUserLevel(courseCount: number): UserLevel {
  if (courseCount >= levelThresholds[UserLevel.BigTree]) {
    return UserLevel.BigTree;
  } else if (courseCount >= levelThresholds[UserLevel.Tree]) {
    return UserLevel.Tree;
  } else if (courseCount >= levelThresholds[UserLevel.Fruit]) {
    return UserLevel.Fruit;
  } else if (courseCount >= levelThresholds[UserLevel.Flower]) {
    return UserLevel.Flower;
  } else if (courseCount >= levelThresholds[UserLevel.Grass]) {
    return UserLevel.Grass;
  } else if (courseCount >= levelThresholds[UserLevel.Sprout]) {
    return UserLevel.Sprout;
  } else {
    return UserLevel.Seed;
  }
}

/**
 * 計算用戶距離下一等級還需要的課程數
 * @param courseCount 用戶完成的課程數
 * @returns 還需要的課程數及下一級別
 */
export function calculateNextLevelProgress(courseCount: number): { 
  currentLevel: UserLevel;
  nextLevel: UserLevel | null; 
  currentCourseCount: number; 
  nextLevelThreshold: number | null;
  remainingCourses: number | null;
  progress: number;
} {
  const currentLevel = calculateUserLevel(courseCount);
  let nextLevel: UserLevel | null = null;
  let nextLevelThreshold: number | null = null;
  let remainingCourses: number | null = null;
  
  // 尋找下一等級
  switch (currentLevel) {
    case UserLevel.Seed:
      nextLevel = UserLevel.Sprout;
      break;
    case UserLevel.Sprout:
      nextLevel = UserLevel.Grass;
      break;
    case UserLevel.Grass:
      nextLevel = UserLevel.Flower;
      break;
    case UserLevel.Flower:
      nextLevel = UserLevel.Fruit;
      break;
    case UserLevel.Fruit:
      nextLevel = UserLevel.Tree;
      break;
    case UserLevel.Tree:
      nextLevel = UserLevel.BigTree;
      break;
    case UserLevel.BigTree:
      nextLevel = null; // 已是最高等級
      break;
  }

  // 計算進度
  if (nextLevel) {
    nextLevelThreshold = levelThresholds[nextLevel];
    remainingCourses = nextLevelThreshold - courseCount;
  }

  // 計算當前進度百分比
  let progress = 0;
  if (nextLevel) {
    const currentLevelThreshold = levelThresholds[currentLevel];
    const nextLevelThreshold = levelThresholds[nextLevel];
    const totalRange = nextLevelThreshold - currentLevelThreshold;
    const currentProgress = courseCount - currentLevelThreshold;
    progress = Math.floor((currentProgress / totalRange) * 100);
  } else {
    // 已是最高等級
    progress = 100;
  }

  return {
    currentLevel,
    nextLevel,
    currentCourseCount: courseCount,
    nextLevelThreshold,
    remainingCourses,
    progress
  };
} 
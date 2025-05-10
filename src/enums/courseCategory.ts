// 主分類
export enum MainCategory {
  SportsFitness   = 'SPF',
  CookingCuisine  = 'CUL',
  ArtDesign       = 'ART',
  PerformingArts  = 'PER',
  Lifestyle       = 'LIF',
  TechDigital     = 'TEC',
  OutdoorAdventure= 'OUT'
}

// 子分類
export enum SubCategory {
  // --- Sports & Fitness ---
  GroundYoga      = 'SPF_YOG',
  GymTraining     = 'SPF_GYM',
  Swimming        = 'SPF_SWM',
  Skateboarding   = 'SPF_SKB',

  // --- Cooking & Cuisine ---
  BakingDessert   = 'CUL_BAK',
  EthnicCuisine   = 'CUL_ETH',
  HomeCooking     = 'CUL_HOM',

  // --- Art & Design ---
  Photography     = 'ART_PHO',
  Illustration    = 'ART_ILL',
  Ceramics        = 'ART_CER',
  FloralDesign    = 'ART_FLO',

  // --- Performing Arts ---
  Dance           = 'PER_DAN',
  Theatre         = 'PER_THR',
  Instrument      = 'PER_INS',
  Vocal           = 'PER_VOC',
  MusicProduction = 'PER_MPD',

  // --- Lifestyle ---
  FinanceInvest   = 'LIF_FIN',
  LanguageLearning= 'LIF_LAN',

  // --- Tech & Digital ---
  FrontendDev     = 'TEC_FE',
  BackendDev      = 'TEC_BE',
  DigitalMarketing= 'TEC_MKT',
  UIUXDesign      = 'TEC_UIX',
  VideoEditing    = 'TEC_VED',

  // --- Outdoor & Adventure ---
  Bouldering      = 'OUT_CMB'
}



export const MainCategoryLabel: Record<MainCategory, string> = {
  [MainCategory.SportsFitness]:   '運動健身',
  [MainCategory.CookingCuisine]:  '烹飪美食',
  [MainCategory.ArtDesign]:       '藝術設計',
  [MainCategory.PerformingArts]:  '表演藝術',
  [MainCategory.Lifestyle]:       '生活風格',
  [MainCategory.TechDigital]:     '科技與數位技能',
  [MainCategory.OutdoorAdventure]:'戶外與冒險'
}

export const SubCategoryLabel: Record<SubCategory, string> = {
  // Sports & Fitness
  [SubCategory.GroundYoga]: '地面瑜珈',
  [SubCategory.GymTraining]: '重訓健身',
  [SubCategory.Swimming]: '游泳',
  [SubCategory.Skateboarding]: '滑板',

  // Cooking & Cuisine
  [SubCategory.BakingDessert]: '烘焙甜點',
  [SubCategory.EthnicCuisine]: '異國料理',
  [SubCategory.HomeCooking]: '居家料理',

  // Art & Design
  [SubCategory.Photography]: '攝影攝錄',
  [SubCategory.Illustration]: '繪畫插畫',
  [SubCategory.Ceramics]: '陶藝手作',
  [SubCategory.FloralDesign]: '花藝植栽',

  // Performing Arts
  [SubCategory.Dance]: '舞蹈',
  [SubCategory.Theatre]: '劇場戲劇',
  [SubCategory.Instrument]: '樂器演奏',
  [SubCategory.Vocal]: '聲樂歌唱',
  [SubCategory.MusicProduction]: '音樂製作',

  // Lifestyle
  [SubCategory.FinanceInvest]: '理財投資',
  [SubCategory.LanguageLearning]: '語言學習',

  // Tech & Digital
  [SubCategory.FrontendDev]: '前端開發',
  [SubCategory.BackendDev]: '後端開發',
  [SubCategory.DigitalMarketing]: '數位行銷',
  [SubCategory.UIUXDesign]: 'UI/UX設計',
  [SubCategory.VideoEditing]: '影音剪輯',

  // Outdoor
  [SubCategory.Bouldering]: '攀岩抱石'
}

export const SubCategoryLabelList = Object.values(SubCategoryLabel);

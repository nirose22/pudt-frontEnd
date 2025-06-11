/**
 * 單張圖片（可重用）
 */
export interface Photo {
  id: number;
  courseId: number;
  url: string;  // itemImageSrc 對應
  thumbnailUrl: string; // thumbnailImageSrc 對應
  alt: string;
}
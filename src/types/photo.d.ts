/**
 * 單張圖片（可重用）
 */
export interface Photo {
  id: number;
  imageSrc: string;  // itemImageSrc 對應
  alt: string;
  thumbnail?: Photo; // thumbnailImageSrc 對應
}

/**
 * 照片項目：原圖 + 縮圖
 */
export interface PhotoItem extends Photo {
  thumbnail: string; // thumbnailImageSrc 對應
}

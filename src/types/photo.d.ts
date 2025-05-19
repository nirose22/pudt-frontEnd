/**
 * 單張圖片（可重用）
 */
export interface Photo {
  imageSrc: string;
  alt: string;
}

/**
 * 照片項目：原圖 + 縮圖
 */
export interface PhotoItem {
  full: Photo;     // itemImageSrc 對應
  thumbnail: Photo; // thumbnailImageSrc 對應
}

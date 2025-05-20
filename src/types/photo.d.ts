/**
 * 單張圖片（可重用）
 */
export interface Photo {
  imageSrc: string;  // itemImageSrc 對應
  alt: string;
}

/**
 * 照片項目：原圖 + 縮圖
 */
export interface PhotoItem extends Photo {
  thumbnail: Photo; // thumbnailImageSrc 對應
}

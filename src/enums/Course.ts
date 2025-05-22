/**
 * 課程狀態枚舉
 */
export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled'
}

/**
 * 課程狀態標籤
 */
export const CourseStatusLabel: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: '草稿',
  [CourseStatus.ACTIVE]: '已上架',
  [CourseStatus.INACTIVE]: '已下架',
  [CourseStatus.SCHEDULED]: '定時上架'
};
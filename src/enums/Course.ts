export enum CourseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled'
}

export const CourseStatusOptions: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: '草稿',
  [CourseStatus.ACTIVE]: '已上架',
  [CourseStatus.INACTIVE]: '已下架',
  [CourseStatus.SCHEDULED]: '定時上架'
};
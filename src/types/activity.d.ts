import { InstructorDTO } from './course';
import { BookingStatus, ActivityKind } from '@/enums';

// 课程记录接口
export interface CourseRecord {
  id: number;
  userId: number;
  courseTitle: string;
  courseType: string;
  location: string;
  instructor?: InstructorDTO;
  date: string;
  time: string;
  points: number;
  status: BookingStatus;
  rating?: number;
  comment?: string;
}

// 缺席记录接口
export interface AbsenceRecord {
  id: number;
  userId: number;
  courseTitle: string;
  courseType: string;
  date: string;
  time: string;
  points: number;
  reason?: string;
}

// 评价记录接口
export interface RatingRecord {
  id: number;
  courseTitle: string;
  instructor?: InstructorDTO;
  date: string;
  rating: number;
  comment?: string;
  ratingDate: string;
}

// 活动记录接口 - 基于Course.d.ts中的Activity
export interface ActivityRecord {
  id: number;
  userId: number;
  occurredAt: Date;
  kind: ActivityKind;
  refId?: number;
  ip?: string;
  device?: string;
  memo?: string;
} 
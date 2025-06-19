import { UserGender, UserRole } from '@/enums/User';
import { MainCategory, RegionCode } from '@/enums';

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  points: number
  avatarUrl?: string
  address?: string
  birthday?: string
  gender?: UserGender
  regionCode?: RegionCode
  createdAt: string
  lastLogin?: string
  role?: UserRole
  token?: string
}

/**
 * 用戶資料更新請求
 */
export interface UserUpdateRequest {
  name?: string
  email?: string
  avatarUrl?: string
  address?: string
  birthday?: string
  gender?: UserGender
  regionCode?: RegionCode
  phone?: string
}

/**
 * 用戶資料更新響應
 */
export interface UserUpdateResponse {
  id: number
  name: string
  email: string
  points: number
  avatarUrl?: string
  address?: string
  birthday?: string
  gender?: UserGender
  regionCode?: RegionCode
  role: UserRole
  phone?: string
  createdAt: string
  lastLogin?: string
}

export interface UserBehaviorProfile {
  userId: number
  name?: string
  points?: number
  interests: MainCategory[]
  preferredRegions: RegionCode[]
  activityLevel: number
  createdAt: string
  updatedAt: string
  recentBookingIds?: number[]
  lastActiveAt?: string
}

export interface UserInterestsRequest {
  categories: MainCategory[]
}

export interface UserPreferencesRequest {
  interests: MainCategory[]
  preferredRegions: RegionCode[]
}

export interface UserSetting {
  userId: number           // pk, fk_user
  lang: 'zh-TW' | 'en-US'
  theme: 'light' | 'dark' | 'system'
  emailNotify: boolean
  smsNotify: boolean
  pushNotify: boolean
}
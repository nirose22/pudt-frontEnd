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

export interface UserProfile {
  userId: number
  name?: string
  points?: number
  interests: MainCategory[]
  preferredRegions: RegionCode[]
  timePreferences: Record<number, number>
  activityLevel: number
  priceSensitivity: number
  profileGeneratedAt: string
  validityHours: number
}

export interface UserSetting {
  userId: number           // pk, fk_user
  lang: 'zh-TW' | 'en-US'
  theme: 'light' | 'dark' | 'system'
  emailNotify: boolean
  smsNotify: boolean
  pushNotify: boolean
}
import { UserGender } from '@/enums/User';

export interface User {
  id: number
  name: string
  email: string
  points: number
  avatarUrl?: string
  address: string
  birthday?: string
  gender?: Gender
  regionCode?: RegionCode
  createdAt: string
  lastLogin?: string
  role?: UserRole
}

export interface UserProfile {
  userId: number
  name?: string
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
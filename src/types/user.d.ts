import { UserGender } from '@/enums/User';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  points: number;
  avatarUrl?: string;
  createdAt: Date;
  lastLogin?: Date;
  address?: string;
  birthday?: Date;
  gender?: UserGender;
}

export interface UserSetting {
  userId: number           // pk, fk_user
  lang: 'zh-TW' | 'en-US'
  theme: 'light' | 'dark' | 'system'
  emailNotify: boolean
  smsNotify: boolean
  pushNotify: boolean
}
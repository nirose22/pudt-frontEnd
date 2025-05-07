import { UserGender } from '@/enums/User';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  points: number;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  address?: string;
  birthday?: Date;
  gender?: UserGender;
}

export interface UserProfile extends Omit<User, 'role'> {
  bookingHistory?: {
    total: number;
    completed: number;
    upcoming: number;
  };
  favoriteCategories?: string[];
  pointsHistory?: {
    earned: number;
    spent: number;
    expiring?: number;
    expiryDate?: Date;
  };
}

export interface UserSettings {
  userId: number;
  notifications: {
    email: boolean;
    sms: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showActivityHistory: boolean;
  };
  language: 'zh-TW' | 'en-US';
  theme: 'light' | 'dark' | 'system';
}

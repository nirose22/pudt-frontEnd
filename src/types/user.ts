export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  points: number;             // 點數
  isActive: boolean;
}

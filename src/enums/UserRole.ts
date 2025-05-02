export enum UserRole {
  Admin = 'A',
  Merchant = 'M',
  User = 'U',
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.Admin]: '管理員',
  [UserRole.Merchant]: '商家',
  [UserRole.User]: '用戶'
}
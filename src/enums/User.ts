export enum UserRole {
  Admin = 'A',
  Merchant = 'M',
  User = 'U',
  Guest = 'G'
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.Admin]: '管理員',
  [UserRole.Merchant]: '商家',
  [UserRole.User]: '用戶',
  [UserRole.Guest]: '訪客'
}

export enum UserGender {
  Male = 'M',
  Female = 'F',
  Other = 'O',
  NotDisclosed = 'ND'
}


export const UserGenderLabel: Record<UserGender, string> = {
  [UserGender.Male]: '男',
  [UserGender.Female]: '女',
  [UserGender.Other]: '其他',
  [UserGender.NotDisclosed]: '不願透露'
}


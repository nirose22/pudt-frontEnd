export enum UserRole {
  Admin = 'ADMIN',
  Merchant = 'MERCHANT',
  User = 'CUSTOMER',
}

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.Admin]: '管理員',
  [UserRole.Merchant]: '商家',
  [UserRole.User]: '用戶',
}

export enum UserGender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
  NotDisclosed = 'not_disclosed'
}


export const UserGenderLabel: Record<UserGender, string> = {
  [UserGender.Male]: '男',
  [UserGender.Female]: '女',
  [UserGender.Other]: '其他',
  [UserGender.NotDisclosed]: '不願透露'
}

// 添加簡短標籤別名以保持向後兼容
export const UserGenderLabelShort = {
  M: UserGenderLabel[UserGender.Male],
  F: UserGenderLabel[UserGender.Female],
  O: UserGenderLabel[UserGender.Other],
  ND: UserGenderLabel[UserGender.NotDisclosed]
}


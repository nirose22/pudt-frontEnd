//活動紀錄類型
export enum ActivityKind {
    Login = 'login',         // 使用者登入
    Booking = 'booking',       // 預約課程
    Purchase = 'purchase',      // 購買訂單
    AccountChange = 'account',       // 帳號變更（個資、密碼）
    Participation = 'participation'  // 課程出席／活動參與
}

export const ActivityKindLabel: Record<ActivityKind, string> = {
    [ActivityKind.Login]: '登入',
    [ActivityKind.Booking]: '預約課程',
    [ActivityKind.Purchase]: '購買訂單',
    [ActivityKind.AccountChange]: '帳號變更',
    [ActivityKind.Participation]: '課程出席／活動參與'
}
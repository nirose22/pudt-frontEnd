// export enum PointType {
//     Points = 'P',
//     Course = 'C',
//     System = 'S'
// }

// export const PointTypeLabel: Record<PointType, string> = {
//     [PointType.Points]: '課程消費',
//     [PointType.Course]: '購買課卡',
//     [PointType.System]: '系統贈送'
// }

export enum PointKind {
    Deposit = 'deposit',    // 儲值 / 購卡
    Consume = 'consume',    // 扣點（預約課程等）
    Reward = 'reward',     // 活動獎勵
    Expire = 'expire'      // 點數過期
}

export enum PointRefType {
    Order = 'order',     // 來自購買訂單
    Booking = 'booking',   // 來自課程預約
    Refund = 'refund',     // 點數退還
    Activity = 'activity', // 來自活動
}


export const PointRefTypeLabel: Record<PointRefType, string> = {
    [PointRefType.Order]: '購買訂單',
    [PointRefType.Booking]: '課程預約',
    [PointRefType.Refund]: '點數退還',
    [PointRefType.Activity]: '活動獎勵',
}


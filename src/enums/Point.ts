


export enum PointKind {
    ADD = 'add',    // 儲值 / 購卡
    USE = 'use',    // 扣點（預約課程等）
    REWARD = 'reward',     // 活動獎勵
    EXPIRE = 'expire'      // 點數過期
}

export enum PointRefType {
    ORDER = 'order',     // 來自購買訂單
    BOOKING = 'booking',   // 來自課程預約
    REFUND = 'refund',     // 點數退還
    ACTIVITY = 'activity', // 來自活動
}

export const PointKindLabel: Record<PointKind, string> = {
    [PointKind.ADD]: '儲值',
    [PointKind.USE]: '消費',
    [PointKind.REWARD]: '獎勵',
    [PointKind.EXPIRE]: '過期'
}

export const PointRefTypeLabel: Record<PointRefType, string> = {
    [PointRefType.ORDER]: '購買訂單',
    [PointRefType.BOOKING]: '課程預約',
    [PointRefType.REFUND]: '點數退還',
    [PointRefType.ACTIVITY]: '活動獎勵',
}



export enum CardType {
    Basic = 'B',
    Advanced = 'A',
    Professional = 'P',
    VIP = 'V'
}

export enum CardStatus {
    Active = 'A',
    Inactive = 'I'
}

export const CardTypeLabel: Record<CardType, string> = {
    [CardType.Basic]: '基本課卡',
    [CardType.Advanced]: '進階課卡',
    [CardType.Professional]: '專業課卡',
    [CardType.VIP]: 'VIP課卡'
}

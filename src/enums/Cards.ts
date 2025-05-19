
export enum CardType {
    Basic = 'B',
    Advanced = 'A',
    Professional = 'P',
    VIP = 'V'
}

export const CardTypeLabel: Record<CardType, string> = {
    [CardType.Basic]: '基本課卡',
    [CardType.Advanced]: '進階課卡',
    [CardType.Professional]: '專業課卡',
    [CardType.VIP]: 'VIP課卡'
}

export const CardTypePrice: Record<CardType, number> = {
    [CardType.Basic]: 1000,
    [CardType.Advanced]: 1800,
    [CardType.Professional]: 4000,
    [CardType.VIP]: 8000
}

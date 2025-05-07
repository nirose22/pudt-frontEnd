export enum PurchaseStatus {
    Paid = 'P',
    Unpaid = 'U',
    Refunded = 'R',
    Cancelled = 'C'
}

export const PurchaseStatusLabel: Record<PurchaseStatus, string> = {
    [PurchaseStatus.Paid]: '已付款',
    [PurchaseStatus.Unpaid]: '未付款',
    [PurchaseStatus.Refunded]: '已退款',
    [PurchaseStatus.Cancelled]: '已取消'
}

export enum PurchasePaymentMethod {
    Cash = 'C',
    CreditCard = 'CC',
    BankTransfer = 'BT',
    MobilePayment = 'MP'
}

export const PurchasePaymentMethodLabel: Record<PurchasePaymentMethod, string> = {
    [PurchasePaymentMethod.Cash]: '現金',
    [PurchasePaymentMethod.CreditCard]: '信用卡',
    [PurchasePaymentMethod.BankTransfer]: '銀行轉帳',
    [PurchasePaymentMethod.MobilePayment]: '行動支付'
}

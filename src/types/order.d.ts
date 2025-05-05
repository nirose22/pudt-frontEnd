export interface Order {
    id        : number
    userId    : number
    merchantId: number
    amount    : number
    status    : 'pending' | 'paid' | 'cancelled' | 'refunded'
    createdAt : Date
    updatedAt?: Date
  }
export interface PointStats {
    totalPoints: number;
    availablePoints: number;
    pendingPoints: number;
    settlementHistory: {
        date: string;
        amount: number;
        status: string;
    }[];
} 
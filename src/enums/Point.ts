export enum PointType {
    Points = 'P',
    Course = 'C',
    System = 'S'
}

export const PointTypeLabel: Record<PointType, string> = {
    [PointType.Points]: '課程消費',
    [PointType.Course]: '購買課卡',
    [PointType.System]: '系統贈送'
}

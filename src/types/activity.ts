export enum ActivityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface ActivityRecord {
  userId: number
  activityType: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ActivityProfile {
  userId: number
  activityKind: ActivityLevel
  lastActive: string
  activityCount: number
  activityHistory: ActivityRecord[]
} 
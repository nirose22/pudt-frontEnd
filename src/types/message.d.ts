import { MessageType } from '@/enums/Message'

// 訊息介面
export interface Message {
    id: number;
    type: MessageType;
    sender: string;
    senderAvatar?: string;
    title: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
    isStarred?: boolean;
    attachments?: Array<{
        name: string;
        url: string;
        size: number;
    }>;
    actions?: Array<{
        label: string;
        icon: string;
        action: string;
        data?: any;
    }>;
    canReply: boolean;
}

// 通知类型，用于通知中心
export type NotificationType = 'booking' | 'system' | 'settlement' | 'promotion';

// 通知接口
export interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    time: Date;
    read: boolean;
    link?: string;
    linkText?: string;
}

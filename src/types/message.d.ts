
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

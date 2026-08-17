export interface Notification {
    id?: string;
    title: string;
    message: string;
    type: 'CREDIT_APPROVED' | 'CREDIT_REJECTED' | 'PAYMENT_RECEIVED' | 'PASS_SCANNED' | 'IDENTITY_REMINDER' | 'SYSTEM';
    isRead: boolean;
    createdAt?: string;
}

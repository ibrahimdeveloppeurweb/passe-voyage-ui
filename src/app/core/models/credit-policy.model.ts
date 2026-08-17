export interface CreditPolicy {
    id?: number;
    newUserLimit: number;
    standardLimit: number;
    vipLimit: number;
    autoApproveEnabled: boolean;
    autoRejectBlacklistEnabled: boolean;
    updatedAt?: string;
}

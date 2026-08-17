import { Company } from "./company.model";

export interface Ticket {
    id?: string;
    creditRequestId?: string;
    company?: Company;
    ticketNumber: string;
    ticketIndex: number;
    unitPrice: number;
    qrCodeContent: string;
    status: 'PENDING' | 'VALIDATED' | 'SCANNED';
    isUsed: boolean;
    validatedAt?: string;
    usedAt?: string;
    createdAt?: string;
}

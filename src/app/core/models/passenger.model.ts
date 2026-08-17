export interface Passenger {
    id?: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    countryCode?: string;
    email?: string;
    pinCode?: string;
    gender?: 'M' | 'F';
    residenceAddress?: string;
    identityCardNumber?: string;
    identityType?: 'CNI' | 'PASSPORT';
    identityRectoUrl?: string;
    identityVersoUrl?: string;
    selfieUrl?: string;
    identityStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    profileType?: 'NEW_USER' | 'STANDARD' | 'VIP';
    creditScore?: number;
    maxCreditLimit?: number;
    availableCredit?: number;
    totalDebt?: number;
    totalReimbursed?: number;
    isIdentified?: boolean;
    isBlacklisted: boolean;
    createdAt?: string;
}

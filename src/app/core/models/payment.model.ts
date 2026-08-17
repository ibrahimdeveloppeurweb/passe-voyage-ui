import { CreditRequest } from "./credit.model";
import { Passenger } from "./passenger.model";

export interface Payment {
    id?: string;
    creditRequest?: CreditRequest;
    passenger?: Passenger;
    amount: number;
    paymentMethod: 'MOBILE_MONEY' | 'CARD' | 'CASH';
    transactionId?: string;
    paymentDate: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    createdAt?: string;
}

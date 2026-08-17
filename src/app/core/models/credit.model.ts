import { Ticket } from "./ticket.model";
import { Company } from "./company.model";
import { Passenger } from "./passenger.model";

export interface CreditRequest {
    id?: string;
    passenger?: Passenger;
    passengerName?: string;
    departureCity: string;
    arrivalCity: string;
    company?: Company | string;
    travelDate: string;
    returnDate?: string;
    isRoundTrip: boolean;
    passengerCount: number;
    unitPrice: number;
    amountRequested: number;
    serviceFee: number;
    totalAmount: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'USED';
    repaymentStatus: 'NOT_PAID' | 'PARTIALLY_PAID' | 'PAID';
    tickets?: Ticket[];
    createdAt?: string;
}

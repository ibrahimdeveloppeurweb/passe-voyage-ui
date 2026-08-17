import { Station } from "./station.model";
import { Company } from "./company.model";

export interface Agent {
    id?: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    countryCode?: string;
    email?: string;
    gender?: 'M' | 'F';
    residenceAddress?: string;
    company?: Company;
    stationAssigned?: Station;
    isActivated: boolean;
    isActive: boolean;
    createdAt?: string;
}

import { Route } from "./route.model";
import { Company } from "./company.model";

export interface Tariff {
    id?: string;
    route?: Route;
    company?: Company;
    price: number;
    effectiveDate: string;
    isActive: boolean;
}

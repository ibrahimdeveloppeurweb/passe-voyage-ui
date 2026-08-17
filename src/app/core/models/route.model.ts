import { Station } from "./station.model";

export interface Route {
    id?: string;
    departureStation?: Station;
    arrivalStation?: Station;
    distanceKm?: number;
    estimatedDurationMinutes?: number;
    isActive: boolean;
}

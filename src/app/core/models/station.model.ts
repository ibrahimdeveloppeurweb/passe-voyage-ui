export interface City {
    id?: string;
    name: string;
    region?: string;
    country?: string;
}

export interface Station {
    id?: string;
    name: string;
    city?: City;
    address?: string;
    latitude?: number;
    longitude?: number;
    isActive: boolean;
}

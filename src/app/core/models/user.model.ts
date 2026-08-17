import { Role } from "./role.model";

export interface User {
    id?: string;
    uuid?: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    username: string;
    type: 'ADMIN' | 'AGENT' | 'PARTNER';
    avatar?: string;
    isFirst: boolean;
    isActive: boolean;
    isOnline: boolean;
    lastLogin?: string;
    roles?: string[];
    droits?: Role[];
    createdAt?: string;
}

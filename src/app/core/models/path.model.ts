import { Role } from "./role.model";

export interface Path {
    id?: number;
    nom: string;
    libelle: string;
    type: string;
    permission?: string;
    chemin?: string;
    roles?: Role[];
}

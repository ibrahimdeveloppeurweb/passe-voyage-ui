import { Path } from "./path.model";
import { User } from "./user.model";

export interface Role {
    id?: number;
    nom: string;
    description?: string;
    isAdmin: boolean;
    isFirst?: boolean;
    paths?: Path[];
    users?: User[];
    usersCount?: number;
}

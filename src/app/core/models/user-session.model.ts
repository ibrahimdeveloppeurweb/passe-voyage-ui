export interface UserSession {
    uuid: string;
    nom: string;
    firstname: string;
    email: string;
    telephone: string;
    username: string;
    photo: string | null;
    role: string;
    token: string;
    refreshToken: string;
    isFirstUser: boolean;
    lastLogin: string | null;
    permissions: string[];
}

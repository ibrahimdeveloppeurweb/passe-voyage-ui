import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';
import { environment } from '../../../../environments/environment';
import { UserSession } from '../../models/user-session.model';

const TOKEN_KEY = 'passe_voyage_session';
const PERMS_KEY = 'passe_voyage_permissions';

export interface LoginPayload {
    username: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private apiUrl = environment.serverUrl;
    private permissionsSubject = new BehaviorSubject<string[]>(this.getPermissions());

    constructor(
        private api: ApiService,
        private router: Router
    ) { }

    getPermissionsObservable(): Observable<string[]> {
        return this.permissionsSubject.asObservable();
    }

    login(data: LoginPayload): Observable<any> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._post('login', data).pipe(
            map((res: any) => {
                if (res?.data) {
                    this.saveDataToken(res.data);
                }
                return res;
            }),
            catchError((err: any) => throwError(() => err))
        );
    }

    logout(): void {
        const session = this.getDataToken();
        if (session) {
            if (!navigator.onLine) {
                NoInternetHelper.internet();
                return;
            }

            const body = { refreshToken: session.refreshToken, user: session.uuid };
            this.api._post('logout', body).subscribe({
                complete: () => this.clearSession(),
                error: () => this.clearSession()
            });
        } else {
            this.clearSession();
        }
    }

    saveDataToken(data: UserSession): void {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
        localStorage.setItem(PERMS_KEY, JSON.stringify(data.permissions ?? []));
        this.permissionsSubject.next(data.permissions ?? []);
    }

    getDataToken(): UserSession | null {
        const raw = localStorage.getItem(TOKEN_KEY);
        return raw ? (JSON.parse(raw) as UserSession) : null;
    }

    getToken(): string | null {
        return this.getDataToken()?.token ?? null;
    }

    getRole(): string | null {
        return this.getDataToken()?.role ?? null;
    }

    getPermissions(): string[] {
        const raw = localStorage.getItem(PERMS_KEY);
        return raw ? JSON.parse(raw) : [];
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    hasPermission(permission: string): boolean {
        return this.getPermissions().includes(permission);
    }

    clearSession(): void {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(PERMS_KEY);
        this.permissionsSubject.next([]);
        this.router.navigate(['/auth/login']);
    }
}

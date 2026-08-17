import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';
import { CreditRequest } from '../../../core/models/credit.model';

@Injectable({
    providedIn: 'root'
})
export class CreditService {
    private url = 'credits';
    public creditRequest: CreditRequest | null = null;
    public edit: boolean = false;

    constructor(private api: ApiService) { }

    setCreditRequest(creditRequest: CreditRequest) {
        this.creditRequest = creditRequest;
    }

    getCreditRequest(): CreditRequest | null {
        return this.creditRequest;
    }

    getList(status?: string): Observable<CreditRequest[]> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        const params = status ? { status } : {};
        return this.api._get(`${this.url}/`, params).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    getSingle(id: string): Observable<CreditRequest> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._get(`${this.url}/${id}/show`).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    approveRequest(id: string): Observable<any> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._post(`${this.url}/${id}/approve`, {}).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    rejectRequest(id: string, reason: string): Observable<any> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._post(`${this.url}/${id}/reject`, { reason }).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }
}

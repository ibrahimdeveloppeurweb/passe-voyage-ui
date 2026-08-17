import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';
import { Company } from '../../../core/models/company.model';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    private url = 'companies';
    public company: Company | null = null;
    public edit: boolean = false;

    constructor(private api: ApiService) { }

    setCompany(company: Company) {
        this.company = company;
    }

    getCompany(): Company | null {
        return this.company;
    }

    add(data: Company): Observable<any> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        if (data.id) {
            return this.update(data);
        } else {
            return this.create(data);
        }
    }

    create(data: Company): Observable<any> {
        return this.api._post(`${this.url}/new`, data).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    update(data: Company): Observable<any> {
        return this.api._post(`${this.url}/${data.id}/edit`, data).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    getList(): Observable<Company[]> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._get(`${this.url}/`).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    getSingle(id: string): Observable<Company> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._get(`${this.url}/${id}/show`).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }

    getDelete(id: string): Observable<any> {
        if (!navigator.onLine) {
            NoInternetHelper.internet();
            return new Observable(obs => { obs.next(); obs.complete(); });
        }

        return this.api._delete(`${this.url}/${id}/delete`).pipe(
            map((response: any) => response),
            catchError((error: any) => throwError(() => error))
        );
    }
}

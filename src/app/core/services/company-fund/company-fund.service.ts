import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface CompanyFundItem {
  id?: number;
  uuid?: string;
  compagnie?: string;
  companyName?: string;
  companyUuid?: string;
  companyId?: number;
  totalAmount?: number;
  totalFonds?: number;
  consumedAmount?: number;
  consomme?: number;
  remainingAmount?: number;
  reste?: number;
  percentage?: number;
  pourcentage?: number;
  status?: string;
  statut?: string;
  company?: any;
}

export interface CompanyFundHistoryItem {
  id?: number;
  uuid?: string;
  type?: string; // RECHARGE or DEBIT_BILLET
  amount?: number;
  previousBalance?: number;
  newBalance?: number;
  reference?: string;
  description?: string;
  performedBy?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyFundService {
  private url = 'private/company-fund';

  constructor(private api: ApiService) { }

  getList(): Observable<{ data: CompanyFundItem[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getShow(uuid: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/${uuid}/show`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  create(data: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/new`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  recharge(uuid: string, data: { amount: number; reason?: string; comment?: string; performedBy?: string }): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${uuid}/recharge`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getHistory(uuid: string, params?: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/${uuid}/history`, params).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  update(uuid: string, data: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${uuid}/edit`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  delete(uuid: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._delete(`${this.url}/${uuid}/delete`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

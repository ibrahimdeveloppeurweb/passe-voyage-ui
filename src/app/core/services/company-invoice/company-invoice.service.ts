import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface CompanyInvoiceItem {
  id?: number;
  uuid?: string;
  reference?: string;
  compagnie?: string;
  companyName?: string;
  companyUuid?: string;
  companyId?: number;
  periode?: string;
  period?: string;
  montant?: number;
  amount?: number;
  statut?: string;
  status?: string;
  paidAt?: string;
  company?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyInvoiceService {
  private url = 'private/company-invoice';

  constructor(private api: ApiService) { }

  getList(): Observable<{ data: CompanyInvoiceItem[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
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

  togglePaid(uuid: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._patch(`${this.url}/${uuid}/toggle-paid`, {}).pipe(
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

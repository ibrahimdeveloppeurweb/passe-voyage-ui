import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface TariffItem {
  id?: number;
  uuid?: string;
  trajet?: string;
  route?: any;
  routeUuid?: string;
  compagnie?: string;
  company?: any;
  companyUuid?: string;
  prix?: number;
  prixFormatted?: string;
  price?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TariffService {
  private url = 'private/tariff';

  constructor(private api: ApiService) { }

  getList(): Observable<{ data: TariffItem[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getRoutes(): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get('private/route').pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getCompanies(): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get('private/company').pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  create(data: TariffItem): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/new`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  update(uuid: string, data: TariffItem): Observable<any> {
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

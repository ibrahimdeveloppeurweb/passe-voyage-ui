import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface CompanyItem {
  id?: number;
  uuid?: string;
  nom?: string;
  name?: string;
  contact?: string;
  contactEmail?: string;
  email?: string;
  telephone?: string;
  contactPhone?: string;
  address?: string;
  statut?: string;
  status?: string;
  logo?: string;
  isActive?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private url = 'private/company';

  constructor(private api: ApiService) { }

  getList(): Observable<{ data: CompanyItem[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getSingle(uuid: string): Observable<{ data: CompanyItem }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/show`, { uuid: uuid }).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  create(data: CompanyItem): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/new`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  update(uuid: string, data: CompanyItem): Observable<any> {
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

  toggle(uuid: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._patch(`${this.url}/${uuid}/toggle`, {}).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  // Espace Compagnie API Calls - Portail Partenaire
  getEspaceFinances(): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }
    
    return this.api._get(`${this.url}/espace/finances`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getEspaceDashboard(filters: any = {}): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }
    
    let params = '?';
    if (filters.period) params += `period=${filters.period}&`;
    
    return this.api._get(`${this.url}/espace/dashboard${params}`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getEspaceActivitesGares(filters: any = {}): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }
    
    let params = '?';
    if (filters.search) params += `search=${filters.search}&`;
    if (filters.status) params += `status=${filters.status}&`;
    if (filters.startDate) params += `startDate=${filters.startDate}&`;
    if (filters.endDate) params += `endDate=${filters.endDate}&`;

    return this.api._get(`${this.url}/espace/activites-gares${params}`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getStationStats(uuid: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }
    
    return this.api._get(`${this.url}/espace/activites-gares/${uuid}/stats`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getEspaceBilletsScannes(filters: any = {}): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }
    
    let params = '?';
    if (filters.search) params += `search=${filters.search}&`;
    if (filters.station) params += `station=${filters.station}&`;
    if (filters.startDate) params += `startDate=${filters.startDate}&`;
    if (filters.endDate) params += `endDate=${filters.endDate}&`;
    if (filters.page) params += `page=${filters.page}&`;
    if (filters.limit) params += `limit=${filters.limit}&`;

    return this.api._get(`${this.url}/espace/billets-scannes${params}`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

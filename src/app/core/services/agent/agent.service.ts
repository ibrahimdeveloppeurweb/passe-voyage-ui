import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface AgentItem {
  id?: number;
  uuid?: string;
  code?: string;
  matricule?: string;
  firstname?: string;
  lastname?: string;
  nom?: string;
  prenom?: string;
  phoneNumber?: string;
  telephone?: string;
  gender?: string;
  residenceAddress?: string;
  residence?: string;
  status?: string;
  statut?: string;
  isActivated?: boolean;
  companyName?: string;
  companyUuid?: string;
  stationName?: string;
  stationUuid?: string;
  agentCode?: string;
  codeCommercial?: string;
  company?: any;
  stationAssigned?: any;
  createdAt?: string;
  assignmentDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
  heureDebut?: string;
  heureFin?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private url = 'private/agent';

  constructor(private api: ApiService) { }

  getList(params?: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url, params).pipe(
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

  toggleStatus(uuid: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${uuid}/toggle-status`, {}).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  assignStation(uuid: string, data: { companyUuid: string; stationUuid?: string; date?: string; heureDebut?: string; heureFin?: string; shiftStart?: string; shiftEnd?: string }): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${uuid}/assign`, data).pipe(
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

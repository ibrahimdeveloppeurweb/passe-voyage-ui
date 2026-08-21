import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface UserItem {
  id?: number;
  uuid?: string;
  nom?: string;
  prenom?: string;
  fullName?: string;
  email?: string;
  username?: string;
  telephone?: string;
  isEnabled?: boolean;
  type?: string;
  droits?: any[];
  primaryRoleName?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'private/admin/user';

  constructor(private api: ApiService) { }

  getList(): Observable<{ data: UserItem[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getSingle(uuid: string): Observable<{ data: UserItem }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/show`, { uuid: uuid }).pipe(
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

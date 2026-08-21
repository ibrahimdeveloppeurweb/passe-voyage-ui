import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface PathItem {
  id?: number;
  uuid?: string;
  nom?: string;
  route?: string;
}

export interface Role {
  id?: number;
  uuid?: string;
  nom?: string;
  description?: string;
  usersCount?: number;
  paths?: PathItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private url = 'private/admin/role';
  private selectedRole: Role | null = null;

  constructor(private api: ApiService) { }

  setRole(role: Role): void {
    this.selectedRole = role;
  }

  getRole(): Role | null {
    return this.selectedRole;
  }

  getList(): Observable<{ data: Role[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getSingle(uuid: string): Observable<{ data: Role }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/show`, { uuid: uuid }).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  create(data: Role): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/new`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  update(key: string, data: Role): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${key}/edit`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  save(data: Role): Observable<any> {
    const key = data.uuid || (data.id ? String(data.id) : null);
    if (key) {
      return this.update(key, data);
    } else {
      return this.create(data);
    }
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

import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface PassengerItem {
  id?: number;
  uuid?: string;
  code?: string;
  firstname?: string;
  lastname?: string;
  fullName?: string;
  nom?: string;
  phoneNumber?: string;
  telephone?: string;
  countryCode?: string;
  gender?: string;
  residenceAddress?: string;
  email?: string;
  identityCardNumber?: string;
  identityType?: string;
  identityRectoUrl?: string;
  identityVersoUrl?: string;
  selfieUrl?: string;
  identityStatus?: string;
  creditScore?: number;
  profileType?: string;
  maxCreditLimit?: number;
  availableCredit?: number;
  solde?: number;
  totalDebt?: number;
  totalReimbursed?: number;
  isIdentified?: boolean;
  isBlacklisted?: boolean;
  statut?: string;
  createdAt?: string;
  inscription?: string;
  contacts?: any[];
  isOverdue?: boolean;
  daysOverdue?: number;
  delaiOptionDays?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  private url = 'private/passenger';

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

  verifyKyc(uuid: string, status: string, reason?: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${uuid}/verify-kyc`, { status, reason }).pipe(
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

  toggleBlacklist(uuid: string, isBlacklisted?: boolean, reason?: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/${uuid}/toggle-blacklist`, { isBlacklisted, reason }).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  sendReminder(passengerId: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/reminder/send`, { passengerId }).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  sendAllReminders(): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/reminder/send-all`, {}).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

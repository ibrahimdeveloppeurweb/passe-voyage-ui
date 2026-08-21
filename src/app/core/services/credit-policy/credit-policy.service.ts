import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

@Injectable({
  providedIn: 'root'
})
export class CreditPolicyService {
  private url = 'credit-policy';

  constructor(private api: ApiService) { }

  getPolicy(): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  updatePolicy(data: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/update`, data).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private url = 'ticket';

  constructor(private api: ApiService) { }

  getList(params?: any): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/list`, params).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

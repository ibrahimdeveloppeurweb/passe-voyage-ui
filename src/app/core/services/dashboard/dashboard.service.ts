import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private url = 'private/dashboard';

  constructor(private api: ApiService) { }

  getPasseVoyageData(date?: string): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    let url = `${this.url}/passe-voyage`;
    if (date) {
      url += '?date=' + date;
    }

    return this.api._get(url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

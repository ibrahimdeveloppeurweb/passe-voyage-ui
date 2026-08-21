import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface GeneralSetting {
  id?: number;
  fraisServiceTicket?: number;
  delaiOptionStandard?: number;
  reserveFinanciereInitiale?: string;
  cleApiSmsNotification?: string;
  fraisDossier?: number;
  penaliteRetardJournaliere?: number;
  delaiGracePenalite?: number;
  dureeContratDefautMois?: number;
  apportInitialPourcentage?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingService {
  private url = 'private/extra/settings/general';

  constructor(private api: ApiService) { }

  getSettings(): Observable<{ data: GeneralSetting }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  saveSettings(settings: GeneralSetting): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._post(`${this.url}/update`, settings).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }

  getHistory(): Observable<any> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(`${this.url}/history`).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '../../../utils/api.service';
import { NoInternetHelper } from '../../../utils/no-internet-helper';

export interface PathItem {
  id?: number;
  uuid?: string;
  nom?: string;
  libelle?: string;
  chemin?: string;
  permission?: string;
  type?: string;
  checked?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PathService {
  private url = 'private/admin/path';

  constructor(private api: ApiService) { }

  getList(): Observable<{ data: PathItem[] }> {
    if (!navigator.onLine) {
      NoInternetHelper.internet();
      return new Observable(obs => { obs.next(); obs.complete(); });
    }

    return this.api._get(this.url).pipe(
      map((response: any) => response),
      catchError((error: any) => throwError(() => error))
    );
  }
}

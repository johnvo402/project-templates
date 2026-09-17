import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import type { ApiResponse } from '../../../core/api/api.models';
import type { StoreSettings } from '../settings.models';

@Injectable({ providedIn:'root' })
export class SettingsApiService {
  private readonly http=inject(HttpClient);
  get(){return this.http.get<ApiResponse<StoreSettings>>('/api/settings').pipe(map(x=>x.results));}
  update(model:StoreSettings){return this.http.put<void>('/api/settings',model);}
}

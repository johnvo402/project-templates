import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserApiService } from './user-api.service';
import { UserSummary } from './user.models';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly api = inject(UserApiService);
  private readonly itemsState = signal<UserSummary[]>([]);
  readonly items = this.itemsState.asReadonly();
  async load(): Promise<void> { this.itemsState.set(await firstValueFrom(this.api.list())); }
}

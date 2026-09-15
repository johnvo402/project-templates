import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AiApiService } from './ai-api.service';

@Injectable({ providedIn: 'root' })
export class AiStore {
  private readonly api = inject(AiApiService);
  readonly output = signal('');
  readonly loading = signal(false);
  async generate(prompt: string): Promise<void> {
    this.loading.set(true);
    try { this.output.set(await firstValueFrom(this.api.generate(prompt))); }
    finally { this.loading.set(false); }
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AiApiService, type BusinessChatMessage } from './ai-api.service';

const DEFAULT_SUGGESTIONS = [
  'Summarize the current business situation.',
  'How many orders are pending right now?',
  'Which products are selling best?',
  'How many products are low on stock?',
];

@Injectable({ providedIn: 'root' })
export class AiStore {
  private readonly api = inject(AiApiService);

  readonly messages = signal<BusinessChatMessage[]>([]);
  readonly suggestions = signal<string[]>(DEFAULT_SUGGESTIONS);
  readonly error = signal('');
  readonly loading = signal(false);
  readonly historyLoading = signal(false);
  private historyLoaded = false;

  async loadHistory(): Promise<void> {
    if (this.historyLoaded || this.historyLoading()) return;

    this.historyLoading.set(true);
    try {
      this.messages.set(await firstValueFrom(this.api.getBusinessChatHistory()));
      this.historyLoaded = true;
    } catch {
      // The assistant stays usable if Redis/history loading is unavailable.
    } finally {
      this.historyLoading.set(false);
    }
  }

  async ask(question: string): Promise<void> {
    const trimmed = question.trim();
    if (!trimmed || this.loading()) return;

    this.messages.update(current => [...current, { role: 'user', content: trimmed }]);
    this.error.set('');
    this.loading.set(true);

    try {
      const response = await firstValueFrom(this.api.askBusinessQuestion(trimmed));
      this.messages.update(current => [...current, { role: 'assistant', content: response.answer }]);
      this.suggestions.set(response.suggestedQuestions.length > 0 ? response.suggestedQuestions : DEFAULT_SUGGESTIONS);
    } catch (value) {
      this.error.set(value instanceof Error ? value.message : 'Business AI request failed.');
    } finally {
      this.loading.set(false);
    }
  }
}

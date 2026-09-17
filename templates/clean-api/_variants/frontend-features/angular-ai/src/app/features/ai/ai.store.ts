import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AiApiService, type BusinessChatMessage } from './ai-api.service';

@Injectable({ providedIn: 'root' })
export class AiStore {
  private readonly api = inject(AiApiService);

  readonly messages = signal<BusinessChatMessage[]>([]);
  readonly suggestions = signal<string[]>([
    'Summarize the current business situation.',
    'How many orders are pending right now?',
    'Which products are selling best?',
    'How many products are low on stock?',
  ]);
  readonly error = signal('');
  readonly loading = signal(false);

  async ask(question: string): Promise<void> {
    const trimmed = question.trim();
    if (!trimmed || this.loading()) return;

    const history = this.messages().slice(-12);
    this.messages.update(current => [...current, { role: 'user', content: trimmed }]);
    this.error.set('');
    this.loading.set(true);

    try {
      const response = await firstValueFrom(this.api.askBusinessQuestion(trimmed, history));
      this.messages.update(current => [...current, { role: 'assistant', content: response.answer }]);
      this.suggestions.set(response.suggestedQuestions);
    } catch (value) {
      this.error.set(value instanceof Error ? value.message : 'Business AI request failed.');
    } finally {
      this.loading.set(false);
    }
  }
}

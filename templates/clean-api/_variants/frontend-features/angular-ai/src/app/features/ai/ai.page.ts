import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiStore } from './ai.store';

@Component({
  selector: 'app-ai-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Assistant</p>
          <h2>Business AI chat</h2>
        </div>
        <span class="pill">Read-only business data</span>
      </div>

      <p>
        Ask about revenue, orders, top products, inventory risk, recent activity, or operating suggestions.
        Unsupported or unrelated questions are rejected before they reach the AI provider.
      </p>

      @if (store.messages().length > 0) {
        <div class="stack">
          @for (message of store.messages(); track $index) {
            <div class="surface">
              <strong>{{ message.role === 'user' ? 'You' : 'Business AI' }}</strong>
              @if (message.role === 'assistant') {
                <pre class="ai-output">{{ message.content }}</pre>
              } @else {
                <p>{{ message.content }}</p>
              }
            </div>
          }
        </div>
      }

      <div class="stack">
        <p class="eyebrow">Try asking</p>
        <div>
          @for (suggestion of store.suggestions(); track suggestion) {
            <button type="button" [disabled]="store.loading()" (click)="ask(suggestion)">{{ suggestion }}</button>
          }
        </div>
      </div>

      <form class="stack" (ngSubmit)="submit()">
        <label>
          Question
          <textarea
            name="question"
            rows="4"
            maxlength="1000"
            placeholder="Example: Doanh thu và đơn hàng hiện tại có điểm gì cần chú ý?"
            [(ngModel)]="question"
          ></textarea>
        </label>
        <button class="primary" [disabled]="store.loading() || !question.trim()">
          {{ store.loading() ? 'Thinking…' : 'Ask business AI' }}
        </button>
      </form>

      @if (store.error()) {
        <p class="error surface-error">{{ store.error() }}</p>
      }
    </section>
  `,
})
export class AiPage {
  readonly store = inject(AiStore);
  question = '';

  async submit(): Promise<void> {
    const value = this.question;
    this.question = '';
    await this.store.ask(value);
  }

  async ask(question: string): Promise<void> {
    await this.store.ask(question);
  }
}

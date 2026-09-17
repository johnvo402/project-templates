import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiStore } from './ai.store';

@Component({
  selector: 'app-ai-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="ai-chat-root">
      @if (open) {
        <section class="ai-chat-panel" aria-label="Business AI assistant">
          <header class="ai-chat-header">
            <div class="ai-chat-brand">
              <span class="ai-chat-avatar" aria-hidden="true">✦</span>
              <div>
                <strong>Business AI</strong>
                <span>Read-only assistant</span>
              </div>
            </div>
            <button class="ai-chat-icon-button" type="button" aria-label="Close AI chat" (click)="open = false">×</button>
          </header>

          <div class="ai-chat-body">
            @if (store.historyLoading() && store.messages().length === 0) {
              <div class="ai-chat-status">Loading today's conversation…</div>
            }

            @if (!store.historyLoading() && store.messages().length === 0) {
              <div class="ai-chat-welcome">
                <span class="ai-chat-welcome-icon" aria-hidden="true">✦</span>
                <strong>What do you want to know?</strong>
                <p>Ask about revenue, orders, products, inventory, recent activity, or practical operating signals.</p>
              </div>
            }

            @for (message of store.messages(); track $index) {
              <div class="ai-message-row" [class.is-user]="message.role === 'user'">
                <div class="ai-message-bubble" [class.is-assistant]="message.role === 'assistant'">
                  {{ message.content }}
                </div>
              </div>
            }

            @if (store.loading()) {
              <div class="ai-message-row">
                <div class="ai-message-bubble ai-typing" aria-label="AI is thinking">
                  <span></span><span></span><span></span>
                </div>
              </div>
            }
          </div>

          <div class="ai-chat-suggestions">
            @for (suggestion of store.suggestions().slice(0, 3); track suggestion) {
              <button type="button" [disabled]="store.loading()" (click)="ask(suggestion)">{{ suggestion }}</button>
            }
          </div>

          @if (store.error()) {
            <p class="ai-chat-error">{{ store.error() }}</p>
          }

          <form class="ai-chat-composer" (ngSubmit)="submit()">
            <textarea
              name="question"
              rows="1"
              maxlength="1000"
              placeholder="Ask about your business…"
              aria-label="Ask Business AI"
              [(ngModel)]="question"
              (keydown)="handleKeydown($event)"
            ></textarea>
            <button class="ai-chat-send" type="submit" [disabled]="store.loading() || !question.trim()" aria-label="Send message">↑</button>
          </form>

          <div class="ai-chat-footnote">History resets automatically at 00:00 UTC.</div>
        </section>
      }

      <button
        class="ai-chat-launcher"
        type="button"
        [attr.aria-label]="open ? 'Close AI chat' : 'Open AI chat'"
        [attr.aria-expanded]="open"
        (click)="open = !open"
      >{{ open ? '×' : '✦' }}</button>
    </div>
  `,
  styles: [`
    .ai-chat-root{position:fixed;right:24px;bottom:24px;z-index:1400;font:inherit}
    .ai-chat-launcher{width:56px;height:56px;border:0;border-radius:18px;background:linear-gradient(135deg,#111827,#334155);color:#fff;box-shadow:0 18px 45px rgb(15 23 42/.28);cursor:pointer;font-size:24px;transition:transform .16s ease,box-shadow .16s ease}
    .ai-chat-launcher:hover{transform:translateY(-2px);box-shadow:0 22px 52px rgb(15 23 42/.34)}
    .ai-chat-panel{position:absolute;right:0;bottom:68px;width:min(390px,calc(100vw - 32px));height:min(620px,calc(100vh - 110px));display:grid;grid-template-rows:auto minmax(0,1fr) auto auto auto auto;overflow:hidden;border:1px solid rgb(148 163 184/.24);border-radius:24px;background:#fff;box-shadow:0 28px 80px rgb(15 23 42/.24)}
    .ai-chat-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid #e5e7eb;background:linear-gradient(180deg,#fff,#f8fafc)}
    .ai-chat-brand{display:flex;align-items:center;gap:11px}.ai-chat-brand>div{display:grid;gap:2px}.ai-chat-brand strong{color:#0f172a;font-size:14px}.ai-chat-brand span:not(.ai-chat-avatar){color:#64748b;font-size:11px}
    .ai-chat-avatar,.ai-chat-welcome-icon{display:grid;place-items:center;background:#111827;color:#fff}.ai-chat-avatar{width:34px;height:34px;border-radius:12px}
    .ai-chat-icon-button{width:34px;height:34px;border:0;border-radius:10px;background:transparent;color:#64748b;cursor:pointer;font-size:24px}.ai-chat-icon-button:hover{background:#f1f5f9;color:#0f172a}
    .ai-chat-body{overflow-y:auto;padding:18px 16px 10px;background:#f8fafc}.ai-chat-status{padding:28px 12px;color:#64748b;text-align:center;font-size:13px}
    .ai-chat-welcome{display:grid;justify-items:center;gap:8px;padding:28px 20px 20px;text-align:center}.ai-chat-welcome-icon{width:42px;height:42px;margin-bottom:4px;border-radius:15px;font-size:18px}.ai-chat-welcome strong{color:#0f172a;font-size:16px}.ai-chat-welcome p{margin:0;color:#64748b;font-size:13px;line-height:1.55}
    .ai-message-row{display:flex;margin:8px 0}.ai-message-row.is-user{justify-content:flex-end}.ai-message-bubble{max-width:86%;padding:10px 12px;border-radius:16px 16px 16px 5px;background:#fff;color:#1e293b;box-shadow:0 1px 2px rgb(15 23 42/.08);font-size:13px;line-height:1.55;white-space:pre-wrap}.ai-message-row.is-user .ai-message-bubble{border-radius:16px 16px 5px 16px;background:#111827;color:#fff}
    .ai-typing{display:flex;gap:5px;align-items:center;min-width:52px;min-height:38px}.ai-typing span{width:6px;height:6px;border-radius:999px;background:#94a3b8;animation:ai-chat-pulse 1s infinite ease-in-out}.ai-typing span:nth-child(2){animation-delay:.12s}.ai-typing span:nth-child(3){animation-delay:.24s}@keyframes ai-chat-pulse{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-2px)}}
    .ai-chat-suggestions{display:flex;gap:7px;overflow-x:auto;padding:10px 14px 6px;background:#fff}.ai-chat-suggestions button{flex:0 0 auto;max-width:250px;overflow:hidden;padding:7px 10px;border:1px solid #e2e8f0;border-radius:999px;background:#fff;color:#475569;cursor:pointer;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
    .ai-chat-error{margin:4px 14px;padding:8px 10px;border-radius:10px;background:#fff1f2;color:#be123c;font-size:11px}
    .ai-chat-composer{display:grid;grid-template-columns:minmax(0,1fr) 38px;gap:8px;align-items:end;padding:10px 12px 8px;background:#fff}.ai-chat-composer textarea{min-height:40px;max-height:110px;resize:none;padding:10px 12px;border:1px solid #dbe3ec;border-radius:14px;outline:none;color:#0f172a;background:#f8fafc;font:inherit;font-size:13px}.ai-chat-composer textarea:focus{border-color:#94a3b8;background:#fff;box-shadow:0 0 0 3px rgb(148 163 184/.15)}
    .ai-chat-send{width:38px;height:38px;border:0;border-radius:12px;background:#111827;color:#fff;cursor:pointer;font-size:18px}.ai-chat-send:disabled{cursor:not-allowed;opacity:.4}.ai-chat-footnote{padding:0 14px 10px;background:#fff;color:#94a3b8;text-align:center;font-size:10px}
    @media(max-width:640px){.ai-chat-root{right:16px;bottom:16px}.ai-chat-panel{position:fixed;inset:16px 16px 84px;width:auto;height:auto}}
  `],
})
export class AiPage implements OnInit {
  readonly store = inject(AiStore);
  question = '';
  open = false;

  ngOnInit(): void {
    void this.store.loadHistory();
  }

  async submit(): Promise<void> {
    const value = this.question;
    this.question = '';
    await this.store.ask(value);
  }

  async ask(question: string): Promise<void> {
    await this.store.ask(question);
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.submit();
    }
  }
}

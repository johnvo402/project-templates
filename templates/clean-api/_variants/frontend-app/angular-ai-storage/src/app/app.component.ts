import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from './components/app-shell.component';
import { AuthSessionService, AuthUser } from './core/auth/auth-session.service';
import { AiPage } from './features/ai/ai.page';
import { LoginPage } from './features/auth/login.page';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginPage, AppShellComponent, RouterOutlet, AiPage],
  template: `
    @if (!ready()) {
      <main class="shell"><p>Restoring session…</p></main>
    } @else if (!auth.user()) {
      <app-login-page (authenticated)="onAuthenticated($event)" />
    } @else {
      <app-shell [user]="auth.user()!" (logout)="onLogout()"><router-outlet /></app-shell>
      @if (auth.can('ai.generate')) {
        <app-ai-page />
      }
    }
  `,
})
export class AppComponent implements OnInit {
  readonly auth = inject(AuthSessionService);
  readonly ready = signal(false);

  async ngOnInit(): Promise<void> {
    await this.auth.bootstrap();
    this.ready.set(true);
  }

  onAuthenticated(_user: AuthUser): void {}

  async onLogout(): Promise<void> {
    await this.auth.logout();
  }
}

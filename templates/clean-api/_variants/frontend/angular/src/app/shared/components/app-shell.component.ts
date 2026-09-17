import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { AuthUser } from '../../core/auth/auth-session.service';
import { groupNavigation, visibleNavigation } from '../navigation/app-navigation';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatListModule, MatSidenavModule, MatToolbarModule, RouterLink, RouterLinkActive],
  styles: [`
    :host { display: block; min-height: 100vh; }
    .app-shell { height: 100vh; background: var(--mat-sys-surface-container-low); }
    .sidebar { width: 264px; border-right: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); }
    .brand { height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 18px; }
    .brand-mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font-weight: 900; }
    .brand-copy { display: grid; line-height: 1.15; }
    .brand-copy small { color: var(--mat-sys-on-surface-variant); margin-top: 3px; }
    .nav-scroll { height: calc(100% - 65px); overflow: auto; padding: 10px 8px; }
    .nav-group { margin-bottom: 8px; }
    .nav-label { display: block; padding: 8px 12px 4px; color: var(--mat-sys-on-surface-variant); font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
    a[mat-list-item] { border-radius: 10px; margin: 2px 0; }
    .active-link { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    .toolbar { position: sticky; top: 0; z-index: 20; height: 64px; border-bottom: 1px solid var(--mat-sys-outline-variant); background: color-mix(in srgb, var(--mat-sys-surface) 94%, transparent); }
    .menu-button { display: none; }
    .spacer { flex: 1; }
    .account { display: flex; align-items: center; gap: 10px; }
    .avatar { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); font-size: 12px; font-weight: 800; }
    .account-copy { display: grid; line-height: 1.15; }
    .account-copy small { color: var(--mat-sys-on-surface-variant); max-width: 260px; overflow: hidden; text-overflow: ellipsis; }
    .role { padding: 4px 9px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 999px; font-size: 12px; }
    .page { max-width: 1440px; margin: 0 auto; padding: 28px 28px 48px; }
    @media (max-width: 959px) {
      .menu-button { display: inline-flex; }
      .page { padding: 20px 16px 40px; }
      .account-copy, .role { display: none; }
    }
  `],
  template: `
    <mat-sidenav-container class="app-shell">
      <mat-sidenav #drawer class="sidebar" [mode]="isHandset() ? 'over' : 'side'" [opened]="!isHandset()" [fixedInViewport]="isHandset()">
        <div class="brand">
          <div class="brand-mark">JV</div>
          <div class="brand-copy"><strong>TemplateApp</strong><small>Mini Store Admin</small></div>
        </div>
        <mat-divider />
        <div class="nav-scroll">
          @for (group of groups(); track group.name) {
            <div class="nav-group">
              <span class="nav-label">{{ group.name }}</span>
              <mat-nav-list>
                @for (item of group.items; track item.path) {
                  <a mat-list-item [routerLink]="item.path" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }" (click)="isHandset() && drawer.close()">{{ item.label }}</a>
                }
              </mat-nav-list>
            </div>
          }
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="toolbar">
          <button mat-button class="menu-button" (click)="drawer.open()" aria-label="Open navigation">☰</button>
          <span class="spacer"></span>
          <div class="account">
            <div class="avatar">{{ initials() }}</div>
            <div class="account-copy"><strong>{{ user().displayName }}</strong><small>{{ user().email }}</small></div>
            <span class="role">{{ user().role }}</span>
            <button mat-button (click)="logout.emit()">Sign out</button>
          </div>
        </mat-toolbar>
        <main class="page"><ng-content /></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AppShellComponent {
  readonly user = input.required<AuthUser>();
  readonly logout = output<void>();

  private readonly breakpoints = inject(BreakpointObserver);

  readonly isHandset = toSignal(
    this.breakpoints.observe('(max-width: 959px)').pipe(map(result => result.matches)),
    { initialValue: false },
  );

  readonly initials = computed(() => this.user().displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'U');

  readonly groups = computed(() => groupNavigation(visibleNavigation(this.user())));
}

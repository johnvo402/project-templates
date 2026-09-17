import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-async-state',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block}.state{display:grid;place-items:center;gap:12px;padding:48px 24px;text-align:center;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;background:var(--mat-sys-surface)}.state.error{border-color:var(--mat-sys-error);color:var(--mat-sys-error)}h3,p{margin:0}p{color:var(--mat-sys-on-surface-variant);max-width:520px}.error p{color:inherit}
  `],
  template: `
    @if(loading()){
      <section class="state" role="status"><mat-spinner diameter="28"/><p>{{loadingLabel()}}</p></section>
    }@else if(error()){
      <section class="state error" role="alert"><h3>Something went wrong</h3><p>{{error()}}</p>@if(showRetry()){<button mat-button (click)="retry.emit()">Retry</button>}</section>
    }@else if(empty()){
      <section class="state"><h3>{{emptyTitle()}}</h3><p>{{emptyMessage()}}</p></section>
    }
  `,
})
export class AsyncStateComponent {
  readonly loading = input(false);
  readonly error = input<string | null>();
  readonly empty = input(false);
  readonly showRetry = input(false);
  readonly loadingLabel = input('Loading…');
  readonly emptyTitle = input('Nothing here yet');
  readonly emptyMessage = input('There is no data to display.');
  readonly retry = output<void>();
}

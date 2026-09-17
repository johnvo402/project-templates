import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block;margin-bottom:24px}.page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}.copy{min-width:0}.eyebrow{margin:0 0 4px;color:var(--mat-sys-primary);font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}h1{margin:0;font-size:32px;line-height:1.15;letter-spacing:-.025em}p{margin:8px 0 0;max-width:760px;color:var(--mat-sys-on-surface-variant)}.actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}@media(max-width:599px){.page-header{flex-direction:column}.actions{width:100%}}
  `],
  template: `
    <header class="page-header">
      <div class="copy">
        @if(eyebrow()){<p class="eyebrow">{{eyebrow()}}</p>}
        <h1>{{title()}}</h1>
        @if(description()){<p>{{description()}}</p>}
      </div>
      <div class="actions"><ng-content select="[pageActions]"/></div>
    </header>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string>();
  readonly eyebrow = input<string>();
}

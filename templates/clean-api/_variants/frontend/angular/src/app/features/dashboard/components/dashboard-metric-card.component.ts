import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({ selector: 'app-dashboard-metric-card', standalone: true, imports: [MatCardModule], changeDetection: ChangeDetectionStrategy.OnPush, styles: [`mat-card{height:100%;border-radius:16px}mat-card-content{display:grid;gap:8px;padding:20px}.label,.helper{color:var(--mat-sys-on-surface-variant)}.label{font-size:14px}.value{font-size:24px;font-weight:750;letter-spacing:-.02em}.helper{font-size:12px}`], template: `<mat-card appearance="outlined"><mat-card-content><span class="label">{{label()}}</span><strong class="value">{{value()}}</strong>@if(helper()){<span class="helper">{{helper()}}</span>}</mat-card-content></mat-card>` })
export class DashboardMetricCardComponent { readonly label=input.required<string>(); readonly value=input.required<string|number>(); readonly helper=input<string>(); }

import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, firstValueFrom, timer } from 'rxjs';
import { AsyncStateComponent } from '../../../components/async-state.component';
import { PageHeaderComponent } from '../../../components/page-header.component';
import { formatCurrency, getConfiguredCurrency } from '../../../utils/formatters';
import { getErrorMessage } from '../../../core/api/http-error';
import { DashboardMetricCardComponent } from '../components/dashboard-metric-card.component';
import { TopProductsPanelComponent } from '../components/top-products-panel.component';
import { DashboardApiService } from '../data-access/dashboard-api.service';
import type { DashboardProjection } from '../dashboard.models';

@Component({
  selector:'app-dashboard-page',
  standalone:true,
  imports:[MatButtonModule,PageHeaderComponent,AsyncStateComponent,DashboardMetricCardComponent,TopProductsPanelComponent],
  styles:[`:host{display:block}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:16px}.panels{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(320px,1fr);gap:16px}.revenue-panel{border:1px solid var(--mat-sys-outline-variant);border-radius:16px;padding:20px;min-height:320px;background:var(--mat-sys-surface)}.panel-title{font-size:20px;font-weight:700;margin:0}.panel-subtitle{color:var(--mat-sys-on-surface-variant);margin:4px 0 0}.chart{height:210px;display:flex;align-items:flex-end;gap:6px;padding-top:28px;overflow-x:auto}.bar{flex:1 0 9px;min-width:9px;max-width:22px;background:var(--mat-sys-primary);border-radius:6px 6px 2px 2px;opacity:.85}.chart-labels{display:flex;justify-content:space-between;gap:16px;margin-top:8px;color:var(--mat-sys-on-surface-variant);font-size:12px}.empty{padding:72px 0;text-align:center;color:var(--mat-sys-on-surface-variant)}@media(max-width:959px){.panels{grid-template-columns:1fr}}`],
  template:`<app-page-header eyebrow="Financial overview" title="Dashboard" [description]="description()"><div pageActions><button mat-stroked-button (click)="load()" [disabled]="loading()">Refresh</button></div></app-page-header><app-async-state [loading]="loading()" [error]="error()" [showRetry]="true" (retry)="load()"/>@if(data();as dashboard){<section class="metrics"><app-dashboard-metric-card label="Revenue today" [value]="money(dashboard.revenueToday)" helper="Current day"/><app-dashboard-metric-card label="Revenue this month" [value]="money(dashboard.revenueThisMonth)" helper="Month to date"/><app-dashboard-metric-card label="30-day revenue" [value]="money(rollingRevenue(dashboard))" helper="Rolling 30-day window"/><app-dashboard-metric-card label="Daily average" [value]="money(rollingRevenue(dashboard)/30)" helper="Average over 30 days"/></section><section class="panels"><article class="revenue-panel"><h2 class="panel-title">Revenue trend</h2><p class="panel-subtitle">Last 30 days in {{currency()}}.</p>@if(dashboard.revenue.length){<div class="chart">@for(point of dashboard.revenue;track point.date){<div class="bar" [style.height]="barHeight(point.revenue,dashboard)" [attr.title]="point.date+': '+money(point.revenue)"></div>}</div><div class="chart-labels"><span>{{dashboard.revenue[0].date}}</span><span>{{dashboard.revenue[dashboard.revenue.length-1].date}}</span></div>}@else{<div class="empty">No revenue data yet.</div>}</article><app-top-products-panel [products]="dashboard.topProducts"/></section>}`
})
export class DashboardPage implements OnInit,OnDestroy {
  readonly loading=signal(false);
  readonly error=signal<string|null>(null);
  readonly data=signal<DashboardProjection|null>(null);
  readonly money=formatCurrency;
  private readonly api=inject(DashboardApiService);
  private refresh?:Subscription;

  ngOnInit(){this.refresh=timer(0,30_000).subscribe(()=>void this.load());}
  ngOnDestroy(){this.refresh?.unsubscribe();}
  description(){return `Revenue and sales performance. Monetary values follow Settings → Currency (${getConfiguredCurrency()}).`;}
  currency(){return getConfiguredCurrency();}
  rollingRevenue(dashboard:DashboardProjection){return dashboard.revenue.reduce((sum,point)=>sum+point.revenue,0);}
  barHeight(value:number,dashboard:DashboardProjection){const max=Math.max(1,...dashboard.revenue.map(point=>point.revenue));const height=value<=0?2:Math.max(6,(value/max)*100);return `${height}%`;}
  async load(){this.loading.set(true);this.error.set(null);try{this.data.set(await firstValueFrom(this.api.get()));}catch(error){this.error.set(getErrorMessage(error));}finally{this.loading.set(false);}}
}

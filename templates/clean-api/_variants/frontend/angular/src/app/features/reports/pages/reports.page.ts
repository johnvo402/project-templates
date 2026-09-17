import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { AsyncStateComponent } from '../../../shared/components/async-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { OrderStatusReportComponent } from '../components/order-status-report.component';
import { TopProductsReportComponent } from '../components/top-products-report.component';
import { ReportsApiService } from '../data-access/reports-api.service';
import type { OrderStatusReport, TopProductReport } from '../report.models';

@Component({ selector:'app-reports-page', standalone:true, imports:[MatButtonModule,PageHeaderComponent,AsyncStateComponent,TopProductsReportComponent,OrderStatusReportComponent], styles:[`:host{display:block}.reports{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:16px}@media(max-width:959px){.reports{grid-template-columns:1fr}}`], template:`<app-page-header eyebrow="Analytics" title="Reports" description="Focused business signals without turning the starter into an ERP."><div pageActions><button mat-stroked-button (click)="load()" [disabled]="loading()">Refresh</button></div></app-page-header><app-async-state [loading]="loading()" [error]="error()" [showRetry]="true" (retry)="load()"/>@if(!loading()&&!error()){<section class="reports"><app-top-products-report [rows]="topProducts()"/><app-order-status-report [rows]="statuses()"/></section>}` })
export class ReportsPage implements OnInit { readonly loading=signal(false); readonly error=signal<string|null>(null); readonly topProducts=signal<TopProductReport[]>([]); readonly statuses=signal<OrderStatusReport[]>([]); private readonly api=inject(ReportsApiService); ngOnInit(){void this.load();} async load(){this.loading.set(true);this.error.set(null);try{const [products,statuses]=await Promise.all([firstValueFrom(this.api.topProducts()),firstValueFrom(this.api.ordersByStatus())]);this.topProducts.set(products);this.statuses.set(statuses);}catch(error){this.error.set(getErrorMessage(error));}finally{this.loading.set(false);}} }

import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import type { PaginationResponse } from '../../../core/api/api.models';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AsyncStateComponent } from '../../../components/async-state.component';
import { ConfirmDialogService } from '../../../components/confirm-dialog.service';
import { PageHeaderComponent } from '../../../components/page-header.component';
import { NotificationService } from '../../../feedback/notification.service';
import { FILTER_ENABLED, type BusinessListQuery, type ListFilter } from '../../../query/business-query';
import { getErrorMessage } from '../../../utils/http-error';
import { OrderDetailDialogComponent } from '../components/order-detail-dialog.component';
import { OrderFiltersComponent } from '../components/order-filters.component';
import { OrderFormDialogComponent } from '../components/order-form-dialog.component';
import { OrderTableComponent } from '../components/order-table.component';
import { OrdersApiService } from '../data-access/orders-api.service';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderFilterState, ProductOption } from '../order.models';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, PageHeaderComponent, AsyncStateComponent, OrderFiltersComponent, OrderTableComponent],
  styles: [`
    :host{display:block}.pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px;padding:12px 16px;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;background:var(--mat-sys-surface)}.pager-actions{display:flex;align-items:center;gap:8px}.page-size{width:100px;margin-bottom:-20px}@media(max-width:599px){.pager{align-items:stretch;flex-direction:column}.pager-actions{justify-content:space-between}}
  `],
  template: `
    <app-page-header eyebrow="Sales" title="Orders" description="Create orders and move them through fulfillment."><div pageActions><button mat-stroked-button (click)="load()" [disabled]="loading()">Refresh</button>@if(auth.can('orders.create')){<button mat-flat-button (click)="openForm()" [disabled]="loadingProducts()">{{loadingProducts()?'Loading…':'New order'}}</button>}</div></app-page-header>
    @if(filterEnabled){<app-order-filters (applyFilters)="applyFilters($event)" (clearFilters)="clearFilters()"/>}
    <app-async-state [loading]="loading()" [error]="error()" [empty]="!loading()&&!error()&&(page()?.data?.length??0)===0" [showRetry]="true" emptyTitle="No orders yet" emptyMessage="Create the first order or adjust the current filters." (retry)="load()"/>
    @if(page(); as result){@if(result.data.length){<app-order-table [orders]="result.data" [busy]="actionBusy()" [canUpdate]="auth.can('orders.update-status')" [canCancel]="auth.can('orders.cancel')" (view)="openDetail($event)" (changeStatus)="updateStatus($event.order,$event.status)" (cancel)="cancelOrder($event)"/>@if(result.paging){<section class="pager"><span>{{result.paging.totalPage ? 'Page '+(result.paging.currentPage ?? query.page)+' of '+result.paging.totalPage : 'No results'}}</span><div class="pager-actions"><mat-form-field class="page-size" appearance="outline"><mat-label>Rows</mat-label><mat-select [value]="query.pageSize" (selectionChange)="changePageSize($event.value)">@for(size of pageSizes;track size){<mat-option [value]="size">{{size}}</mat-option>}</mat-select></mat-form-field><button mat-button [disabled]="!result.paging.hasPreviousPage" (click)="changePage(Math.max(1,(result.paging.currentPage ?? query.page)-1))">Prev</button><button mat-button [disabled]="!result.paging.hasNextPage" (click)="changePage((result.paging.currentPage ?? query.page)+1)">Next</button></div></section>}}}
  `,
})
export class OrdersPage implements OnInit {
  readonly auth = inject(AuthSessionService);
  readonly filterEnabled = FILTER_ENABLED;
  readonly pageSizes = [10, 20, 50, 100];
  readonly Math = Math;
  readonly loading = signal(false);
  readonly loadingProducts = signal(false);
  readonly actionBusy = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal<PaginationResponse<Order> | null>(null);
  query: BusinessListQuery = { page: 1, pageSize: 20 };

  private readonly api = inject(OrdersApiService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  ngOnInit() { void this.load(); }

  async load() { this.loading.set(true); this.error.set(null); try { this.page.set(await firstValueFrom(this.api.list(this.query))); } catch (error) { this.error.set(getErrorMessage(error)); } finally { this.loading.set(false); } }
  applyFilters(filters: OrderFilterState) { const lhs: ListFilter[] = []; if (filters.status) lhs.push({ field: 'Status', operator: '$eqi', value: filters.status }); if (filters.minTotal.trim()) lhs.push({ field: 'TotalAmount', operator: '$gte', value: Math.max(0, Number(filters.minTotal)) }); this.query = { ...this.query, page: 1, keyword: filters.keyword.trim() || undefined, targets: ['OrderNumber', 'CustomerName', 'CustomerPhone'], sort: filters.sort || undefined, filters: lhs }; void this.load(); }
  clearFilters() { this.query = { page: 1, pageSize: this.query.pageSize }; void this.load(); }
  changePage(page: number) { this.query = { ...this.query, page }; void this.load(); }
  changePageSize(pageSize: number) { this.query = { ...this.query, page: 1, pageSize }; void this.load(); }

  async openDetail(order: Order) {
    try {
      const detail = await firstValueFrom(this.api.detail(order.id));
      this.dialog.open(OrderDetailDialogComponent, { data: detail, width: '720px', maxWidth: 'calc(100vw - 32px)', autoFocus: false });
    } catch (error) { this.notifications.error(getErrorMessage(error)); }
  }

  async openForm() {
    this.loadingProducts.set(true);
    let products: ProductOption[];
    try { products = (await firstValueFrom(this.api.activeProducts())).data; }
    catch (error) { this.notifications.error(getErrorMessage(error)); return; }
    finally { this.loadingProducts.set(false); }
    const model = await firstValueFrom(this.dialog.open(OrderFormDialogComponent, { data: { products }, width: '780px', maxWidth: 'calc(100vw - 32px)', autoFocus: false }).afterClosed());
    if (model) await this.createOrder(model);
  }

  async createOrder(model: CreateOrderModel) { this.actionBusy.set(true); try { await firstValueFrom(this.api.create(model)); this.notifications.success('Order created.'); await this.load(); } catch (error) { this.notifications.error(getErrorMessage(error)); } finally { this.actionBusy.set(false); } }
  async updateStatus(order: Order, status: MutableOrderStatus) { this.actionBusy.set(true); try { await firstValueFrom(this.api.updateStatus(order.id, status)); this.notifications.success(`Order moved to ${status}.`); await this.load(); } catch (error) { this.notifications.error(getErrorMessage(error)); } finally { this.actionBusy.set(false); } }
  async cancelOrder(order: Order) { const confirmed = await this.confirm.confirm({ title: 'Cancel order?', description: `Cancel ${order.orderNumber}? Reserved stock will be restored.`, confirmLabel: 'Cancel order', destructive: true }); if (!confirmed) return; this.actionBusy.set(true); try { await firstValueFrom(this.api.cancel(order.id)); this.notifications.success('Order cancelled.'); await this.load(); } catch (error) { this.notifications.error(getErrorMessage(error)); } finally { this.actionBusy.set(false); } }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import type { PaginationResponse } from '../../../core/api/api.models';
import { AsyncStateComponent } from '../../../shared/components/async-state.component';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { NotificationService } from '../../../shared/feedback/notification.service';
import { FILTER_ENABLED, type BusinessListQuery, type ListFilter } from '../../../shared/query/business-query';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { ProductFiltersComponent } from '../components/product-filters.component';
import { ProductFormDialogComponent } from '../components/product-form-dialog.component';
import { ProductTableComponent } from '../components/product-table.component';
import { ProductsApiService } from '../data-access/products-api.service';
import type { Product, ProductFilterState, ProductModel } from '../product.models';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, PageHeaderComponent, AsyncStateComponent, ProductFiltersComponent, ProductTableComponent],
  styles: [`
    :host{display:block}.pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px;padding:12px 16px;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;background:var(--mat-sys-surface)}.pager-actions{display:flex;align-items:center;gap:8px}.page-size{width:100px;margin-bottom:-20px}@media(max-width:599px){.pager{align-items:stretch;flex-direction:column}.pager-actions{justify-content:space-between}}
  `],
  template: `
    <app-page-header eyebrow="Sales" title="Products" description="Catalog, pricing and stock at a glance.">
      <div pageActions><button mat-stroked-button (click)="load()" [disabled]="loading()">Refresh</button>@if(auth.can('products.create')){<button mat-flat-button (click)="openForm(null)">Add product</button>}</div>
    </app-page-header>

    @if(filterEnabled){<app-product-filters (applyFilters)="applyFilters($event)" (clearFilters)="clearFilters()"/>}

    <app-async-state [loading]="loading()" [error]="error()" [empty]="!loading()&&!error()&&(page()?.data?.length??0)===0" [showRetry]="true" emptyTitle="No products yet" emptyMessage="Create your first product or adjust the current filters." (retry)="load()"/>

    @if(page(); as result){
      @if(result.data.length){
        <app-product-table [products]="result.data" [canUpdate]="auth.can('products.update')" [canDelete]="auth.can('products.delete')" (edit)="openForm($event)" (remove)="deleteProduct($event)"/>
        @if(result.paging){<section class="pager"><span>{{result.paging.totalPage ? 'Page '+(result.paging.currentPage ?? query.page)+' of '+result.paging.totalPage : 'No results'}}</span><div class="pager-actions"><mat-form-field class="page-size" appearance="outline"><mat-label>Rows</mat-label><mat-select [value]="query.pageSize" (selectionChange)="changePageSize($event.value)">@for(size of pageSizes;track size){<mat-option [value]="size">{{size}}</mat-option>}</mat-select></mat-form-field><button mat-button [disabled]="!result.paging.hasPreviousPage" (click)="changePage(Math.max(1,(result.paging.currentPage ?? query.page)-1))">Prev</button><button mat-button [disabled]="!result.paging.hasNextPage" (click)="changePage((result.paging.currentPage ?? query.page)+1)">Next</button></div></section>}
      }
    }
  `,
})
export class ProductsPage implements OnInit {
  readonly auth = inject(AuthSessionService);
  readonly filterEnabled = FILTER_ENABLED;
  readonly pageSizes = [10, 20, 50, 100];
  readonly Math = Math;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal<PaginationResponse<Product> | null>(null);
  query: BusinessListQuery = { page: 1, pageSize: 20 };

  private readonly api = inject(ProductsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  ngOnInit() { void this.load(); }

  async load() {
    this.loading.set(true); this.error.set(null);
    try { this.page.set(await firstValueFrom(this.api.list(this.query))); }
    catch (error) { this.error.set(getErrorMessage(error)); }
    finally { this.loading.set(false); }
  }

  applyFilters(filters: ProductFilterState) {
    const lhs: ListFilter[] = [];
    if (filters.active) lhs.push({ field: 'IsActive', operator: '$eq', value: filters.active === 'true' });
    if (filters.lowStock.trim()) lhs.push({ field: 'StockQuantity', operator: '$lte', value: Math.max(0, Number(filters.lowStock)) });
    this.query = { ...this.query, page: 1, keyword: filters.keyword.trim() || undefined, targets: ['Name', 'Sku'], sort: filters.sort || undefined, filters: lhs };
    void this.load();
  }

  clearFilters() { this.query = { page: 1, pageSize: this.query.pageSize }; void this.load(); }
  changePage(page: number) { this.query = { ...this.query, page }; void this.load(); }
  changePageSize(pageSize: number) { this.query = { ...this.query, page: 1, pageSize }; void this.load(); }

  async openForm(product: Product | null) {
    const model = await firstValueFrom(this.dialog.open(ProductFormDialogComponent, { data: { product }, width: '620px', maxWidth: 'calc(100vw - 32px)', autoFocus: false }).afterClosed());
    if (!model) return;
    await this.saveProduct(product, model);
  }

  async saveProduct(product: Product | null, model: ProductModel) {
    try {
      if (product) await firstValueFrom(this.api.update(product.id, model));
      else await firstValueFrom(this.api.create(model));
      this.notifications.success(product ? 'Product updated.' : 'Product created.');
      await this.load();
    } catch (error) { this.notifications.error(getErrorMessage(error)); }
  }

  async deleteProduct(product: Product) {
    const confirmed = await this.confirm.confirm({ title: 'Delete product?', description: `Delete ${product.name}? This action cannot be undone.`, confirmLabel: 'Delete', destructive: true });
    if (!confirmed) return;
    try { await firstValueFrom(this.api.remove(product.id)); this.notifications.success('Product deleted.'); await this.load(); }
    catch (error) { this.notifications.error(getErrorMessage(error)); }
  }
}

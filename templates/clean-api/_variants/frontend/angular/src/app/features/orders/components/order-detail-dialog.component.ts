import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { OrderDetail } from '../order.models';

@Component({
  selector: 'app-order-detail-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.label{display:block;color:var(--mat-sys-on-surface-variant);font-size:12px;margin-bottom:4px}.value{font-weight:600}.items{display:grid;gap:12px;margin:16px 0}.item{display:flex;justify-content:space-between;gap:16px}.muted{color:var(--mat-sys-on-surface-variant);font-size:13px}.total{display:flex;justify-content:space-between;gap:16px;align-items:center;margin-top:16px;font-size:18px;font-weight:700}@media(max-width:599px){.meta{grid-template-columns:1fr}}
  `],
  template: `
    <h2 mat-dialog-title>Order detail</h2>
    <mat-dialog-content>
      <section class="meta">
        <div><span class="label">Order</span><span class="value">{{order.orderNumber}}</span></div>
        <div><span class="label">Status</span><span class="value">{{order.status}}</span></div>
        <div><span class="label">Customer</span><span class="value">{{order.customerName}}</span></div>
        <div><span class="label">Phone</span><span class="value">{{order.customerPhone || '—'}}</span></div>
        <div><span class="label">Created</span><span class="value">{{date(order.createdAt)}}</span></div>
        <div><span class="label">Updated</span><span class="value">{{date(order.updatedAt)}}</span></div>
      </section>
      <mat-divider style="margin-top:16px"/>
      <section class="items">
        @for(item of order.items;track item.productId){<div class="item"><div><div class="value">{{item.productName}}</div><div class="muted">{{item.quantity}} × {{money(item.unitPrice)}}</div></div><div class="value">{{money(item.total)}}</div></div>}
      </section>
      <mat-divider/>
      <div class="total"><span>{{itemCount}} items</span><span>{{money(order.totalAmount)}}</span></div>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Close</button></mat-dialog-actions>
  `,
})
export class OrderDetailDialogComponent {
  readonly order = inject<OrderDetail>(MAT_DIALOG_DATA);
  readonly money = formatCurrency;
  readonly date = formatDate;
  get itemCount() { return this.order.items.reduce((sum, item) => sum + item.quantity, 0); }
}

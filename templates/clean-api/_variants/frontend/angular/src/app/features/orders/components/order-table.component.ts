import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import type { MutableOrderStatus, Order, OrderStatus } from '../order.models';

@Component({
  selector: 'app-order-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;overflow:auto;background:var(--mat-sys-surface)}table{width:100%;min-width:980px}.actions{display:flex;gap:4px;flex-wrap:wrap}.status{display:inline-flex;align-items:center;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;background:var(--mat-sys-surface-container-high);color:var(--mat-sys-on-surface-variant)}.status-processing{background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container)}.status-completed{background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}.status-cancelled{background:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}
  `],
  template: `
    <table mat-table [dataSource]="orders()">
      <ng-container matColumnDef="order"><th mat-header-cell *matHeaderCellDef>Order</th><td mat-cell *matCellDef="let order">{{order.orderNumber}}</td></ng-container>
      <ng-container matColumnDef="customer"><th mat-header-cell *matHeaderCellDef>Customer</th><td mat-cell *matCellDef="let order">{{order.customerName}}</td></ng-container>
      <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let order"><span [class]="statusClass(order.status)">{{order.status}}</span></td></ng-container>
      <ng-container matColumnDef="items"><th mat-header-cell *matHeaderCellDef>Items</th><td mat-cell *matCellDef="let order">{{order.items.length}}</td></ng-container>
      <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let order">{{money(order.totalAmount)}}</td></ng-container>
      <ng-container matColumnDef="created"><th mat-header-cell *matHeaderCellDef>Created</th><td mat-cell *matCellDef="let order">{{date(order.createdAt)}}</td></ng-container>
      <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let order"><div class="actions">@if(canUpdate()&&order.status==='Pending'){<button mat-button [disabled]="busy()" (click)="changeStatus.emit({order,status:'Processing'})">Process</button>}@if(canUpdate()&&(order.status==='Pending'||order.status==='Processing')){<button mat-button [disabled]="busy()" (click)="changeStatus.emit({order,status:'Completed'})">Complete</button>}@if(canCancel()&&order.status!=='Completed'&&order.status!=='Cancelled'){<button mat-button color="warn" [disabled]="busy()" (click)="cancel.emit(order)">Cancel</button>}</div></td></ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
export class OrderTableComponent {
  readonly orders = input.required<Order[]>();
  readonly canUpdate = input(false);
  readonly canCancel = input(false);
  readonly busy = input(false);
  readonly changeStatus = output<{ order: Order; status: MutableOrderStatus }>();
  readonly cancel = output<Order>();
  readonly columns = ['order', 'customer', 'status', 'items', 'total', 'created', 'actions'];
  readonly money = formatCurrency;
  readonly date = formatDate;
  statusClass(status: OrderStatus) { return `status status-${status.toLowerCase()}`; }
}

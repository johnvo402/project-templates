import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import type { Product } from '../product.models';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;overflow:auto;background:var(--mat-sys-surface)}table{width:100%;min-width:820px}.actions{display:flex;gap:4px}
  `],
  template: `
    <table mat-table [dataSource]="products()">
      <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Product</th><td mat-cell *matCellDef="let product">{{product.name}}</td></ng-container>
      <ng-container matColumnDef="sku"><th mat-header-cell *matHeaderCellDef>SKU</th><td mat-cell *matCellDef="let product">{{product.sku}}</td></ng-container>
      <ng-container matColumnDef="price"><th mat-header-cell *matHeaderCellDef>Price</th><td mat-cell *matCellDef="let product">{{money(product.price)}}</td></ng-container>
      <ng-container matColumnDef="stock"><th mat-header-cell *matHeaderCellDef>Stock</th><td mat-cell *matCellDef="let product">{{product.stockQuantity}}</td></ng-container>
      <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let product"><mat-chip [highlighted]="product.isActive">{{product.isActive?'Active':'Inactive'}}</mat-chip></td></ng-container>
      <ng-container matColumnDef="updated"><th mat-header-cell *matHeaderCellDef>Updated</th><td mat-cell *matCellDef="let product">{{date(product.updatedAt)}}</td></ng-container>
      <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let product"><div class="actions">@if(canUpdate()){<button mat-button (click)="edit.emit(product)">Edit</button>}@if(canDelete()){<button mat-button color="warn" (click)="remove.emit(product)">Delete</button>}</div></td></ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
export class ProductTableComponent {
  readonly products = input.required<Product[]>();
  readonly canUpdate = input(false);
  readonly canDelete = input(false);
  readonly edit = output<Product>();
  readonly remove = output<Product>();
  readonly columns = ['name', 'sku', 'price', 'stock', 'status', 'updated', 'actions'];
  readonly money = formatCurrency;
  readonly date = formatDate;
}

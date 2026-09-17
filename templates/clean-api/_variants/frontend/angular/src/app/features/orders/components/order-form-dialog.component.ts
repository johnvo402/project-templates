import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { CreateOrderModel, ProductOption } from '../order.models';

export type OrderFormDialogData = { products: ProductOption[] };

@Component({
  selector: 'app-order-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .customer-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.items-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:8px 0}.items{display:grid;gap:12px}.item{display:grid;grid-template-columns:minmax(0,1fr) 120px auto;gap:8px;align-items:center}.full{width:100%}@media(max-width:599px){.customer-grid,.item{grid-template-columns:1fr}}
  `],
  template: `
    <h2 mat-dialog-title>New order</h2>
    <mat-dialog-content [formGroup]="form">
      <div class="customer-grid">
        <mat-form-field appearance="outline"><mat-label>Customer name</mat-label><input matInput formControlName="customerName"/></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="customerPhone"/></mat-form-field>
      </div>
      <div class="items-heading"><strong>Items</strong><button mat-button type="button" (click)="addItem()">Add item</button></div>
      <div class="items" formArrayName="items">
        @for(item of items.controls;track $index;let i=$index){
          <div class="item" [formGroupName]="i">
            <mat-form-field class="full" appearance="outline"><mat-label>Product</mat-label><mat-select formControlName="productId"><mat-option value="">Select product</mat-option>@for(product of data.products;track product.id){<mat-option [value]="product.id">{{product.name}} · {{money(product.price)}} · {{product.stockQuantity}} in stock</mat-option>}</mat-select></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Quantity</mat-label><input matInput type="number" min="1" formControlName="quantity"/></mat-form-field>
            <button mat-button type="button" [disabled]="items.length===1" (click)="removeItem(i)">Remove</button>
          </div>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button (click)="dialogRef.close()">Cancel</button><button mat-flat-button [disabled]="form.invalid||!hasItem()" (click)="submit()">Create order</button></mat-dialog-actions>
  `,
})
export class OrderFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly data = inject<OrderFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<OrderFormDialogComponent, CreateOrderModel | undefined>);
  readonly money = formatCurrency;
  readonly form = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    customerPhone: [''],
    items: this.fb.array([this.createItem()]),
  });

  get items() { return this.form.controls.items; }
  addItem() { this.items.push(this.createItem()); }
  removeItem(index: number) { if (this.items.length > 1) this.items.removeAt(index); }
  hasItem() { return this.items.controls.some(item => Boolean(item.controls.productId.value) && item.controls.quantity.value > 0); }

  submit() {
    if (this.form.invalid || !this.hasItem()) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      customerName: raw.customerName.trim(),
      customerPhone: raw.customerPhone.trim() || null,
      items: raw.items.filter(item => item.productId).map(item => ({ productId: item.productId, quantity: Math.max(1, Number(item.quantity)) })),
    });
  }

  private createItem() {
    return this.fb.nonNullable.group({ productId: ['', Validators.required], quantity: [1, [Validators.required, Validators.min(1)]] });
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import type { Product, ProductModel } from '../product.models';

export type ProductDialogData = { product: Product | null };

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-width:min(560px,calc(100vw - 64px))}.toggle{padding-top:8px}@media(max-width:599px){.grid{grid-template-columns:1fr;min-width:0}}
  `],
  template: `
    <h2 mat-dialog-title>{{data.product ? 'Edit product' : 'New product'}}</h2>
    <mat-dialog-content>
      <form class="grid" [formGroup]="form">
        <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name"/></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>SKU</mat-label><input matInput formControlName="sku" (input)="uppercaseSku()"/></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Price</mat-label><input matInput type="number" min="0" step="0.01" formControlName="price"/></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Stock quantity</mat-label><input matInput type="number" min="0" formControlName="stockQuantity"/></mat-form-field>
        <mat-slide-toggle class="toggle" formControlName="isActive">Active</mat-slide-toggle>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button [disabled]="form.invalid" (click)="save()">{{data.product ? 'Save changes' : 'Create product'}}</button></mat-dialog-actions>
  `,
})
export class ProductFormDialogComponent {
  readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent, ProductModel>);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: [this.data.product?.name ?? '', Validators.required],
    sku: [this.data.product?.sku ?? '', Validators.required],
    price: [this.data.product?.price ?? 0, [Validators.required, Validators.min(0)]],
    stockQuantity: [this.data.product?.stockQuantity ?? 0, [Validators.required, Validators.min(0)]],
    isActive: [this.data.product?.isActive ?? true],
  });

  uppercaseSku() { this.form.controls.sku.setValue(this.form.controls.sku.value.toUpperCase(), { emitEvent: false }); }
  save() { if (this.form.valid) this.dialogRef.close({ ...this.form.getRawValue(), name: this.form.controls.name.value.trim(), sku: this.form.controls.sku.value.trim() }); }
}

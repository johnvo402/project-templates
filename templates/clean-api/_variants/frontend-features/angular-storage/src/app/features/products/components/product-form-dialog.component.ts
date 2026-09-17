import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import type { Product, ProductModel } from '../product.models';

const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export type ProductDialogData = { product: Product | null };
export type ProductDialogResult = { model: ProductModel; image: File | null };

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;min-width:min(560px,calc(100vw - 64px))}.toggle{padding-top:8px}.image-field{grid-column:1/-1;display:flex;flex-direction:column;align-items:flex-start;gap:6px}.image-field input{max-width:100%}.hint{color:var(--mat-sys-on-surface-variant)}.error{color:var(--mat-sys-error)}@media(max-width:599px){.grid{grid-template-columns:1fr;min-width:0}}
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
        <div class="image-field">
          <label for="product-image">Product image</label>
          <input id="product-image" type="file" accept="image/jpeg,image/png,image/webp" (change)="selectImage($event)"/>
          <small class="hint">{{image?.name || (data.product ? 'Leave empty to keep the current image.' : 'Optional. JPEG, PNG, or WebP up to 5 MB.')}}</small>
          @if(imageError){<small class="error">{{imageError}}</small>}
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button [disabled]="form.invalid || !!imageError" (click)="save()">{{data.product ? 'Save changes' : 'Create product'}}</button></mat-dialog-actions>
  `,
})
export class ProductFormDialogComponent {
  readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent, ProductDialogResult>);
  private readonly fb = inject(FormBuilder);
  image: File | null = null;
  imageError = '';
  readonly form = this.fb.nonNullable.group({
    name: [this.data.product?.name ?? '', Validators.required],
    sku: [this.data.product?.sku ?? '', Validators.required],
    price: [this.data.product?.price ?? 0, [Validators.required, Validators.min(0)]],
    stockQuantity: [this.data.product?.stockQuantity ?? 0, [Validators.required, Validators.min(0)]],
    isActive: [this.data.product?.isActive ?? true],
  });

  uppercaseSku() { this.form.controls.sku.setValue(this.form.controls.sku.value.toUpperCase(), { emitEvent: false }); }

  selectImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) { this.image = null; this.imageError = ''; return; }
    if (!allowedImageTypes.has(file.type)) {
      this.image = null;
      this.imageError = 'Choose a JPEG, PNG, or WebP image.';
      input.value = '';
      return;
    }
    if (file.size > maxImageBytes) {
      this.image = null;
      this.imageError = 'Product image must be 5 MB or smaller.';
      input.value = '';
      return;
    }
    this.image = file;
    this.imageError = '';
  }

  save() {
    if (!this.form.valid || this.imageError) return;
    this.dialogRef.close({
      model: { ...this.form.getRawValue(), name: this.form.controls.name.value.trim(), sku: this.form.controls.sku.value.trim() },
      image: this.image,
    });
  }
}

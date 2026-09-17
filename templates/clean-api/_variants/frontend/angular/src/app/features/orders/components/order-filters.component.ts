import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { OrderFilterState } from '../order.models';

@Component({
  selector: 'app-order-filters',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block;margin-bottom:16px}.filters{padding:16px;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;background:var(--mat-sys-surface)}.grid{display:grid;grid-template-columns:minmax(240px,2fr) repeat(3,minmax(150px,1fr));gap:12px}.actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hint{color:var(--mat-sys-on-surface-variant);font-size:12px}@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:599px){.grid{grid-template-columns:1fr}}
  `],
  template: `
    <form class="filters" [formGroup]="form" (ngSubmit)="submit()">
      <div class="grid">
        <mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput formControlName="keyword" placeholder="Order, customer or phone"/></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Sort</mat-label><mat-select formControlName="sort"><mat-option value="">Default</mat-option><mat-option value="CreatedAt:desc">Newest first</mat-option><mat-option value="CreatedAt:asc">Oldest first</mat-option><mat-option value="TotalAmount:desc">Highest total</mat-option><mat-option value="TotalAmount:asc">Lowest total</mat-option><mat-option value="OrderNumber:asc">Order number</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select formControlName="status"><mat-option value="">All</mat-option><mat-option value="Pending">Pending</mat-option><mat-option value="Processing">Processing</mat-option><mat-option value="Completed">Completed</mat-option><mat-option value="Cancelled">Cancelled</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Total ≥</mat-label><input matInput type="number" min="0" step="0.01" formControlName="minTotal"/></mat-form-field>
      </div>
      <div class="actions"><button mat-flat-button type="submit">Apply</button><button mat-button type="button" (click)="clear()">Clear</button><span class="hint">LHS filters are applied before pagination.</span></div>
    </form>
  `,
})
export class OrderFiltersComponent {
  readonly applyFilters = output<OrderFilterState>();
  readonly clearFilters = output<void>();
  readonly form = new FormGroup({
    keyword: new FormControl('', { nonNullable: true }),
    sort: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
    minTotal: new FormControl('', { nonNullable: true }),
  });

  submit() { this.applyFilters.emit(this.form.getRawValue()); }
  clear() { this.form.reset({ keyword: '', sort: '', status: '', minTotal: '' }); this.clearFilters.emit(); }
}

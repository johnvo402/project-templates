import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EMPLOYEE_ROLES, type EmployeeFilterState } from '../employee.models';

@Component({
  selector: 'app-employee-filters',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block;margin-bottom:16px}.filters{padding:16px;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;background:var(--mat-sys-surface)}.grid{display:grid;grid-template-columns:minmax(240px,2fr) repeat(3,minmax(150px,1fr));gap:12px}.actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hint{color:var(--mat-sys-on-surface-variant);font-size:12px}@media(max-width:900px){.grid{grid-template-columns:1fr 1fr}}@media(max-width:599px){.grid{grid-template-columns:1fr}}
  `],
  template: `
    <form class="filters" [formGroup]="form" (ngSubmit)="submit()">
      <div class="grid">
        <mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput formControlName="keyword" placeholder="Name, email or role"/></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Sort</mat-label><mat-select formControlName="sort"><mat-option value="">Default</mat-option><mat-option value="CreatedAt:desc">Newest first</mat-option><mat-option value="DisplayName:asc">Name A–Z</mat-option><mat-option value="Email:asc">Email A–Z</mat-option><mat-option value="Role:asc">Role</mat-option></mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Role</mat-label><mat-select formControlName="role"><mat-option value="">All</mat-option>@for(role of roles;track role){<mat-option [value]="role">{{role}}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Status</mat-label><mat-select formControlName="status"><mat-option value="">All</mat-option><mat-option value="true">Active</mat-option><mat-option value="false">Disabled</mat-option></mat-select></mat-form-field>
      </div>
      <div class="actions"><button mat-flat-button type="submit">Apply</button><button mat-button type="button" (click)="clear()">Clear</button><span class="hint">LHS filters are applied before pagination.</span></div>
    </form>
  `,
})
export class EmployeeFiltersComponent {
  readonly applyFilters = output<EmployeeFilterState>();
  readonly clearFilters = output<void>();
  readonly roles = EMPLOYEE_ROLES;
  readonly form = new FormGroup({
    keyword: new FormControl('', { nonNullable: true }),
    sort: new FormControl('', { nonNullable: true }),
    role: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
  });

  submit() { this.applyFilters.emit(this.form.getRawValue()); }
  clear() { this.form.reset({ keyword: '', sort: '', role: '', status: '' }); this.clearFilters.emit(); }
}

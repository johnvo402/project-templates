import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import type { PaginationResponse } from '../../../core/api/api.models';
import { AuthSessionService } from '../../../core/auth/auth-session.service';
import { AsyncStateComponent } from '../../../shared/components/async-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { NotificationService } from '../../../shared/feedback/notification.service';
import { FILTER_ENABLED, type BusinessListQuery, type ListFilter } from '../../../shared/query/business-query';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { EmployeeFiltersComponent } from '../components/employee-filters.component';
import { EmployeeFormDialogComponent } from '../components/employee-form-dialog.component';
import { EmployeeTableComponent } from '../components/employee-table.component';
import { EmployeesApiService } from '../data-access/employees-api.service';
import type { CreateEmployeeModel, Employee, EmployeeFilterState, EmployeeRole } from '../employee.models';

@Component({
  selector: 'app-employees-page',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, PageHeaderComponent, AsyncStateComponent, EmployeeFiltersComponent, EmployeeTableComponent],
  styles: [`
    :host{display:block}.pager{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:16px;padding:12px 16px;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;background:var(--mat-sys-surface)}.pager-actions{display:flex;align-items:center;gap:8px}.page-size{width:100px;margin-bottom:-20px}@media(max-width:599px){.pager{align-items:stretch;flex-direction:column}.pager-actions{justify-content:space-between}}
  `],
  template: `
    <app-page-header eyebrow="Management" title="Employees" description="Team access, roles and account status.">
      <div pageActions><button mat-stroked-button (click)="load()" [disabled]="loading()">Refresh</button>@if(auth.can('employees.create')){<button mat-flat-button (click)="openForm()">Add employee</button>}</div>
    </app-page-header>

    @if(filterEnabled){<app-employee-filters (applyFilters)="applyFilters($event)" (clearFilters)="clearFilters()"/>}

    <app-async-state [loading]="loading()" [error]="error()" [empty]="!loading()&&!error()&&(page()?.data?.length??0)===0" [showRetry]="true" emptyTitle="No employees yet" emptyMessage="Add your first employee or adjust the current filters." (retry)="load()"/>

    @if(page(); as result){
      @if(result.data.length){
        <app-employee-table [employees]="result.data" [canUpdate]="auth.can('employees.update')" [canChangeRole]="auth.can('employees.change-role')" (roleChange)="changeRole($event.employee,$event.role)" (statusToggle)="toggleStatus($event)"/>
        @if(result.paging){<section class="pager"><span>{{result.paging.totalPage ? 'Page '+(result.paging.currentPage ?? query.page)+' of '+result.paging.totalPage : 'No results'}}</span><div class="pager-actions"><mat-form-field class="page-size" appearance="outline"><mat-label>Rows</mat-label><mat-select [value]="query.pageSize" (selectionChange)="changePageSize($event.value)">@for(size of pageSizes;track size){<mat-option [value]="size">{{size}}</mat-option>}</mat-select></mat-form-field><button mat-button [disabled]="!result.paging.hasPreviousPage" (click)="changePage(Math.max(1,(result.paging.currentPage ?? query.page)-1))">Prev</button><button mat-button [disabled]="!result.paging.hasNextPage" (click)="changePage((result.paging.currentPage ?? query.page)+1)">Next</button></div></section>}
      }
    }
  `,
})
export class EmployeesPage implements OnInit {
  readonly auth = inject(AuthSessionService);
  readonly filterEnabled = FILTER_ENABLED;
  readonly pageSizes = [10, 20, 50, 100];
  readonly Math = Math;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly page = signal<PaginationResponse<Employee> | null>(null);
  query: BusinessListQuery = { page: 1, pageSize: 20 };

  private readonly api = inject(EmployeesApiService);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  ngOnInit() { void this.load(); }

  async load() {
    this.loading.set(true); this.error.set(null);
    try { this.page.set(await firstValueFrom(this.api.list(this.query))); }
    catch (error) { this.error.set(getErrorMessage(error)); }
    finally { this.loading.set(false); }
  }

  applyFilters(filters: EmployeeFilterState) {
    const lhs: ListFilter[] = [];
    if (filters.role) lhs.push({ field: 'Role', operator: '$eqi', value: filters.role });
    if (filters.status) lhs.push({ field: 'IsActive', operator: '$eq', value: filters.status === 'true' });
    this.query = { ...this.query, page: 1, keyword: filters.keyword.trim() || undefined, targets: ['DisplayName', 'Email', 'Role'], sort: filters.sort || undefined, filters: lhs };
    void this.load();
  }

  clearFilters() { this.query = { page: 1, pageSize: this.query.pageSize }; void this.load(); }
  changePage(page: number) { this.query = { ...this.query, page }; void this.load(); }
  changePageSize(pageSize: number) { this.query = { ...this.query, page: 1, pageSize }; void this.load(); }

  async openForm() {
    const model = await firstValueFrom(this.dialog.open(EmployeeFormDialogComponent, { width: '560px', maxWidth: 'calc(100vw - 32px)', autoFocus: false }).afterClosed()) as CreateEmployeeModel | undefined;
    if (!model) return;
    try { await firstValueFrom(this.api.create(model)); this.notifications.success('Employee created.'); await this.load(); }
    catch (error) { this.notifications.error(getErrorMessage(error)); }
  }

  async changeRole(employee: Employee, role: EmployeeRole) {
    if (role === employee.role) return;
    try { await firstValueFrom(this.api.changeRole(employee.id, role)); this.notifications.success(`${employee.displayName}'s role updated.`); await this.load(); }
    catch (error) { this.notifications.error(getErrorMessage(error)); }
  }

  async toggleStatus(employee: Employee) {
    const next = !employee.isActive;
    try { await firstValueFrom(this.api.setStatus(employee.id, next)); this.notifications.success(`${employee.displayName} ${next ? 'enabled' : 'disabled'}.`); await this.load(); }
    catch (error) { this.notifications.error(getErrorMessage(error)); }
  }
}

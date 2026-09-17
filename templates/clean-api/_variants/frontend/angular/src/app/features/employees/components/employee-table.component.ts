import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { formatDate } from '../../../utils/formatters';
import { EMPLOYEE_ROLES, type Employee, type EmployeeRole } from '../employee.models';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host{display:block;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;overflow:auto;background:var(--mat-sys-surface)}table{width:100%;min-width:880px}.person{display:flex;align-items:center;gap:10px}.avatar{width:34px;height:34px;border-radius:50%;object-fit:cover;background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container);display:grid;place-items:center;font-weight:700}.role-field{width:130px;margin-bottom:-20px}
  `],
  template: `
    <table mat-table [dataSource]="employees()">
      <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let employee"><span class="person">@if(employee.avatarUrl){<img class="avatar" [src]="employee.avatarUrl" alt=""/>}@else{<span class="avatar">{{employee.displayName.slice(0,1).toUpperCase()}}</span>}<strong>{{employee.displayName}}</strong></span></td></ng-container>
      <ng-container matColumnDef="email"><th mat-header-cell *matHeaderCellDef>Email</th><td mat-cell *matCellDef="let employee">{{employee.email}}</td></ng-container>
      <ng-container matColumnDef="role"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let employee">@if(canChangeRole()){<mat-form-field class="role-field" appearance="outline"><mat-select [value]="employee.role" (selectionChange)="roleChange.emit({employee,role:$event.value})">@for(role of roles;track role){<mat-option [value]="role">{{role}}</mat-option>}</mat-select></mat-form-field>}@else{<mat-chip>{{employee.role}}</mat-chip>}</td></ng-container>
      <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let employee"><mat-chip [highlighted]="employee.isActive">{{employee.isActive?'Active':'Disabled'}}</mat-chip></td></ng-container>
      <ng-container matColumnDef="joined"><th mat-header-cell *matHeaderCellDef>Joined</th><td mat-cell *matCellDef="let employee">{{date(employee.createdAt)}}</td></ng-container>
      <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th><td mat-cell *matCellDef="let employee">@if(canUpdate()){<button mat-button [color]="employee.isActive?'warn':'primary'" (click)="statusToggle.emit(employee)">{{employee.isActive?'Disable':'Enable'}}</button>}</td></ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr><tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
export class EmployeeTableComponent {
  readonly employees = input.required<Employee[]>();
  readonly canUpdate = input(false);
  readonly canChangeRole = input(false);
  readonly roleChange = output<{ employee: Employee; role: EmployeeRole }>();
  readonly statusToggle = output<Employee>();
  readonly columns = ['employee', 'email', 'role', 'status', 'joined', 'actions'];
  readonly roles = EMPLOYEE_ROLES;
  readonly date = formatDate;
}

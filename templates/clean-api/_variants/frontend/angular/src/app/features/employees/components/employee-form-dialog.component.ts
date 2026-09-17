import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { EMPLOYEE_ROLES, type CreateEmployeeModel, type EmployeeRole } from '../employee.models';

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>Add employee</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline"><mat-label>Display name</mat-label><input matInput formControlName="displayName"/><mat-error>Display name is required.</mat-error></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput type="email" formControlName="email"/><mat-error>Enter a valid email address.</mat-error></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Temporary password</mat-label><input matInput type="password" autocomplete="new-password" formControlName="password"/><mat-error>Password is required.</mat-error></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Role</mat-label><mat-select formControlName="role">@for(role of roles;track role){<mat-option [value]="role">{{role}}</mat-option>}</mat-select></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end"><button mat-button (click)="dialogRef.close()">Cancel</button><button mat-flat-button [disabled]="form.invalid" (click)="submit()">Create employee</button></mat-dialog-actions>
  `,
  styles: [`.form{display:grid;gap:8px;min-width:0;padding-top:8px}`],
})
export class EmployeeFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EmployeeFormDialogComponent, CreateEmployeeModel | undefined>);
  readonly roles = EMPLOYEE_ROLES;
  readonly form = new FormGroup({
    displayName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    role: new FormControl<EmployeeRole>('Staff', { nonNullable: true }),
  });

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.dialogRef.close({ ...value, displayName: value.displayName.trim(), email: value.email.trim() });
  }
}

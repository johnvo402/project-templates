import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

type NotificationKind = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  show(message: string, kind: NotificationKind = 'info') {
    this.snackBar.open(message, 'Dismiss', {
      duration: kind === 'error' ? 6_000 : 4_000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`notification-${kind}`],
    });
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
}

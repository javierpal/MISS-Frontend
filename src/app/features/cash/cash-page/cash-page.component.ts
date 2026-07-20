import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CashOpenDialog } from '../cash-open-dialog/cash-open-dialog.component';
import { CashCurrentDialog } from '../cash-current-dialog/cash-current-dialog.component';
import { CashMovementsDialog } from '../cash-movements-dialog/cash-movements-dialog.component';
import { CashCloseDialog } from '../cash-close-dialog/cash-close-dialog.component';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-cash-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './cash-page.html',
  styleUrl: './cash-page.scss',
})
export class CashPage {
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  onOpenCash(): void {
    this.dialog.open(CashOpenDialog, {
      width: '600px',
      maxWidth: '95vw',
    });
  }

  onOpenCashCurrent(): void {
    this.dialog.open(CashCurrentDialog, {
      width: '600px',
      maxWidth: '100vw',
      data: {},
    });
  }

  onRegisterMovement(): void {
    this.dialog.open(CashMovementsDialog, {
      width: '550px',
      maxWidth: '100vw',
    });
  }

  onGoToClose(): void {
    this.dialog.open(CashCloseDialog, {
      width: '550px',
      maxWidth: '100vw',
    });
  }

  onViewReport(): void {
    this.snackBar.open('Ver reporte - Próximamente', 'Cerrar', { duration: 3000 });
  }
}

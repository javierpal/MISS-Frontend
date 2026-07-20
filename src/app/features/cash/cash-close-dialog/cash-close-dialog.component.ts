import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CashApiService } from '../../../core/services/cash.api.service';
import { CloseCashDto, CashCurrentResponse } from '../../../core/models/cash.model';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-cash-close-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './cash-close-dialog.html',
  styleUrl: './cash-close-dialog.scss',
})
export class CashCloseDialog {
  private fb = inject(FormBuilder);
  private cashApi = inject(CashApiService);
  private snackBar = inject(MatSnackBar);
  private confirmDialog = inject(ConfirmDialogService);
  private dialogRef = inject(MatDialogRef<CashCloseDialog>);

  form: FormGroup;
  submitting = false;
  currentSession: CashCurrentResponse | null = null;

  constructor() {
    this.form = this.fb.group({
      actualFunds: [null, [Validators.required, Validators.min(0)]],
    });

    this.loadCurrentSession();
  }

  get actualFundsControl() {
    return this.form.get('actualFunds');
  }

  get openedAt(): string | undefined {
    return this.currentSession?.session?.openedAt;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getDifference(): number {
    const actual = this.actualFundsControl?.value || 0;
    const expected = this.currentSession?.summary?.expectedAmount || 0;
    return actual - expected;
  }

  getDifferenceClass(): string {
    const diff = this.getDifference();
    if (diff > 0) {
      return 'cash-close-dialog__difference--surplus';
    } else if (diff < 0) {
      return 'cash-close-dialog__difference--deficit';
    }
    return 'cash-close-dialog__difference--balanced';
  }

  getDifferenceLabel(): string {
    const diff = this.getDifference();
    if (diff > 0) {
      return `Excedente de ${this.formatCurrency(diff)}`;
    } else if (diff < 0) {
      return `Déficit de ${this.formatCurrency(Math.abs(diff))}`;
    }
    return 'Todo en orden';
  }

  private loadCurrentSession(): void {
    this.cashApi.getCurrent().subscribe({
      next: (data) => {
        this.currentSession = data;
      },
      error: (err) => {
        console.warn('API current session failed:', err);
        // Mock data for development
        this.currentSession = {
          session: {
            id: 'session-mock-001',
            status: 'OPEN',
            userId: 'user-123',
            userName: 'Usuario Actual',
            openedAt: new Date().toISOString(),
            openingAmount: 1000,
          },
          summary: {
            sessionId: 'session-mock-001',
            status: 'OPEN',
            openedAt: new Date().toISOString(),
            openingAmount: 1000,
            cashSalesTotal: 2000,
            totalSales: 4000,
            manualInTotal: 500,
            manualOutTotal: 200,
            automaticSalesMovementTotal: 1500,
            expectedAmount: 5000,
            salesCount: 10,
            cashPaymentsCount: 7,
            manualMovementsCount: 3,
          },
        };
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const diff = this.getDifference();

    // Warning crítico antes de confirmar
    const warningMessage =
      diff !== 0
        ? `⚠️ DIFERENCIA DETECTADA: ${this.getDifferenceLabel()}\n\n`
        : '';

    const confirmed = await this.confirmDialog.open({
      title: 'Confirmar cierre de caja',
      message: `${warningMessage}¿Confirmar cierre de caja?

Fondo esperado: ${this.formatCurrency(this.currentSession?.summary?.expectedAmount || 0)}
Fondo real contado: ${this.formatCurrency(value.actualFunds)}
Diferencia: ${this.formatCurrency(diff)}

${diff !== 0 ? '⚠️ Revisa el conteo antes de confirmar.' : ''}`,
      confirmText: 'Cerrar Caja',
      cancelText: 'Cancelar',
      showCancel: true,
      type: diff !== 0 ? 'danger' : 'warning',
    });

    if (!confirmed) {
      return;
    }

    const payload: CloseCashDto = {
      closingAmount: value.actualFunds,
    };

    this.submitting = true;

    this.cashApi.close(payload).subscribe({
      next: (data) => {
        this.submitting = false;
        this.snackBar.open('Caja cerrada exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error closing cash:', err);
        this.snackBar.open(
          `Error al cerrar caja: ${err.error?.message || 'Error desconocido'}`,
          'Cerrar',
          { duration: 5000 }
        );
        // No close dialog on error - let user retry or cancel
      },
    });
  }
}

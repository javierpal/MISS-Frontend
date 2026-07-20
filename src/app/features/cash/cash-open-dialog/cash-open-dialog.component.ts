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
import { OpenCashDto } from '../../../core/models/cash.model';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-cash-open-dialog',
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
  templateUrl: './cash-open-dialog.html',
  styleUrl: './cash-open-dialog.scss',
})
export class CashOpenDialog {
  private fb = inject(FormBuilder);
  private cashApi = inject(CashApiService);
  private snackBar = inject(MatSnackBar);
  private confirmDialog = inject(ConfirmDialogService);
  private dialogRef = inject(MatDialogRef<CashOpenDialog>);

  form: FormGroup;
  submitting = false;
  openedAt = new Date();

  constructor() {
    this.form = this.fb.group({
      initialFunds: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get initialFundsControl() {
    return this.form.get('initialFunds');
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
    const amount = value.initialFunds;

    // Confirmación antes de acción crítica
    const confirmed = await this.confirmDialog.open({
      title: 'Confirmar apertura de caja',
      message: `¿Confirmar apertura de caja con fondo inicial de ${this.formatCurrency(amount)}?\n\nEste valor no podrá modificarse después de abrir.`,
      confirmText: 'Abrir Caja',
      cancelText: 'Cancelar',
      showCancel: true,
      type: 'warning',
    });

    if (!confirmed) {
      return;
    }

    const payload: OpenCashDto = {
      openingAmount: amount,
    };

    this.submitting = true;

    this.cashApi.open(payload).subscribe({
      next: (data) => {
        this.submitting = false;
        this.snackBar.open('Caja abierta exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error opening cash:', err);
        this.snackBar.open(
          `Error al abrir caja: ${err.error?.message || 'Error desconocido'}`,
          'Cerrar',
          { duration: 5000 }
        );
      },
    });
  }
}

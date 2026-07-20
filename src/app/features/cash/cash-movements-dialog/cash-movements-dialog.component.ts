import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CashApiService } from '../../../core/services/cash.api.service';
import { CreateMovementDto, MovementType, CashCurrentResponse } from '../../../core/models/cash.model';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-cash-movements-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './cash-movements-dialog.html',
  styleUrl: './cash-movements-dialog.scss',
})
export class CashMovementsDialog {
  private fb = inject(FormBuilder);
  private cashApi = inject(CashApiService);
  private snackBar = inject(MatSnackBar);
  private confirmDialog = inject(ConfirmDialogService);
  private dialogRef = inject(MatDialogRef<CashMovementsDialog>);

  form: FormGroup;
  submitting = false;
  currentSession: CashCurrentResponse | null = null;

  get sessionOpenedAt(): string | undefined {
    return this.currentSession?.session?.openedAt;
  }

  movementTypes: { value: MovementType; label: string; icon: string }[] = [
    { value: 'IN', label: 'Entrada', icon: 'arrow_downward' },
    { value: 'OUT', label: 'Salida', icon: 'arrow_upward' },
  ];

  constructor() {
    this.form = this.fb.group({
      type: ['IN', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', [Validators.required, Validators.minLength(3)]],
      reference: [''],
    });

    this.loadCurrentSession();
  }

  get amountControl() {
    return this.form.get('amount');
  }

  get typeControl() {
    return this.form.get('type');
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

  getMovementIcon(type: MovementType): string {
    return this.movementTypes.find((t) => t.value === type)?.icon || 'swap_horiz';
  }

  getMovementLabel(type: MovementType): string {
    return this.movementTypes.find((t) => t.value === type)?.label || type;
  }

  getMovementClass(type: MovementType): string {
    const classes: Partial<Record<MovementType, string>> = {
      IN: 'cash-movements-dialog__type-badge--in',
      OUT: 'cash-movements-dialog__type-badge--out',
    };
    return classes[type] || '';
  }

  getSignedAmount(): number {
    const amount = this.amountControl?.value || 0;
    const type = this.typeControl?.value as MovementType;
    return type === 'IN' ? amount : -amount;
  }

  getProjectedExpectedFunds(): number {
    const current = this.currentSession?.summary?.expectedFunds || 0;
    return current + this.getSignedAmount();
  }

  getImpactLabel(): string {
    const signed = this.getSignedAmount();
    if (signed >= 0) {
      return `Fondo esperado aumenta en ${this.formatCurrency(signed)}`;
    }
    return `Fondo esperado disminuye en ${this.formatCurrency(Math.abs(signed))}`;
  }

  getImpactClass(): string {
    return this.getSignedAmount() >= 0
      ? 'cash-movements-dialog__impact--positive'
      : 'cash-movements-dialog__impact--negative';
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
            initialFunds: 1000,
            expectedFunds: 5000,
            totalSales: 4000,
            totalMovements: 0,
            movementsCount: 0,
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

    // Confirmación antes de acción crítica
    const confirmed = await this.confirmDialog.open({
      title: 'Confirmar movimiento',
      message: `¿Confirmar movimiento ${this.getMovementLabel(value.type)} por ${this.formatCurrency(value.amount)}?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      showCancel: true,
      type: 'info',
    });

    if (!confirmed) {
      return;
    }

    const payload: CreateMovementDto = {
      type: value.type,
      amount: value.amount,
      reason: value.reason,
      referenceType: 'MANUAL',
      referenceId: value.reference || undefined,
    };

    this.submitting = true;

    this.cashApi.createMovement(payload).subscribe({
      next: (data) => {
        this.submitting = false;
        this.snackBar.open('Movimiento registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating movement:', err);
        this.snackBar.open(
          `Error al registrar movimiento: ${err.error?.message || 'Error desconocido'}`,
          'Cerrar',
          { duration: 5000 }
        );
        // No close dialog on error - let user retry
      },
    });
  }
}

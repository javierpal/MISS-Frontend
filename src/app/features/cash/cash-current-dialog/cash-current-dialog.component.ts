import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CashApiService } from '../../../core/services/cash.api.service';
import { CashCurrentResponse, CashMovement } from '../../../core/models/cash.model';
import { CashOpenDialog } from '../cash-open-dialog/cash-open-dialog.component';

interface SummaryCard {
  label: string;
  value: number;
  icon: string;
}

interface MockData {
  current: CashCurrentResponse;
  movements: CashMovement[];
}

@Component({
  selector: 'app-cash-current-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './cash-current-dialog.html',
  styleUrl: './cash-current-dialog.scss',
})
export class CashCurrentDialog implements OnInit {
  private cashApi = inject(CashApiService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<CashCurrentDialog>);
  private dialog = inject(MatDialog);

  current: CashCurrentResponse | null = null;
  recentMovements: CashMovement[] = [];
  loading = true;

  summaryCards: SummaryCard[] = [];

  // Mock data structure
  private mockData: MockData = {
    current: {
      session: {
        id: 'mock-session-001',
        status: 'OPEN',
        userId: 'user-current',
        userName: 'Usuario Actual',
        openedAt: new Date().toISOString(),
        openingAmount: 1500,
      },
      summary: {
        sessionId: 'mock-session-001',
        status: 'OPEN',
        openedAt: new Date().toISOString(),
        openingAmount: 1500,
        cashSalesTotal: 800,
        totalSales: 1250.50,
        manualInTotal: 500,
        manualOutTotal: 100,
        automaticSalesMovementTotal: 450.50,
        expectedAmount: 2750.50,
        difference: -10.50,
        salesCount: 3,
        cashPaymentsCount: 2,
        manualMovementsCount: 2,
      },
    },
    movements: [
      { id: 'mov-1', type: 'SALE', amount: 250.50, reason: 'Venta POS', reference: 'VENTA-001', createdAt: new Date().toISOString() },
      { id: 'mov-2', type: 'IN', amount: 500, reason: 'Depósito inicial', reference: 'DEP-001', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'mov-3', type: 'OUT', amount: 100, reason: 'Gasto operativo', reference: 'GAST-001', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'mov-4', type: 'SALE', amount: 180, reason: 'Venta ventanilla', reference: 'VENTA-002', createdAt: new Date(Date.now() - 10800000).toISOString() },
      { id: 'mov-5', type: 'ADJUSTMENT', amount: 25.50, reason: 'Ajuste por redondeo', reference: 'AJUSTE-001', createdAt: new Date(Date.now() - 14400000).toISOString() },
    ],
  };

  ngOnInit(): void {
    this.loadCashData();
  }

  private loadCashData(): void {
    this.loading = true;

    // Try API first, fallback to mock
    this.cashApi.getCurrent().subscribe({
      next: (data) => {
        this.current = data;
        // Si no hay sesión abierta, mostrar estado vacío
        if (!data.session) {
          this.loading = false;
          return;
        }
        // Si hay sesión, construir cards
        this.buildSummaryCards();
        this.loading = false;
      },
      error: (err) => {
        console.warn('API current cash failed, using mock:', err);
        // Mock data tiene sesión, usarlo
        this.current = this.mockData.current;
        this.buildSummaryCards();
        this.loading = false;
      },
    });
  }

  private buildSummaryCards(): void {
    if (!this.current?.session) return;

    const session = this.current.session;
    const summary = this.current.summary as any || {};

    // Usar manualMovementsCount del backend (no hay lista real de movimientos)
    const movementsCount = summary.manualMovementsCount || 0;

    this.summaryCards = [
      { label: 'Fondo inicial', value: session.openingAmount, icon: 'account_balance_wallet' },
      { label: 'Ventas', value: summary.totalSales || 0, icon: 'trending_up' },
      { label: 'Total esperado', value: summary.expectedAmount || 0, icon: 'show_chart' },
      { label: 'Efectivo', value: 0, icon: 'payments' },
      { label: 'Tarjeta', value: 0, icon: 'credit_card' },
      { label: 'Movimientos', value: movementsCount, icon: 'swap_horiz' },
    ];
  }

  get difference(): number | undefined {
    return this.current?.summary?.difference;
  }

  get hasSession(): boolean {
    return this.current?.session !== null && this.current?.session !== undefined;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN': return 'Abierta';
      case 'CLOSED': return 'Cerrada';
      case 'LOCKED': return 'Bloqueada';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return `cash-current-dialog__status--${status.toLowerCase()}`;
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'IN': return 'add_circle';
      case 'OUT': return 'remove_circle';
      case 'SALE': return 'shopping_cart';
      case 'ADJUSTMENT': return 'edit';
      default: return 'help';
    }
  }

  getTypeClass(type: string): string {
    return `cash-current-dialog__type-badge--${type.toLowerCase()}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Action handlers (stubs for dialogs)
  onRegisterMovement(): void {
    this.snackBar.open('Registrar movimiento - Próximamente', 'Cerrar', { duration: 3000 });
  }

  onGoToClose(): void {
    // Cerrar current dialog y abrir open dialog
    this.dialogRef.close();
    this.dialog.open(CashOpenDialog, {
      width: '400px',
      maxHeight: '90vh',
    });
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}

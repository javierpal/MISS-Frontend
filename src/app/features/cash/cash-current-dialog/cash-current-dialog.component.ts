import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { CashApiService } from '../../../core/services/cash.api.service';
import { CashCurrentResponse, CashMovement } from '../../../core/models/cash.model';
import { CashOpenDialog } from '../cash-open-dialog/cash-open-dialog.component';
import { CashCloseDialog } from '../cash-close-dialog/cash-close-dialog.component';

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
  private cdr = inject(ChangeDetectorRef);

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
    this.cashApi.getCurrent().pipe(
      finalize(() => {
        this.finishLoading();
      })
    ).subscribe({
      next: (data) => {
        // Normalizar respuesta: aceptar campos null/ausentes
        this.current = this.normalizeCurrentResponse(data);

        // Si no hay sesión abierta, mostrar estado vacío
        if (!this.current?.session) {
          return;
        }

        // Si hay sesión, construir cards (nunca debe lanzar excepción)
        try {
          this.buildSummaryCards();
        } catch (err) {
          console.error('Error building summary cards:', err);
          this.summaryCards = [];
        }
      },
      error: (err) => {
        console.warn('API current cash failed, using mock:', err);
        // Mock data tiene sesión válida, usarlo como fallback
        this.current = this.normalizeCurrentResponse(this.mockData.current);
        try {
          this.buildSummaryCards();
        } catch (err) {
          console.error('Error building summary cards from mock:', err);
          this.summaryCards = [];
        }
      },
    });
  }

  private normalizeCurrentResponse(data: any): CashCurrentResponse | null {
    // Normalizar respuesta: aceptar campos null/ausentes
    if (!data) return null;

    // Si hay session pero no summary, crear summary vacío con campos requeridos
    if (data.session && !data.summary) {
      return {
        session: data.session,
        summary: {
          sessionId: data.session.id || '',
          status: data.session.status || 'OPEN',
          openedAt: data.session.openedAt || new Date().toISOString(),
          openingAmount: data.session.openingAmount || 0,
          cashSalesTotal: 0,
          totalSales: 0,
          manualInTotal: 0,
          manualOutTotal: 0,
          automaticSalesMovementTotal: 0,
          expectedAmount: data.session.expectedAmount || 0,
          salesCount: 0,
          cashPaymentsCount: 0,
          manualMovementsCount: 0,
        },
      } as CashCurrentResponse;
    }

    return data as CashCurrentResponse;
  }

  private buildSummaryCards(): void {
    if (!this.current?.session) return;

    const session = this.current.session;
    const summary = this.current.summary as any || {};

    // Cards alineadas con referencia visual
    this.summaryCards = [
      { label: 'Monto esperado', value: summary.expectedAmount || 0, icon: 'show_chart' },
      { label: 'Entradas manuales', value: summary.manualInTotal || 0, icon: 'download' },
      { label: 'Salidas manuales', value: summary.manualOutTotal || 0, icon: 'upload' },
      { label: 'Movimientos manuales', value: summary.manualMovementsCount || 0, icon: 'swap_horiz' },
      { label: 'Ventas en efectivo', value: summary.cashSalesTotal || 0, icon: 'payments' },
      { label: 'Mov. automáticos ventas', value: summary.automaticSalesMovementTotal || 0, icon: 'autorenew' },
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

  getIconClass(index: number): string {
    const classes = [
      'cash-current-dialog__summary-icon--expected',  // 0: Monto esperado (azul claro)
      'cash-current-dialog__summary-icon--in',        // 1: Entradas manuales (azul)
      'cash-current-dialog__summary-icon--out',       // 2: Salidas manuales (rojo claro)
      'cash-current-dialog__summary-icon--movements', // 3: Movimientos manuales (amarillo claro)
      'cash-current-dialog__summary-icon--cash',      // 4: Ventas en efectivo (verde)
      'cash-current-dialog__summary-icon--automatic', // 5: Mov. automáticos ventas (azul claro)
    ];
    return classes[index] || '';
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

  // Action handlers
  private finishLoading(): void {
    // Diferir cambio de estado al siguiente ciclo para evitar ExpressionChangedAfterItHasBeenCheckedError
    queueMicrotask(() => {
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  onOpenCashFromEmpty(): void {
    // Empty state: cerrar current y abrir open dialog
    this.dialogRef.close();
    this.dialog.open(CashOpenDialog, {
      width: '400px',
      maxHeight: '90vh',
    });
  }

  onGoToClose(): void {
    // Footer: cerrar current y abrir close dialog
    this.dialogRef.close();
    this.dialog.open(CashCloseDialog, {
      width: '500px',
      maxHeight: '90vh',
    });
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }
}

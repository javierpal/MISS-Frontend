import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';

import { CashApiService } from '../../../core/services/cash.api.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AdminSessionItem,
  AdminSessionDetailResponse,
  CashMovement,
  AdminSessionsOpenResponse,
} from '../../../core/models/cash.model';
import { CashCurrentDialog, CashCurrentDialogData } from '../../cash/cash-current-dialog/cash-current-dialog.component';

@Component({
  selector: 'app-cash-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
    CashCurrentDialog,
  ],
  templateUrl: './cash-admin-page.html',
  styleUrl: './cash-admin-page.scss',
})
export class CashAdminPage implements OnInit {
  private cashApi = inject(CashApiService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  sessions: AdminSessionItem[] = [];
  selectedSession: AdminSessionDetailResponse | null = null;
  
  // Estados de loading separados
  sessionsLoading = false;
  detailLoading = false;
  movementSubmitting = false;
  
  // Estados de error
  sessionsError: string | null = null;
  detailError: string | null = null;
  
  userRole = '';
  searchQuery = '';

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.userRole = user?.role || '';
    this.loadSessions();
  }

  loadSessions(): void {
    this.sessionsLoading = true;
    this.sessionsError = null;
    
    this.cashApi.adminListOpenSessions({ includeSummary: true }).pipe(
      finalize(() => {
        this.sessionsLoading = false;
      })
    ).subscribe({
      next: (data: AdminSessionsOpenResponse) => {
        this.sessions = data.data || [];
        this.sessionsError = null;
        // Seleccionar primera sesión abierta y cargar detalle
        if (this.sessions.length > 0) {
          const firstOpen = this.sessions.find(s => s.status === 'OPEN') || this.sessions[0];
          if (firstOpen) {
            this.loadSessionDetail(firstOpen.id);
          }
        }
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Error loading admin sessions:', err);
        this.sessionsError = 'Error al cargar sesiones. Intenta de nuevo.';
        this.cdr.markForCheck();
        this.snackBar.open('Error al cargar sesiones', 'Reintentar', { duration: 5000 }).onAction().subscribe(() => {
          this.loadSessions();
        });
      },
    });
  }

  loadSessionDetail(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.detailLoading = true;
      this.detailError = null;
      
      this.cashApi.adminGetSessionDetail(sessionId, {
        includeMovements: true,
        includeSales: true,
        includePayments: true,
      }).pipe(
        finalize(() => {
          this.detailLoading = false;
        })
      ).subscribe({
        next: (data: AdminSessionDetailResponse) => {
          this.selectedSession = data;
          this.detailError = null;
          this.cdr.markForCheck();
          resolve();
        },
        error: (err: unknown) => {
          console.error('Error loading session detail:', err);
          this.detailError = 'Error al cargar detalle. Intenta de nuevo.';
          this.cdr.markForCheck();
          this.snackBar.open('Error al cargar detalle', 'Reintentar', { duration: 5000 }).onAction().subscribe(() => {
            this.loadSessionDetail(sessionId);
          });
          reject(err);
        },
      });
    });
  }

  onViewCashCurrent(session: AdminSessionItem): void {
    // Cargar detalle completo y luego abrir dialog
    this.loadSessionDetail(session.id).then(() => {
      if (this.selectedSession) {
        const dialogData: CashCurrentDialogData = {
          session: this.selectedSession,
          summary: this.selectedSession.summary,
          movements: this.selectedSession.movements,
        };

        this.dialog.open(CashCurrentDialog, {
          width: '600px',
          maxWidth: '100vw',
          data: dialogData,
        });
      }
    });
  }

  onRegisterMovement(): void {
    if (!this.selectedSession) return;
    this.snackBar.open('Registrar movimiento: funcionalidad en desarrollo', 'Cerrar', { duration: 3000 });
  }

  onGoToClose(): void {
    if (!this.selectedSession) return;
    this.snackBar.open('Ir a cierre: funcionalidad en desarrollo', 'Cerrar', { duration: 3000 });
  }

  onViewReport(): void {
    if (!this.selectedSession) return;
    this.snackBar.open('Ver reporte: funcionalidad en desarrollo', 'Cerrar', { duration: 3000 });
  }

  get filteredSessions(): AdminSessionItem[] {
    if (!this.searchQuery) return this.sessions;
    const query = this.searchQuery.toLowerCase();
    return this.sessions.filter(s => 
      s.id.toLowerCase().includes(query) ||
      (s.user?.fullName || '').toLowerCase().includes(query) ||
      s.status.toLowerCase().includes(query)
    );
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

  getStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN': return 'ABIERTA';
      case 'CLOSED': return 'CERRADA';
      case 'LOCKED': return 'BLOQUEADA';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return `cash-admin__status--${status.toLowerCase()}`;
  }

  calculateSalesTotal(): number {
    if (!this.selectedSession?.sales) return 0;
    return this.selectedSession.sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  }

  get recentMovements(): CashMovement[] {
    return this.selectedSession?.movements || [];
  }

  get totalMovements(): number {
    return this.selectedSession?.movements?.length || 0;
  }

  get sessionStartDate(): string {
    return this.selectedSession?.openedAt || '';
  }

  get sessionEndDate(): string {
    return new Date().toISOString();
  }

  get sessionUser(): string {
    return this.selectedSession?.user?.fullName || 'Sin usuario';
  }

  get firstSessionId(): string {
    return this.sessions[0]?.id || '';
  }
}

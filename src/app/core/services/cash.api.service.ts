import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';
import { PageParams, PaginatedResponse } from '../models/pagination.model';
import {
  CashRegister,
  CashMovement,
  OpenCashDto,
  CloseCashDto,
  CreateMovementDto,
  CashReport,
  CashSessionSummary,
  CashCurrentResponse,
  AdminSessionsOpenResponse,
  AdminSessionDetailResponse,
  AdminCreateMovementDto,
} from '../models/cash.model';

/**
 * API service for cash register operations.
 */
@Injectable({ providedIn: 'root' })
export class CashApiService {
  private api = inject(ApiClientService);

  // === Cash Register Operations ===

  /** Get current cash register status */
  getCurrent(): Observable<CashCurrentResponse> {
    return this.api.get<CashCurrentResponse>('cash/current');
  }

  /** Open cash register */
  open(body: OpenCashDto): Observable<CashRegister> {
    return this.api.post<CashRegister>('cash/open', body);
  }

  /** Close cash register */
  close(body: CloseCashDto): Observable<CashRegister> {
    return this.api.post<CashRegister>('cash/close', body);
  }

  // === Movements ===

  /** Register a manual movement */
  createMovement(body: CreateMovementDto): Observable<CashMovement> {
    return this.api.post<CashMovement>('cash/movements', body);
  }

  // === Reports (PENDIENTE: endpoints no existentes en backend) ===

  /** List movements (PENDIENTE backend) */
  listMovements(params?: PageParams): Observable<PaginatedResponse<CashMovement>> {
    throw new Error('GET /cash/movements no existe en backend');
  }

  /** Get cash report (PENDIENTE backend) */
  getReport(params?: { sessionId?: string; date?: string }): Observable<CashReport> {
    throw new Error('GET /cash/report no existe en backend');
  }

  /** Get session summary (PENDIENTE backend) */
  getSessionSummary(sessionId: string): Observable<CashSessionSummary> {
    throw new Error('GET /cash/sessions/:id/summary no existe en backend');
  }

  // === Admin endpoints ===

  /** List open cash sessions (admin) */
  adminListOpenSessions(params?: {
    openedFrom?: string;
    openedTo?: string;
    userId?: string;
    includeSummary?: boolean;
    page?: number;
    limit?: number;
  }): Observable<AdminSessionsOpenResponse> {
    const queryParams: Record<string, string> = {};
    if (params) {
      if (params.openedFrom) queryParams['openedFrom'] = params.openedFrom;
      if (params.openedTo) queryParams['openedTo'] = params.openedTo;
      if (params.userId) queryParams['userId'] = params.userId;
      if (params.includeSummary !== undefined) queryParams['includeSummary'] = String(params.includeSummary);
      if (params.page !== undefined) queryParams['page'] = String(params.page);
      if (params.limit !== undefined) queryParams['limit'] = String(params.limit);
    }
    return this.api.get<AdminSessionsOpenResponse>('cash/admin/sessions/open', queryParams);
  }

  /** Get session detail (admin) */
  adminGetSessionDetail(sessionId: string, params?: {
    includeMovements?: boolean;
    includeSales?: boolean;
    includePayments?: boolean;
  }): Observable<AdminSessionDetailResponse> {
    const queryParams: Record<string, string> = {};
    if (params) {
      if (params.includeMovements !== undefined) queryParams['includeMovements'] = String(params.includeMovements);
      if (params.includeSales !== undefined) queryParams['includeSales'] = String(params.includeSales);
      if (params.includePayments !== undefined) queryParams['includePayments'] = String(params.includePayments);
    }
    return this.api.get<AdminSessionDetailResponse>(`cash/admin/sessions/${sessionId}`, queryParams);
  }

  /** Create manual movement (admin) */
  adminCreateMovement(sessionId: string, body: AdminCreateMovementDto): Observable<CashMovement> {
    return this.api.post<CashMovement>(`cash/admin/sessions/${sessionId}/movements`, body);
  }

  // === Legacy generic operations (keep for compatibility) ===

  list(params?: PageParams): Observable<PaginatedResponse<CashRegister>> {
    return this.api.getPaginated<PaginatedResponse<CashRegister>>('cash', params);
  }

  getById(id: number | string): Observable<CashRegister> {
    return this.api.get<CashRegister>(`cash/${id}`);
  }

  update(id: number | string, body: unknown): Observable<CashRegister> {
    return this.api.put<CashRegister>(`cash/${id}`, body);
  }

  patch(id: number | string, body: unknown): Observable<CashRegister> {
    return this.api.patch<CashRegister>(`cash/${id}`, body);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`cash/${id}`);
  }
}

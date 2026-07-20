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

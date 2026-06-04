import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';
import { PageParams, PaginatedResponse } from '../models/pagination.model';

/**
 * API service for sales.
 * Generic type TEntity defaults to unknown. Override when consuming:
 * extend this class and set TEntity to your entity model.
 */
@Injectable({ providedIn: 'root' })
export class SalesApiService<TEntity = unknown> {
  private api = inject(ApiClientService);

  /** List items (paginated) */
  list(params?: PageParams): Observable<PaginatedResponse<TEntity>> {
    return this.api.getPaginated<PaginatedResponse<TEntity>>('sales', params);
  }

  /** Get all items (unpaginated) */
  getAll(): Observable<TEntity[]> {
    return this.api.get<TEntity[]>('sales');
  }

  /** Get a single item by ID */
  getById(id: number | string): Observable<TEntity> {
    return this.api.get<TEntity>(`sales/${id}`);
  }

  /** Create a new item */
  create(body: unknown): Observable<TEntity> {
    return this.api.post<TEntity>('sales', body);
  }

  /** Update an existing item */
  update(id: number | string, body: unknown): Observable<TEntity> {
    return this.api.put<TEntity>(`sales/${id}`, body);
  }

  /** Partial update of an item */
  patch(id: number | string, body: unknown): Observable<TEntity> {
    return this.api.patch<TEntity>(`sales/${id}`, body);
  }

  /** Delete an item */
  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`sales/${id}`);
  }
}

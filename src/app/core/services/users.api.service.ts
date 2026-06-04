import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';
import { PageParams, PaginatedResponse } from '../models/pagination.model';

/**
 * API service for users.
 * Generic type TEntity defaults to unknown. Override when consuming:
 * extend this class and set TEntity to your entity model.
 */
@Injectable({ providedIn: 'root' })
export class UsersApiService<TEntity = unknown> {
  private api = inject(ApiClientService);

  /** List items (paginated) */
  list(params?: PageParams): Observable<PaginatedResponse<TEntity>> {
    return this.api.getPaginated<PaginatedResponse<TEntity>>('users', params);
  }

  /** Get all items (unpaginated) */
  getAll(): Observable<TEntity[]> {
    return this.api.get<TEntity[]>('users');
  }

  /** Get a single item by ID */
  getById(id: number | string): Observable<TEntity> {
    return this.api.get<TEntity>(`users/${id}`);
  }

  /** Create a new item */
  create(body: unknown): Observable<TEntity> {
    return this.api.post<TEntity>('users', body);
  }

  /** Update an existing item */
  update(id: number | string, body: unknown): Observable<TEntity> {
    return this.api.put<TEntity>(`users/${id}`, body);
  }

  /** Partial update of an item */
  patch(id: number | string, body: unknown): Observable<TEntity> {
    return this.api.patch<TEntity>(`users/${id}`, body);
  }

  /** Delete an item */
  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`users/${id}`);
  }
}

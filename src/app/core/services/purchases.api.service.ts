import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';
import { PageParams, PaginatedResponse } from '../models/pagination.model';

/**
 * API service for purchases.
 * Replace `any` with the actual entity type once the model is defined in features/.
 */
@Injectable({ providedIn: 'root' })
export class PurchasesApiService {
  private api = inject(ApiClientService);

  /** List items (paginated) */
  list(params?: PageParams): Observable<PaginatedResponse<any>> {
    return this.api.getPaginated<PaginatedResponse<any>>('purchases', params);
  }

  /** Get all items (unpaginated) */
  getAll(): Observable<any[]> {
    return this.api.get<any[]>('purchases');
  }

  /** Get a single item by ID */
  getById(id: number | string): Observable<any> {
    return this.api.get<any>(`purchases/${id}`);
  }

  /** Create a new item */
  create(body: any): Observable<any> {
    return this.api.post<any>('purchases', body);
  }

  /** Update an existing item */
  update(id: number | string, body: any): Observable<any> {
    return this.api.put<any>(`purchases/${id}`, body);
  }

  /** Partial update of an item */
  patch(id: number | string, body: any): Observable<any> {
    return this.api.patch<any>(`purchases/${id}`, body);
  }

  /** Delete an item */
  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(`purchases/${id}`);
  }
}

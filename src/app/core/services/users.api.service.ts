import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private api = inject(ApiClientService);

  // List all items (paginated)
  list(params?: any): Observable<any> {
    return this.api.getPaginated<unknown>('users', params);
  }

  // Get single item by ID
  getById(id: number | string): Observable<any> {
    return this.api.get<unknown>(`users/${id}`);
  }

  // Create new item
  create(body: any): Observable<any> {
    return this.api.post<any>('users', body);
  }

  // Update existing item
  update(id: number | string, body: any): Observable<any> {
    return this.api.put<any>(`users/${id}`, body);
  }

  // Patch partial update
  patch(id: number | string, body: any): Observable<any> {
    return this.api.patch<any>(`users/${id}`, body);
  }

  // Delete item
  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(`users/${id}`);
  }
}

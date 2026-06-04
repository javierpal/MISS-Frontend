import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class PrescriptionsApiService {
  private api = inject(ApiClientService);

  // List all items (paginated)
  list(params?: any): Observable<any> {
    return this.api.getPaginated<unknown>('prescriptions', params);
  }

  // Get single item by ID
  getById(id: number | string): Observable<any> {
    return this.api.get<unknown>(`prescriptions/${id}`);
  }

  // Create new item
  create(body: any): Observable<any> {
    return this.api.post<any>('prescriptions', body);
  }

  // Update existing item
  update(id: number | string, body: any): Observable<any> {
    return this.api.put<any>(`prescriptions/${id}`, body);
  }

  // Patch partial update
  patch(id: number | string, body: any): Observable<any> {
    return this.api.patch<any>(`prescriptions/${id}`, body);
  }

  // Delete item
  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(`prescriptions/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  InventoryEntry,
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class InventoryApiService {
  private apiClient = inject(ApiClientService);
  private endpoint = '/inventory';

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<InventoryEntry[]>> {
    return this.apiClient.get<InventoryEntry[]>(this.endpoint, params, token);
  }

  getStock(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>(`${this.endpoint}/stock`, params, token);
  }

  getStockByProduct(productId: string, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>(`${this.endpoint}/stock/${productId}`, undefined, token);
  }

  getKardex(productId: string, params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>(`${this.endpoint}/kardex/${productId}`, params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<InventoryEntry>> {
    return this.apiClient.get<InventoryEntry>(`${this.endpoint}/${id}`, undefined, token);
  }

  addEntry(body: unknown, token?: string): Observable<ApiResponse<InventoryEntry>> {
    return this.apiClient.post<InventoryEntry>(`${this.endpoint}/entries`, body, undefined, token);
  }

  addOutput(body: unknown, token?: string): Observable<ApiResponse<InventoryEntry>> {
    return this.apiClient.post<InventoryEntry>(`${this.endpoint}/outputs`, body, undefined, token);
  }

  adjust(body: unknown, token?: string): Observable<ApiResponse<InventoryEntry>> {
    return this.apiClient.post<InventoryEntry>(`${this.endpoint}/adjustments`, body, undefined, token);
  }
}

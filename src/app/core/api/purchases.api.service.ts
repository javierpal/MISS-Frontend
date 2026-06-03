import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  PurchaseResponse,
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class PurchasesApiService {
  private apiClient = inject(ApiClientService);

  create(body: unknown, token?: string): Observable<ApiResponse<PurchaseResponse>> {
    return this.apiClient.post<PurchaseResponse>('/purchases', body, undefined, token);
  }

  receive(id: string, body?: unknown, token?: string): Observable<ApiResponse<PurchaseResponse>> {
    return this.apiClient.post<PurchaseResponse>(`/purchases/${id}/receive`, body || {}, undefined, token);
  }

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<PurchaseResponse[]>> {
    return this.apiClient.get<PurchaseResponse[]>('/purchases', params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<PurchaseResponse>> {
    return this.apiClient.get<PurchaseResponse>(`/purchases/${id}`, undefined, token);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { SaleResponse, ApiResponse, HttpParamsExtended } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class SalesApiService {
  private apiClient = inject(ApiClientService);

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<SaleResponse[]>> {
    return this.apiClient.get<SaleResponse[]>('/sales', params, token);
  }

  getFiscalReport(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/sales/fiscal-report', params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<SaleResponse>> {
    return this.apiClient.get<SaleResponse>(`/sales/${id}`, undefined, token);
  }

  create(body: unknown, token?: string): Observable<ApiResponse<SaleResponse>> {
    return this.apiClient.post<SaleResponse>('/sales', body, undefined, token);
  }

  cancel(id: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/sales/${id}/cancel`, {}, undefined, token);
  }

  returnSale(id: string, body?: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/sales/${id}/return`, body || {}, undefined, token);
  }

  getRefunds(returnId: string, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>(`/sales/returns/${returnId}/refunds`, undefined, token);
  }

  createRefund(returnId: string, body: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/sales/returns/${returnId}/refunds`, body, undefined, token);
  }

  createPayment(body: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>('/sales/payments', body, undefined, token);
  }

  confirmMercadoPago(body: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>('/payments/mercado-pago/confirm', body, undefined, token);
  }
}

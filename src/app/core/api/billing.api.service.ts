import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { BillingInvoice, ApiResponse, HttpParamsExtended } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class BillingApiService {
  private apiClient = inject(ApiClientService);

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<BillingInvoice[]>> {
    return this.apiClient.get<BillingInvoice[]>('/billing/invoices', params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<BillingInvoice>> {
    return this.apiClient.get<BillingInvoice>(`/billing/invoices/${id}`, undefined, token);
  }

  downloadXml(id: string, token?: string): Observable<Blob> {
    return this.apiClient.http.get(`${this.apiClient.baseUrl}/billing/invoices/${id}/xml`, {
      responseType: 'blob',
      headers: this.apiClient.getHeaders(token),
    });
  }

  prepareStamping(id: string, token?: string): Observable<ApiResponse<BillingInvoice>> {
    return this.apiClient.post<BillingInvoice>(`/billing/invoices/${id}/prepare-stamping`, {}, undefined, token);
  }

  globalStamping(body: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>('/billing/invoices/global', body, undefined, token);
  }

  createFromSale(saleId: string, token?: string): Observable<ApiResponse<BillingInvoice>> {
    return this.apiClient.post<BillingInvoice>(`/billing/invoices/from-sale/${saleId}`, {}, undefined, token);
  }

  cancel(id: string, token?: string): Observable<ApiResponse<BillingInvoice>> {
    return this.apiClient.patch<BillingInvoice>(`/billing/invoices/${id}/cancel`, {}, token);
  }

  cancelCfdi(id: string, token?: string): Observable<ApiResponse<BillingInvoice>> {
    return this.apiClient.post<BillingInvoice>(`/billing/invoices/${id}/cancel-cfdi`, {}, undefined, token);
  }
}

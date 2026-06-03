import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ApiResponse, HttpParamsExtended } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class ReportsApiService {
  private apiClient = inject(ApiClientService);

  getHealth(token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/health', undefined, token);
  }

  exportSales(params?: HttpParamsExtended, token?: string): Observable<Blob> {
    return this.apiClient.http.get(`${this.apiClient.baseUrl}/reports/export/sales`, {
      params: this.apiClient.buildParams(params || {}),
      headers: this.apiClient.getHeaders(token),
      responseType: 'blob',
    });
  }

  exportInventory(params?: HttpParamsExtended, token?: string): Observable<Blob> {
    return this.apiClient.http.get(`${this.apiClient.baseUrl}/reports/export/inventory`, {
      params: this.apiClient.buildParams(params || {}),
      headers: this.apiClient.getHeaders(token),
      responseType: 'blob',
    });
  }

  exportFiscal(params?: HttpParamsExtended, token?: string): Observable<Blob> {
    return this.apiClient.http.get(`${this.apiClient.baseUrl}/reports/export/fiscal`, {
      params: this.apiClient.buildParams(params || {}),
      headers: this.apiClient.getHeaders(token),
      responseType: 'blob',
    });
  }

  getSales(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/sales', params, token);
  }

  getCash(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/cash', params, token);
  }

  getProfit(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/profit', params, token);
  }

  getFiscal(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/fiscal', params, token);
  }

  getFiscalCfdi(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/fiscal/cfdi', params, token);
  }

  getPrescriptions(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/prescriptions', params, token);
  }

  getInventory(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/reports/inventory', params, token);
  }
}

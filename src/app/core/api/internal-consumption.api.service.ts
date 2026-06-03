import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  InternalConsumptionEntry,
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class InternalConsumptionApiService {
  private apiClient = inject(ApiClientService);

  create(body: unknown, token?: string): Observable<ApiResponse<InternalConsumptionEntry>> {
    return this.apiClient.post<InternalConsumptionEntry>('/internal-consumption', body, undefined, token);
  }

  getReport(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/internal-consumption/report', params, token);
  }

  getReportByProduct(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/internal-consumption/report/by-product', params, token);
  }

  getReportByUser(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/internal-consumption/report/by-user', params, token);
  }

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<InternalConsumptionEntry[]>> {
    return this.apiClient.get<InternalConsumptionEntry[]>('/internal-consumption', params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<InternalConsumptionEntry>> {
    return this.apiClient.get<InternalConsumptionEntry>(`/internal-consumption/${id}`, undefined, token);
  }
}

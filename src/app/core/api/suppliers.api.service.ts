import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  SupplierResponse,
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class SuppliersApiService {
  private apiClient = inject(ApiClientService);

  create(body: unknown, token?: string): Observable<ApiResponse<SupplierResponse>> {
    return this.apiClient.post<SupplierResponse>('/suppliers', body, undefined, token);
  }

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<SupplierResponse[]>> {
    return this.apiClient.get<SupplierResponse[]>('/suppliers', params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<SupplierResponse>> {
    return this.apiClient.get<SupplierResponse>(`/suppliers/${id}`, undefined, token);
  }

  update(id: string, body: unknown, token?: string): Observable<ApiResponse<SupplierResponse>> {
    return this.apiClient.patch<SupplierResponse>(`/suppliers/${id}`, body, token);
  }
}

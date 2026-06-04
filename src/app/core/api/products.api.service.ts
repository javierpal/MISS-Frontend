import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  ProductResponse,
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  private apiClient = inject(ApiClientService);
  private endpoint = '/products';

  search(params: HttpParamsExtended, token?: string): Observable<ApiResponse<ProductResponse[]>> {
    return this.apiClient.get<ProductResponse[]>(`${this.endpoint}/search`, params, token);
  }

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<ProductResponse[]>> {
    return this.apiClient.get<ProductResponse[]>(this.endpoint, params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<ProductResponse>> {
    return this.apiClient.get<ProductResponse>(`${this.endpoint}/${id}`, undefined, token);
  }

  create(body: unknown, token?: string): Observable<ApiResponse<ProductResponse>> {
    return this.apiClient.post<ProductResponse>(this.endpoint, body, undefined, token);
  }

  update(id: string, body: unknown, token?: string): Observable<ApiResponse<ProductResponse>> {
    return this.apiClient.patch<ProductResponse>(`${this.endpoint}/${id}`, body, token);
  }

  delete(id: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`, token);
  }
}

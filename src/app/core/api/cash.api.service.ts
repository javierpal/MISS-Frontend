import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { CashResponse, ApiResponse } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class CashApiService {
  private apiClient = inject(ApiClientService);

  open(body: unknown, token?: string): Observable<ApiResponse<CashResponse>> {
    return this.apiClient.post<CashResponse>('/cash/open', body, undefined, token);
  }

  addMovement(body: unknown, token?: string): Observable<ApiResponse<CashResponse>> {
    return this.apiClient.post<CashResponse>('/cash/movements', body, undefined, token);
  }

  close(token?: string): Observable<ApiResponse<CashResponse>> {
    return this.apiClient.post<CashResponse>('/cash/close', {}, undefined, token);
  }

  getCurrent(token?: string): Observable<ApiResponse<CashResponse>> {
    return this.apiClient.get<CashResponse>('/cash/current', undefined, token);
  }
}

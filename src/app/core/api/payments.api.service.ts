import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { PaymentResponse, ApiResponse } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class PaymentsApiService {
  private apiClient = inject(ApiClientService);

  createCash(body: unknown, token?: string): Observable<ApiResponse<PaymentResponse>> {
    return this.apiClient.post<PaymentResponse>('/payments/cash', body, undefined, token);
  }

  createMixed(body: unknown, token?: string): Observable<ApiResponse<PaymentResponse>> {
    return this.apiClient.post<PaymentResponse>('/payments/mixed', body, undefined, token);
  }

  confirmMercadoPago(body: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>('/payments/mercado-pago/confirm', body, undefined, token);
  }
}

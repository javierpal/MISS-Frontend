import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { PrescriptionResponse, ApiResponse, HttpParamsExtended } from './api.models';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionsApiService {
  private apiClient = inject(ApiClientService);

  create(body: unknown, token?: string): Observable<ApiResponse<PrescriptionResponse>> {
    return this.apiClient.post<PrescriptionResponse>('/prescriptions', body, undefined, token);
  }

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<PrescriptionResponse[]>> {
    return this.apiClient.get<PrescriptionResponse[]>('/prescriptions', params, token);
  }

  getByPublicId(publicId: string, token?: string): Observable<ApiResponse<PrescriptionResponse>> {
    return this.apiClient.get<PrescriptionResponse>(`/prescriptions/public/${publicId}`, undefined, token);
  }

  getQrData(id: string, token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>(`/prescriptions/${id}/qr-data`, undefined, token);
  }

  getQrImage(id: string, token?: string): Observable<Blob> {
    return this.apiClient.http.get(`${this.apiClient.baseUrl}/prescriptions/${id}/qr-image`, {
      responseType: 'blob',
      headers: this.apiClient.getHeaders(token),
    });
  }

  getById(id: string, token?: string): Observable<ApiResponse<PrescriptionResponse>> {
    return this.apiClient.get<PrescriptionResponse>(`/prescriptions/${id}`, undefined, token);
  }

  updateStatus(id: string, body: unknown, token?: string): Observable<ApiResponse<PrescriptionResponse>> {
    return this.apiClient.patch<PrescriptionResponse>(`/prescriptions/${id}/status`, body, token);
  }

  dispense(id: string, token?: string): Observable<ApiResponse<PrescriptionResponse>> {
    return this.apiClient.post<PrescriptionResponse>(`/prescriptions/${id}/dispense`, {}, undefined, token);
  }

  convertToSale(id: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/prescriptions/${id}/convert-to-sale`, {}, undefined, token);
  }
}

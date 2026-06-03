import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  DashboardKpi,
  DashboardKpiAdvanced,
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private apiClient = inject(ApiClientService);

  getKpis(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<DashboardKpi[]>> {
    return this.apiClient.get<DashboardKpi[]>('/dashboard/kpis', params, token);
  }

  getAdvancedKpis(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<DashboardKpiAdvanced>> {
    return this.apiClient.get<DashboardKpiAdvanced>('/dashboard/kpis/advanced', params, token);
  }
}

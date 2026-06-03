import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  UserResponse,
  ApiResponse,
  HttpParamsExtended,
  AuthPayload,
  AuthToken,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private apiClient = inject(ApiClientService);

  login(body: AuthPayload): Observable<ApiResponse<AuthToken>> {
    return this.apiClient.post<AuthToken>('/auth/login', body);
  }

  refresh(body: { refreshToken: string }): Observable<ApiResponse<AuthToken>> {
    return this.apiClient.post<AuthToken>('/auth/refresh', body);
  }

  getMe(token?: string): Observable<ApiResponse<UserResponse>> {
    return this.apiClient.get<UserResponse>('/auth/me', undefined, token);
  }

  getAll(params?: HttpParamsExtended, token?: string): Observable<ApiResponse<UserResponse[]>> {
    return this.apiClient.get<UserResponse[]>('/users', params, token);
  }

  getById(id: string, token?: string): Observable<ApiResponse<UserResponse>> {
    return this.apiClient.get<UserResponse>(`/users/${id}`, undefined, token);
  }

  create(body: unknown, token?: string): Observable<ApiResponse<UserResponse>> {
    return this.apiClient.post<UserResponse>('/users', body, undefined, token);
  }

  update(id: string, body: unknown, token?: string): Observable<ApiResponse<UserResponse>> {
    return this.apiClient.patch<UserResponse>(`/users/${id}`, body, token);
  }

  delete(id: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/users/${id}`, token);
  }

  adminOnly(token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/auth/admin-only', undefined, token);
  }

  staffOrAdmin(token?: string): Observable<ApiResponse<unknown>> {
    return this.apiClient.get<unknown>('/auth/staff-or-admin', undefined, token);
  }
}

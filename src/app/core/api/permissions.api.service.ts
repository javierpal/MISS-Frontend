import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import {
  PermissionResponse,
  RoleResponse,
  ApiResponse,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class PermissionsApiService {
  private apiClient = inject(ApiClientService);

  getAll(token?: string): Observable<ApiResponse<PermissionResponse[]>> {
    return this.apiClient.get<PermissionResponse[]>('/permissions', undefined, token);
  }

  create(body: unknown, token?: string): Observable<ApiResponse<PermissionResponse>> {
    return this.apiClient.post<PermissionResponse>('/permissions', body, undefined, token);
  }

  getPreset(token?: string): Observable<ApiResponse<PermissionResponse[]>> {
    return this.apiClient.get<PermissionResponse[]>('/permissions/presets', undefined, token);
  }

  applyPreset(roleId: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/permissions/presets/apply/${roleId}`, {}, undefined, token);
  }

  getRoles(token?: string): Observable<ApiResponse<RoleResponse[]>> {
    return this.apiClient.get<RoleResponse[]>('/roles', undefined, token);
  }

  migrateUsers(roleId: string, body?: unknown, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/permissions/roles/${roleId}/migrate-users`, body || {}, undefined, token);
  }

  addPermission(roleId: string, permissionId: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.post<void>(`/permissions/roles/${roleId}`, { permissionId }, undefined, token);
  }

  getRolePermissions(roleId: string, token?: string): Observable<ApiResponse<PermissionResponse[]>> {
    return this.apiClient.get<PermissionResponse[]>(`/permissions/roles/${roleId}`, undefined, token);
  }

  removePermission(roleId: string, permissionId: string, token?: string): Observable<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/permissions/roles/${roleId}/${permissionId}`, token);
  }
}

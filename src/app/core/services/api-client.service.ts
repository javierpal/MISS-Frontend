import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { APP_ENVIRONMENT } from '../config/environment.token';
import { PageParams } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private http = inject(HttpClient);
  private env = inject(APP_ENVIRONMENT);

  private get baseUrl(): string {
    return this.env.apiBaseUrl;
  }

  /** Build query params from PageParams */
  private buildPageParams(params: PageParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', String(params.pageSize));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    return httpParams;
  }

  /** GET with optional query params */
  get<T>(endpoint: string, queryParams?: HttpParams | Record<string, string>): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    let params = queryParams ? this.normalizeParams(queryParams) : undefined;
    return this.http.get<T>(url, { params });
  }

  /** GET with pagination */
  getPaginated<T>(endpoint: string, pageParams?: PageParams): Observable<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    let params = new HttpParams();
    if (pageParams) {
      params = this.buildPageParams(pageParams);
    }
    return this.http.get<T>(url, { params });
  }

  /** POST with body */
  post<T, B = unknown>(endpoint: string, body?: B): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.post<T>(url, body);
  }

  /** PUT with body */
  put<T, B = unknown>(endpoint: string, body?: B): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.put<T>(url, body);
  }

  /** PATCH with body */
  patch<T, B = unknown>(endpoint: string, body?: B): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.patch<T>(url, body);
  }

  /** DELETE */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.delete<T>(url);
  }

  /** DELETE with query params */
  deleteWithParams<T>(endpoint: string, queryParams?: HttpParams | Record<string, string>): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    let params = queryParams ? this.normalizeParams(queryParams) : undefined;
    return this.http.delete<T>(url, { params });
  }

  /** Upload multipart form data.
   * Angular's HttpClient automatically sets the correct Content-Type
   * with boundary when FormData is passed — do NOT set it manually. */
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    return this.http.post<T>(url, formData);
  }

  private normalizeParams(params: HttpParams | Record<string, string>): HttpParams {
    if (params instanceof HttpParams) return params;
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }
}

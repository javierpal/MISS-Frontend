import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';

import { RuntimeConfigService } from '../config/runtime-config.service';
import { PageParams } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private http = inject(HttpClient);
  private runtimeConfig = inject(RuntimeConfigService);

  private get baseUrl(): string {
    return this.runtimeConfig.value.apiBaseUrl;
  }

  private buildPageParams(params: PageParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);
    return httpParams;
  }

  get<T>(endpoint: string, queryParams?: HttpParams | Record<string, string>): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const params = queryParams ? this.normalizeParams(queryParams) : undefined;
    return this.http.get<T>(url, { params });
  }

  getPaginated<T>(endpoint: string, pageParams?: PageParams): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    let params = new HttpParams();
    if (pageParams) {
      params = this.buildPageParams(pageParams);
    }
    return this.http.get<T>(url, { params });
  }

  /**
   * GET with automatic adapter for backend responses that use { data, meta } shape.
   * Backend returns: { data: T[], meta: { page, limit, total } }
   * Frontend expects: { items: T[], total: number, page, limit, totalPages }
   */
  getPaginatedAdapted<T>(endpoint: string, pageParams?: PageParams, extraQueryParams?: Record<string, string>): Observable<{ items: T[]; total: number; page: number; limit: number; totalPages: number }> {
    const url = `${this.baseUrl}/${endpoint}`;
    let params = new HttpParams();
    if (pageParams) {
      params = this.buildPageParams(pageParams);
    }
    if (extraQueryParams) {
      for (const [key, value] of Object.entries(extraQueryParams)) {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      }
    }
    return this.http.get<any>(url, { params }).pipe(
      map((raw: any) => {
        const items = raw.data || [];
        const meta = raw.meta || {};
        return {
          items,
          total: meta.total ?? items.length,
          page: meta.page ?? 1,
          limit: meta.limit ?? items.length,
          totalPages: meta.totalPages ?? Math.ceil((meta.total ?? items.length) / (meta.limit ?? (items.length || 1))),
        };
      }),
      catchError((err) => {
        console.error('[API Adapter] error for', endpoint, ':', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * GET that extracts only the `data` array from backend responses like { data, meta }.
   * Used for endpoints that return an envelope but the frontend needs just the array.
   */
  getAdapted<T>(endpoint: string, queryParams?: HttpParams | Record<string, string>): Observable<T[]> {
    const url = `${this.baseUrl}/${endpoint}`;
    const params = queryParams ? this.normalizeParams(queryParams) : undefined;
    return this.http.get<any>(url, { params }).pipe(
      map((raw: any) => {
        // If already an array, return as-is
        if (Array.isArray(raw)) return raw;
        // Otherwise extract data array from envelope
        return raw.data || [];
      }),
      catchError((err) => {
        console.error('[API Adapter] error for', endpoint, ':', err);
        return throwError(() => err);
      })
    );
  }

  post<T, B = unknown>(endpoint: string, body?: B): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T, B = unknown>(endpoint: string, body?: B): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  patch<T, B = unknown>(endpoint: string, body?: B): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }

  deleteWithParams<T>(endpoint: string, queryParams?: HttpParams | Record<string, string>): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const params = queryParams ? this.normalizeParams(queryParams) : undefined;
    return this.http.delete<T>(url, { params });
  }

  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData);
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

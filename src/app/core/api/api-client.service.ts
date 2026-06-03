import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  HttpParamsExtended,
} from './api.models';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  public http = inject(HttpClient);
  public get baseUrl(): string {
    return environment.apiBaseUrl;
  }

  public buildParams(params: HttpParamsExtended): HttpParams {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return httpParams;
  }

  public getHeaders(token?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get<T>(
    endpoint: string,
    params?: HttpParamsExtended,
    token?: string
  ): Observable<ApiResponse<T>> {
    const httpParams = params ? this.buildParams(params) : undefined;
    const headers = this.getHeaders(token);
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        params: httpParams,
        headers,
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  post<T>(
    endpoint: string,
    body: unknown,
    params?: HttpParamsExtended,
    token?: string
  ): Observable<ApiResponse<T>> {
    const httpParams = params ? this.buildParams(params) : undefined;
    const headers = this.getHeaders(token);
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, {
        params: httpParams,
        headers,
      })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  put<T>(
    endpoint: string,
    body: unknown,
    token?: string
  ): Observable<ApiResponse<T>> {
    const headers = this.getHeaders(token);
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  patch<T>(
    endpoint: string,
    body: unknown,
    token?: string
  ): Observable<ApiResponse<T>> {
    const headers = this.getHeaders(token);
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body, { headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  delete<T>(endpoint: string, token?: string): Observable<ApiResponse<T>> {
    const headers = this.getHeaders(token);
    return this.http
      .delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { headers })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: unknown): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}

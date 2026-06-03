import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { APP_ENVIRONMENT } from '../../core/config/environment.token';
import { AuthResponse, User } from '../../core/models/user.model';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private env = inject(APP_ENVIRONMENT);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.env.apiBaseUrl}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        this.tokenStorage.store(response.accessToken, response.refreshToken, response.user);
      }),
      catchError((error) => {
        const message = error.error?.message || 'Credenciales inválidas';
        return throwError(() => new Error(message));
      })
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.env.apiBaseUrl}/auth/refresh`, {
      refreshToken,
    }).pipe(
      tap((response) => {
        this.tokenStorage.store(response.accessToken, response.refreshToken, response.user);
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Sesión expirada'));
      })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.env.apiBaseUrl}/auth/me`).pipe(
      tap((user) => {
        this.tokenStorage.store(
          this.tokenStorage.getAccessToken()!,
          this.tokenStorage.getRefreshToken()!,
          user
        );
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('No se pudo obtener la sesión'));
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
  }

  isAuthenticated(): boolean {
    return this.tokenStorage.isAuthenticated;
  }

  getUser(): User | null {
    return this.tokenStorage.getUser();
  }
}

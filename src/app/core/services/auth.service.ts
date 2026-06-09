import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { RuntimeConfigService } from '../../core/config/runtime-config.service';
import { AuthResponse, RawAuthUser, User } from '../../core/models/user.model';
import { TokenStorageService } from '../../core/services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenStorage = inject(TokenStorageService);
  private runtimeConfig = inject(RuntimeConfigService);

  private get apiBaseUrl(): string {
    return this.runtimeConfig.value.apiBaseUrl;
  }

  private mapUser(user: RawAuthUser): User {
    const fullName = user.name?.trim()
      || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      || user.email;

    return {
      id: user.id,
      email: user.email,
      name: fullName,
      role: user.role,
    };
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        this.tokenStorage.store(response.accessToken, response.refreshToken, this.mapUser(response.user));
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

    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/refresh`, {
      refreshToken,
    }).pipe(
      tap((response) => {
        this.tokenStorage.store(response.accessToken, response.refreshToken, this.mapUser(response.user));
      }),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Sesión expirada'));
      })
    );
  }

  getMe(): Observable<User> {
    return this.http.get<RawAuthUser>(`${this.apiBaseUrl}/auth/me`).pipe(
      map((user) => this.mapUser(user)),
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

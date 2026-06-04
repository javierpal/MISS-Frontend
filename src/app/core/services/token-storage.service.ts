import { Injectable, signal } from '@angular/core';

import { RawAuthUser, User } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'miss_access_token';
const REFRESH_TOKEN_KEY = 'miss_refresh_token';
const USER_KEY = 'miss_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private userSignal = signal<User | null>(this.loadUser());

  private normalizeUser(user: User | RawAuthUser): User {
    const candidate = user as RawAuthUser & User;
    const fullName = candidate.name?.trim()
      || `${candidate.firstName ?? ''} ${candidate.lastName ?? ''}`.trim()
      || candidate.email;

    return {
      id: candidate.id,
      email: candidate.email,
      name: fullName,
      role: candidate.role,
    };
  }

  get user() {
    return this.userSignal();
  }

  get isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  store(accessToken: string, refreshToken: string, user: User | RawAuthUser): void {
    const normalizedUser = this.normalizeUser(user);

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    this.userSignal.set(normalizedUser);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getUser(): User | null {
    return this.userSignal();
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) {
        return null;
      }

      return this.normalizeUser(JSON.parse(raw) as User | RawAuthUser);
    } catch {
      return null;
    }
  }
}

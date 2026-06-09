import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RuntimeConfig {
  apiBaseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private http = inject(HttpClient);
  private config: RuntimeConfig = {
    apiBaseUrl: '/api',
  };

  async load(): Promise<void> {
    try {
      const cacheBust = Date.now();
      const runtimeConfig = await firstValueFrom(
        this.http.get<Partial<RuntimeConfig>>(`/app-config.json?t=${cacheBust}`)
      );

      this.config = {
        ...this.config,
        ...runtimeConfig,
      };
    } catch {
      this.config = {
        ...this.config,
      };
    }
  }

  get value(): RuntimeConfig {
    return this.config;
  }
}

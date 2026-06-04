import { InjectionToken, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { RuntimeConfigService } from './runtime-config.service';

export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
}

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('app-environment', {
  providedIn: 'root',
  factory: () => {
    const runtimeConfig = inject(RuntimeConfigService);

    return {
      production: environment.production,
      apiBaseUrl: runtimeConfig.value.apiBaseUrl,
    };
  }
});

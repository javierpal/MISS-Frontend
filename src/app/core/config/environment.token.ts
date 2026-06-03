import { InjectionToken } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface AppEnvironment {
  production: boolean;
  apiBaseUrl: string;
}

export const APP_ENVIRONMENT = new InjectionToken<AppEnvironment>('app-environment', {
  providedIn: 'root',
  factory: () => environment
});

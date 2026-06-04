import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, EnvironmentProviders } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';
import { ThemeService } from './core/theme/theme.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { RuntimeConfigService } from './core/config/runtime-config.service';

export function themeInitializer(themeService: ThemeService) {
  return () => themeService.init();
}

export function runtimeConfigInitializer(runtimeConfigService: RuntimeConfigService) {
  return () => runtimeConfigService.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: MatIconRegistry,
      useFactory: (http: HttpClient, sanitizer: DomSanitizer, errorHandler: ErrorHandler) => {
        const iconRegistry = new MatIconRegistry(http, sanitizer, document, errorHandler);
        iconRegistry.setDefaultFontSetClass('material-symbols-rounded');
        return iconRegistry;
      },
      deps: [HttpClient, DomSanitizer, ErrorHandler],
    },
    importProvidersFrom(MatIconModule),
    ThemeService,
    RuntimeConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: themeInitializer,
      deps: [ThemeService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: runtimeConfigInitializer,
      deps: [RuntimeConfigService],
      multi: true,
    },
  ],
};

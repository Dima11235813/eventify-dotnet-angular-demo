import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfigService } from './shared/config/app-config.service';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // TODO(SSR): Re-enable hydration when SSR is turned back on.
    // We are temporarily disabling SSR to isolate issues around config loading and APP_INITIALIZER deprecation.
    // provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([]), withFetch()),
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (cfg: AppConfigService) => () => cfg.load()
    }
  ]
};

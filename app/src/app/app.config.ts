import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { UserService } from './shared/api/user.service';
import { APP_CONFIG } from './shared/config/app-config.model';
import { ConfigLoader } from './shared/config/config-loader.service';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

function initApp() {
  return () => {
    // All inject() calls must happen before any await to keep injection context
    const loader = inject(ConfigLoader);
    const users = inject(UserService);
    return loader.load().then(() => users.load());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // TODO(SSR): Re-enable hydration when SSR is turned back on.
    // We are temporarily disabling SSR to isolate issues around config loading and APP_INITIALIZER deprecation.
    // provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([]), withFetch()),
    UserService,
    provideAppInitializer(initApp()),
    {
      provide: APP_CONFIG,
      useFactory: () => inject(ConfigLoader).cfg
    }
  ]
};

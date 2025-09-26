import { InjectionToken } from '@angular/core';

export interface AppConfig {
  version?: string;
  api: {
    baseUrl: string;
    endpoints: Record<string, string>;
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');



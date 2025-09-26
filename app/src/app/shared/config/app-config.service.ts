import { Injectable, signal } from '@angular/core';
import { APP_CONFIG, AppConfig } from './app-config.model';
import { HttpClient } from '@angular/common/http';

// AppConfig type moved to app-config.model.ts for global reuse

type MultiEnvConfig = {
  environment?: string;
  version?: string;
  environments: Record<string, { api: { baseUrl?: string; httpsBaseUrl?: string; endpoints?: Record<string, string> } }>;
};

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private readonly http: HttpClient;
  readonly config = signal<AppConfig | null>(null);

  constructor(http: HttpClient) {
    this.http = http;
  }

  // Note: APP_INITIALIZER is deprecated in v20 in favor of withAppInitializer.
  // We'll keep this shape for now and migrate when re-enabling SSR/hydration.
  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<unknown>('assets/config.json').subscribe({
        next: (raw) => {
          try {
            const parsed = this.parseConfig(raw);
            this.config.set(parsed);
            resolve();
          } catch (e) {
            this.config.set(null);
            reject(e instanceof Error ? e : new Error('Invalid app configuration.'));
          }
        },
        error: (err) => {
          this.config.set(null);
          reject(new Error('Failed to load app configuration: assets/config.json'));
        }
      });
    });
  }

  get apiBaseUrl(): string {
    const cfg = this.config();
    if (!cfg?.api?.baseUrl) throw new Error('App config not loaded or missing api.baseUrl');
    return cfg.api.baseUrl;
  }

  endpoint(key: string, params?: Record<string, string | number>): string {
    const cfg = this.config();
    if (!cfg?.api?.endpoints) throw new Error('App config not loaded or missing api.endpoints');
    const template = cfg.api.endpoints[key];
    if (!template) throw new Error(`Missing endpoint mapping for key: ${key}`);
    if (!params) return template;
    return Object.keys(params).reduce((acc, k) => acc.replace(`{${k}}`, String(params[k])), template);
  }

  // No default endpoints/config – app must provide a valid assets/config.json

  private parseConfig(raw: unknown): AppConfig {
    // Support both single-env and multi-env JSON structures
    const isObject = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object';
    if (isObject(raw) && 'environments' in raw) {
      const multi = raw as MultiEnvConfig;
      const envKey = multi.environment || 'local';
      const selected = multi.environments?.[envKey] || multi.environments?.['local'] || Object.values(multi.environments || {})[0];
      const baseUrl = selected?.api?.baseUrl || selected?.api?.httpsBaseUrl;
      const endpoints = selected?.api?.endpoints;
      if (!baseUrl || !endpoints) throw new Error('Invalid multi-environment config: missing baseUrl or endpoints');
      return {
        version: multi.version,
        api: { baseUrl, endpoints }
      };
    }

    if (isObject(raw)) {
      const single = raw as { version?: string; api?: { baseUrl?: string; endpoints?: Record<string, string> } };
      const baseUrl = single.api?.baseUrl;
      const endpoints = single.api?.endpoints;
      if (!baseUrl || !endpoints) throw new Error('Invalid config: missing api.baseUrl or api.endpoints');
      return { version: single.version, api: { baseUrl, endpoints } };
    }

    throw new Error('Invalid config format');
  }
}



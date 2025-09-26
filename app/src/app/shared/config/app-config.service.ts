import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type AppConfig = {
  version?: string;
  api: {
    baseUrl: string;
    endpoints: Record<string, string>;
  };
};

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

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<unknown>('assets/config.json').subscribe({
        next: (raw) => {
          this.config.set(this.parseConfig(raw));
          resolve();
        },
        error: () => {
          // Fallback to dev defaults if config missing
          this.config.set(this.defaultConfig());
          resolve();
        }
      });
    });
  }

  get apiBaseUrl(): string {
    return this.config()?.api.baseUrl ?? 'http://localhost:5146';
  }

  endpoint(key: string, params?: Record<string, string | number>): string {
    const template = this.config()?.api.endpoints[key] ?? '';
    if (!params) return template;
    return Object.keys(params).reduce((acc, k) => acc.replace(`{${k}}`, String(params[k])), template);
  }

  private defaultEndpoints(): Record<string, string> {
    return {
      events: '/events',
      eventById: '/events/{id}',
      register: '/events/{id}/register',
      unregister: '/events/{id}/register'
    };
  }

  private defaultConfig(): AppConfig {
    return {
      version: 'v1',
      api: {
        baseUrl: 'http://localhost:5146',
        endpoints: this.defaultEndpoints()
      }
    };
  }

  private parseConfig(raw: unknown): AppConfig {
    // Support both single-env and multi-env JSON structures
    const isObject = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object';
    if (isObject(raw) && 'environments' in raw) {
      const multi = raw as MultiEnvConfig;
      const envKey = multi.environment || 'local';
      const selected = multi.environments?.[envKey] || multi.environments?.['local'] || Object.values(multi.environments || {})[0];
      const baseUrl = selected?.api?.baseUrl || selected?.api?.httpsBaseUrl || 'http://localhost:5146';
      const endpoints = selected?.api?.endpoints || this.defaultEndpoints();
      return {
        version: multi.version,
        api: { baseUrl, endpoints }
      };
    }

    if (isObject(raw)) {
      const single = raw as { version?: string; api?: { baseUrl?: string; endpoints?: Record<string, string> } };
      return {
        version: single.version,
        api: {
          baseUrl: single.api?.baseUrl || 'http://localhost:5146',
          endpoints: single.api?.endpoints || this.defaultEndpoints()
        }
      };
    }

    return this.defaultConfig();
  }
}



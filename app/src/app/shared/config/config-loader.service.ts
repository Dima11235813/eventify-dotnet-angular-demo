import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppConfig } from './app-config.model';
import { mockAppConfig } from './mocks/mock-app-config';

@Injectable({ providedIn: 'root' })
export class ConfigLoader {
  private readonly http = inject(HttpClient);
  private _cfg: AppConfig = mockAppConfig;

  get cfg(): AppConfig {
    if (!this._cfg) throw new Error('Config not loaded yet');
    return this._cfg;
  }

  async load(): Promise<void> {
    try {
      const cfg = await this.http
        .get<AppConfig>('assets/config.json', { withCredentials: false })
        .toPromise();
      if (!cfg?.api?.baseUrl || !cfg?.api?.endpoints) {
        throw new Error('Invalid app configuration: missing api.baseUrl or api.endpoints');
      }
      this._cfg = cfg;
    } catch {
      // Keep mock config when fetch fails; app remains usable in dev/offline
      this._cfg = mockAppConfig;
    }
  }
}



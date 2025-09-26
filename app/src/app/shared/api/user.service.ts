import { Injectable, signal, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { APP_CONFIG, AppConfig } from '../config/app-config.model';
import { Observable } from 'rxjs';

export type UserDto = {
  id: string;
  name: string;
  email: string;
};

@Injectable({ providedIn: 'root' })
export class UserService extends BaseApiService {
  readonly user = signal<UserDto | null>(null);
  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  constructor() { super(); }

  load(): Promise<void> {
    return new Promise((resolve) => {
      this.get<UserDto>(this.endpoint('me')).subscribe({
        next: (u) => { this.user.set(u); resolve(); },
        error: () => { this.user.set(null); resolve(); }
      });
    });
  }

  getCurrent(): UserDto | null { return this.user(); }

  private endpoint(key: string, params?: Record<string, string | number>) {
    const template = this.cfg.api.endpoints[key];
    if (!template) throw new Error(`Missing endpoint mapping for key: ${key}`);
    return replaceParams(template, params);
  }
}

function replaceParams(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return Object.keys(params).reduce((acc, k) => acc.replace(`{${k}}`, String(params[k])), template);
}



import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from '../config/app-config.model';
import { LoggingService } from '../logging/logging.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export abstract class BaseApiService {
  protected readonly http = inject(HttpClient);
  protected readonly appConfig = inject<AppConfig>(APP_CONFIG);
  protected readonly logger = inject(LoggingService);

  protected url(path: string): string {
    const base = this.appConfig.api.baseUrl.replace(/\/$/, '');
    const rel = path.startsWith('/') ? path : `/${path}`;
    return `${base}${rel}`;
  }

  protected get<T>(path: string, options?: { params?: HttpParams | Record<string, string | number> }): Observable<T> {
    const params = this.buildParams(options?.params);
    const url = this.url(path);
    this.logger.info('GET ' + url, params);
    return this.http.get<T>(url, { params }).pipe(catchError((e) => this.handleError(e)));
  }

  protected post<T>(path: string, body: unknown, headers?: HttpHeaders | Record<string, string>): Observable<T> {
    const url = this.url(path);
    this.logger.info('POST ' + url, body);
    return this.http.post<T>(url, body, { headers: this.buildHeaders(headers) }).pipe(catchError((e) => this.handleError(e)));
  }

  protected put<T>(path: string, body: unknown, headers?: HttpHeaders | Record<string, string>): Observable<T> {
    const url = this.url(path);
    this.logger.info('PUT ' + url, body);
    return this.http.put<T>(url, body, { headers: this.buildHeaders(headers) }).pipe(catchError((e) => this.handleError(e)));
  }

  protected delete<T>(path: string, body?: unknown): Observable<T> {
    const url = this.url(path);
    this.logger.info('DELETE ' + url, body);
    return this.http.request<T>('DELETE', url, { body }).pipe(catchError((e) => this.handleError(e)));
  }

  private buildHeaders(headers?: HttpHeaders | Record<string, string>): HttpHeaders | undefined {
    if (!headers) return undefined;
    return headers instanceof HttpHeaders ? headers : new HttpHeaders(headers);
  }

  private buildParams(params?: HttpParams | Record<string, string | number>): HttpParams | undefined {
    if (!params) return undefined;
    if (params instanceof HttpParams) return params;
    let hp = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      hp = hp.set(k, String(v));
    }
    return hp;
  }

  private handleError(err: HttpErrorResponse) {
    this.logger.error('API error', err);
    return throwError(() => err);
  }
}



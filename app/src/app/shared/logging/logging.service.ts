import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  info(message: string, data?: unknown): void {
    // In future, send to remote log aggregator
    console.info(`[INFO] ${message}`, data ?? '');
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data ?? '');
  }

  error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${message}`, error ?? '');
  }
}



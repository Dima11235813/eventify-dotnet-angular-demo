import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PageLoaderService {
  private counter = 0;
  readonly loading = signal(false);

  start() {
    this.counter++;
    this.loading.set(true);
  }

  stop() {
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0) this.loading.set(false);
  }

  isLoading() { return this.loading(); }
}



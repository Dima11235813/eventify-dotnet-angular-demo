import { Injectable, signal } from '@angular/core';

export type ToastMessage = { type: 'success' | 'error' | 'info'; text: string; id: number };

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  private push(type: ToastMessage['type'], text: string) {
    const msg: ToastMessage = { id: this.nextId++, type, text };
    this.messages.update(list => [...list, msg]);
    setTimeout(() => this.dismiss(msg.id), 2500);
  }

  success(text: string) { this.push('success', text); }
  error(text: string) { this.push('error', text); }
  info(text: string) { this.push('info', text); }

  dismiss(id: number) {
    this.messages.update(list => list.filter(m => m.id !== id));
  }
}



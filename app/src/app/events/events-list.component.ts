import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService, EventDto } from '../shared/api/event.service';
import { ToastService } from '../shared/logging';
import { UserService } from '../shared/api/user.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
  private readonly eventsApi = inject(EventService);
  private readonly toast = inject(ToastService);
  private readonly users = inject(UserService);

  readonly events = signal<EventDto[] | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly busyEventIds = signal<Set<string>>(new Set());

  get currentUserId(): string | null { return this.users.getCurrent()?.id ?? null; }

  constructor() {
    // Effect to react to user changes and load events when user is available
    effect(() => {
      const userId = this.currentUserId;
      if (userId) {
        // Only load events when we have a user ID
        this.loadEvents(userId);
      } else {
        // If no user yet, keep loading state true
        this.loading.set(true);
        this.error.set(null);
        this.events.set(null);
      }
    });
  }

  ngOnInit(): void {
    // Component initialization is handled by the effect in constructor
  }

  private loadEvents(userId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.eventsApi.list(userId).subscribe({
      next: (list) => {
        this.events.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load events. Is the API running on http://localhost:5146?');
        this.loading.set(false);
      }
    });
  }

  private isPast(e: EventDto): boolean { return new Date(e.date).getTime() <= Date.now(); }
  private atCapacity(e: EventDto): boolean { return e.registeredCount >= e.maxCapacity; }
  canRegister(e: EventDto): boolean { return !this.isPast(e) && !this.atCapacity(e); }
  labelFor(e: EventDto): string {
    if (e.isRegistered) return 'Unregister';
    if (this.isPast(e)) return 'Event passed';
    if (this.atCapacity(e)) return 'At capacity';
    return 'Register';
  }

  isBusy(id: string): boolean { return this.busyEventIds().has(id); }

  onRegisterToggle(e: EventDto): void {
    if (this.isBusy(e.id)) return;
    this.busyEventIds.update(s => new Set([...s, e.id]));
    const userId = this.currentUserId!;
    const op$ = e.isRegistered
      ? this.eventsApi.unregister(e.id, userId)
      : this.eventsApi.register(e.id, userId);

    op$.subscribe({
      next: () => {
        // Refresh the one event locally
        this.events.update(list => (list ? list.map(ev => ev.id === e.id
          ? { ...ev, isRegistered: !e.isRegistered, registeredCount: e.isRegistered ? e.registeredCount - 1 : e.registeredCount + 1 }
          : ev) : list));
        this.toast.success(e.isRegistered ? 'Unregistered from event' : 'Registered for event');
      },
      error: (err: any) => {
        const msg = err?.error || err?.message || 'Request failed';
        this.toast.error(typeof msg === 'string' ? msg : 'Request failed');
      },
      complete: () => {
        this.busyEventIds.update(s => { const n = new Set(s); n.delete(e.id); return n; });
      }
    });
  }
}



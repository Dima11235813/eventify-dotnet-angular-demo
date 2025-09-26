import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, EventDto } from '../shared/api/event.service';

@Component({
  selector: 'app-events-preview',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="grid" *ngIf="events() as list; else loadingTmpl">
      <article class="card event" *ngFor="let e of list | slice:0:3">
        <div class="event__body">
          <h3>{{ e.title }}</h3>
          <p class="desc">{{ e.description }}</p>
          <div class="meta">
            <span class="date">{{ e.date | date: 'MMM d, y, h:mm a' }}</span>
            <span class="capacity">{{ e.registeredCount }}/{{ e.maxCapacity }}</span>
          </div>
          <div class="progress">
            <div class="bar" [style.width.%]="(e.registeredCount / e.maxCapacity) * 100"></div>
          </div>
        </div>
      </article>
    </div>
    <ng-template #loadingTmpl>
      <div class="loading">Loading events…</div>
    </ng-template>
    <div class="actions">
      <a class="btn-primary" routerLink="/events">Load More Events</a>
    </div>
  `,
  styles: [
    `.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}`,
    `.event{padding:14px}`,
    `.desc{color:var(--muted);height:40px;overflow:hidden}`,
    `.meta{display:flex;justify-content:space-between;font-size:12px;color:var(--muted)}`,
    `.progress{height:6px;background:#eef2ff;border-radius:999px;margin-top:10px}`,
    `.bar{height:100%;background:var(--primary);border-radius:999px}`,
    `.actions{display:flex;justify-content:center;margin-top:16px}`,
    `.loading{color:var(--muted);padding:12px 0}`
  ]
})
export class EventsPreviewComponent implements OnInit {
  private readonly eventsApi = inject(EventService);
  readonly events = signal<EventDto[] | null>(null);

  ngOnInit(): void {
    this.eventsApi.list().subscribe({
      next: (list) => this.events.set(list),
      error: () => this.events.set([])
    });
  }
}



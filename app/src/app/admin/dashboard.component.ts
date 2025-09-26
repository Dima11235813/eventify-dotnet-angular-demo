import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService, EventDto } from '../shared/api/event.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="admin-card" style="margin-bottom:16px;">
      <h2 style="margin:0 0 8px; font-size:28px;">Dashboard</h2>
      <p style="margin:0 0 16px; color:#6b7280;">Overview of your event management system</p>
      <div class="kpi-grid">
        <div class="admin-card kpi" style="align-items:flex-start;">
          <div style="color:#6b7280;">Total Events</div>
          <div style="font-size:28px; font-weight:700;">{{ totalEvents() }}</div>
          <div style="color:#6b7280; font-size:12px;">Active events</div>
        </div>
        <div class="admin-card kpi" style="align-items:flex-start;">
          <div style="color:#6b7280;">Total Registrations</div>
          <div style="font-size:28px; font-weight:700;">{{ totalRegistrations() }}</div>
          <div style="color:#6b7280; font-size:12px;">Across all events</div>
        </div>
        <div class="admin-card kpi" style="align-items:flex-start;">
          <div style="color:#6b7280;">Average Attendance</div>
          <div style="font-size:28px; font-weight:700;">{{ averageAttendance() }}</div>
          <div style="color:#6b7280; font-size:12px;">Per event</div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <h3 style="margin:0 0 12px; font-size:18px;">Recent Events</h3>
      <div *ngFor="let e of recentEvents(); let last = last">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0;">
          <div>
            <div style="font-weight:600;">{{ e.title }}</div>
            <div style="color:#6b7280; font-size:12px;">{{ e.date | date:'MMM d, y' }}</div>
          </div>
          <div class="capacity-chip">{{ e.registeredCount }}/{{ e.maxCapacity }} registered</div>
        </div>
        <div class="list-divider" *ngIf="!last"></div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  private readonly eventsApi = inject(EventService);

  readonly events = signal<EventDto[]>([]);
  readonly totalEvents = computed(() => this.events().length);
  readonly totalRegistrations = computed(() => this.events().reduce((s, e) => s + e.registeredCount, 0));
  readonly averageAttendance = computed(() => {
    const n = this.events().length || 1;
    return Math.round(this.totalRegistrations() / n);
  });
  readonly recentEvents = computed(() => [...this.events()].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));

  constructor() {
    this.eventsApi.list().subscribe({ next: (list) => this.events.set(list) });
  }
}



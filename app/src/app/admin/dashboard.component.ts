import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService, EventDto } from '../shared/api/event.service';
import { PageLoaderService } from '../shared/ui/page-loader.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="admin-card" style="margin-bottom:32px;">
      <h2 class="page-title">Dashboard</h2>
      <p class="page-subtitle">Overview of your event management system</p>
      <div class="kpi-grid">
        <div class="admin-card kpi" data-testid="kpi-card">
          <div class="kpi-header">
            <div class="kpi-label">Total Events</div>
            <div class="kpi-icon" aria-hidden="true">📅</div>
          </div>
          <div class="kpi-value">{{ totalEvents() }}</div>
          <div class="kpi-sub">Active events</div>
        </div>
        <div class="admin-card kpi" data-testid="kpi-card">
          <div class="kpi-header">
            <div class="kpi-label">Total Registrations</div>
            <div class="kpi-icon" aria-hidden="true">🧾</div>
          </div>
          <div class="kpi-value">{{ totalRegistrations() }}</div>
          <div class="kpi-sub">Across all events</div>
        </div>
        <div class="admin-card kpi" data-testid="kpi-card">
          <div class="kpi-header">
            <div class="kpi-label">Average Attendance</div>
            <div class="kpi-icon" aria-hidden="true">📈</div>
          </div>
          <div class="kpi-value">{{ averageAttendance() }}</div>
          <div class="kpi-sub">Per event</div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <h3 style="margin:0 0 12px; font-size:18px;">Recent Events</h3>
      <div class="recent-events">
        <div *ngFor="let e of recentEvents(); let last = last">
          <div class="recent-item" data-testid="recent-item">
            <div class="recent-left">
              <div class="recent-title">{{ e.title }}</div>
              <div class="recent-meta">{{ e.date | date:'MMM d, y' }}</div>
            </div>
            <div class="recent-right" data-testid="recent-right">
              <div class="recent-registered">
                <div class="value">{{ e.registeredCount }}/{{ e.maxCapacity }}</div>
                <div class="label">registered</div>
              </div>
            </div>
          </div>
          <div class="list-divider" *ngIf="!last"></div>
        </div>
      </div>
    </div>
  `
  ,
  styles: [
    `.kpi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}`,
    `.kpi{display:flex;flex-direction:column;gap:6px;align-items:flex-start}`,
    `.kpi-header{display:flex;align-items:center;justify-content:space-between;width:100%}`,
    `.kpi-label{color:#6b7280;font-weight:600}`,
    `.kpi-icon{color:#9ca3af}`,
    `.kpi-value{font-size:28px;font-weight:700}`,
    `.kpi-sub{color:#6b7280;font-size:12px}`,
    `.recent-events{display:block}`,
    `.recent-item{display:flex;align-items:center;justify-content:space-between;padding:12px 0}`,
    `.recent-left .recent-title{font-weight:600}`,
    `.recent-left .recent-meta{color:#6b7280;font-size:12px}`,
    `.recent-right{display:flex;align-items:center;gap:8px}`,
    `.recent-registered{text-align:right}`,
    `.recent-registered .value{font-weight:600}`,
    `.recent-registered .label{color:#6b7280;font-size:12px}`,
    `@media (max-width:900px){.kpi-grid{grid-template-columns:1fr}}`
  ]
})
export class DashboardComponent {
  private readonly eventsApi = inject(EventService);
  private readonly pageLoader = inject(PageLoaderService);

  readonly events = signal<EventDto[]>([]);
  readonly totalEvents = computed(() => this.events().length);
  readonly totalRegistrations = computed(() => this.events().reduce((s, e) => s + e.registeredCount, 0));
  readonly averageAttendance = computed(() => {
    const n = this.events().length || 1;
    return Math.round(this.totalRegistrations() / n);
  });
  readonly recentEvents = computed(() => [...this.events()].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5));

  constructor() {
    this.load();
  }

  load() {
    this.pageLoader.start();
    this.eventsApi.list().subscribe({
      next: (list) => this.events.set(list),
      error: () => {},
      complete: () => this.pageLoader.stop()
    });
  }
}



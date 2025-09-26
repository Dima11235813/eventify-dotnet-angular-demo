import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, EventDto } from '../shared/api/event.service';
import { ToastService } from '../shared/logging';
import { PageLoaderService } from '../shared/ui/page-loader.service';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="admin-card" style="margin-bottom:16px;">
      <h2 class="page-title">Manage Events</h2>
      <p class="page-subtitle">View and manage all your events</p>
    </div>

    <div class="admin-card">
      <h3 style="margin:0 0 12px; font-size:18px;">All Events</h3>
      <div class="table-wrapper" role="region" aria-label="All events table">
        <table class="admin-table" aria-label="Events">
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Date</th>
              <th scope="col">Category</th>
              <th scope="col">Registrations</th>
              <th scope="col" aria-label="Actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let e of events()">
              <td>{{ e.title }}</td>
              <td>{{ e.date | date:'MMM d, y' }}</td>
              <td><span class="pill">technology</span></td>
              <td>
                <span class="reg" [class.ok]="e.registeredCount < e.maxCapacity" [class.danger]="e.registeredCount >= e.maxCapacity">{{ e.registeredCount }}/{{ e.maxCapacity }}</span>
              </td>
              <td style="display:flex; gap:8px; justify-content:flex-start;">
                <a [routerLink]="['/admin/events', e.id, 'edit']" class="icon-btn" aria-label="Edit event">✎</a>
                <button (click)="onDelete(e)" class="icon-btn danger" aria-label="Delete event">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
  ,
  styles: [
    `.table-wrapper{overflow:auto}`,
    `.admin-table{width:100%;border-collapse:collapse}`,
    `.admin-table thead th{text-align:left;color:#374151;font-size:12px;padding:8px 0;font-weight:700}`,
    `.admin-table tbody tr{border-top:1px solid #eee}`,
    `.admin-table tbody td{padding:12px 0;vertical-align:middle}`,
    `.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid #e5e7eb;background:#f9fafb;color:#374151}`,
    `.reg{font-weight:600}`,
    `.reg.ok{color:#059669}`,
    `.reg.danger{color:#dc2626}`,
    `.icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;border:1px solid #e5e7eb;background:#f9fafb;color:#374151;cursor:pointer;text-decoration:none}`,
    `.icon-btn:hover{background:#eef2f7}`,
    `.icon-btn.danger{background:#fee2e2;border-color:#fecaca;color:#991b1b}`
  ]
})
export class ManageEventsComponent implements OnInit, OnDestroy {
  private readonly api = inject(EventService);
  private readonly toast = inject(ToastService);
  private readonly pageLoader = inject(PageLoaderService);

  readonly events = signal<EventDto[]>([]);

  ngOnInit() { this.reload(); }
  ngOnDestroy() {}

  reload() {
    this.pageLoader.start();
    this.api.list().subscribe({
      next: (list) => this.events.set(list),
      error: () => this.toast.error('Failed to load events'),
      complete: () => this.pageLoader.stop()
    });
  }

  onDelete(e: EventDto) {
    if (!e?.id) return;
    const ok = confirm('Delete this event?');
    if (!ok) return;
    this.pageLoader.start();
    this.api.deleteEvent(e.id).subscribe({
      next: () => { this.toast.success('Event deleted'); this.reload(); },
      error: (err) => {
        const status = err?.status;
        if (status === 409) this.toast.error('Event has registrations and cannot be deleted.');
        else this.toast.error('Failed to delete event');
      },
      complete: () => this.pageLoader.stop()
    });
  }
}



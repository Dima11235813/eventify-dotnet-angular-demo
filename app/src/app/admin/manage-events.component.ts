import { Component, inject, signal } from '@angular/core';
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
      <table class="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Category</th>
            <th>Registrations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of events()">
            <td>{{ e.title }}</td>
            <td>{{ e.date | date:'MMM d, y' }}</td>
            <td><span class="capacity-chip">technology</span></td>
            <td>
              <span [style.color]="e.registeredCount >= e.maxCapacity ? '#dc2626' : '#059669'">{{ e.registeredCount }}/{{ e.maxCapacity }}</span>
            </td>
            <td style="display:flex; gap:8px;">
              <a [routerLink]="['/admin/events', e.id, 'edit']" title="Edit" class="btn">✎ Edit</a>
              <button (click)="onDelete(e)" class="btn btn-danger">🗑 Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
  ,
  styles: [
    `.admin-table{width:100%;border-collapse:collapse}`,
    `.admin-table thead th{text-align:left;color:#6b7280;font-size:12px;padding:8px 0;font-weight:600}`,
    `.admin-table tbody tr{border-top:1px solid #eee}`,
    `.admin-table tbody td{padding:10px 0}`,
    `.capacity-chip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid #e5e7eb;background:#f9fafb;color:#374151}`
  ]
})
export class ManageEventsComponent {
  private readonly api = inject(EventService);
  private readonly toast = inject(ToastService);
  private readonly pageLoader = inject(PageLoaderService);

  readonly events = signal<EventDto[]>([]);

  constructor() {
    this.reload();
  }

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



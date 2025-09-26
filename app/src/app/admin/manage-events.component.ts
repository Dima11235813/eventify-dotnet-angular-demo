import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService, EventDto } from '../shared/api/event.service';
import { ToastService } from '../shared/logging';

@Component({
  selector: 'app-manage-events',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="admin-card" style="margin-bottom:16px;">
      <h2 style="margin:0 0 8px; font-size:28px;">Manage Events</h2>
      <p style="margin:0 0 12px; color:#6b7280;">View and manage all your events</p>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr style="text-align:left; color:#6b7280; font-size:12px;">
            <th style="padding:8px 0;">Title</th>
            <th>Date</th>
            <th>Category</th>
            <th>Registrations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let e of events()" style="border-top:1px solid #eee;">
            <td style="padding:10px 0;">{{ e.title }}</td>
            <td>{{ e.date | date:'MMM d, y' }}</td>
            <td><span class="capacity-chip" style="background:#f3f4f6;">technology</span></td>
            <td>
              <span [style.color]="e.registeredCount >= e.maxCapacity ? '#dc2626' : '#059669'">{{ e.registeredCount }}/{{ e.maxCapacity }}</span>
            </td>
            <td style="display:flex; gap:8px;">
              <a [routerLink]="['/admin/events', e.id, 'edit']" title="Edit" class="capacity-chip">✎</a>
              <button (click)="onDelete(e)" class="capacity-chip" style="background:#fee2e2; border-color:#fecaca;">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class ManageEventsComponent {
  private readonly api = inject(EventService);
  private readonly toast = inject(ToastService);

  readonly events = signal<EventDto[]>([]);

  constructor() {
    this.reload();
  }

  reload() {
    this.api.list().subscribe({ next: (list) => this.events.set(list) });
  }

  onDelete(e: EventDto) {
    if (!e?.id) return;
    const ok = confirm('Delete this event?');
    if (!ok) return;
    this.api.deleteEvent(e.id).subscribe({
      next: () => { this.toast.success('Event deleted'); this.reload(); },
      error: (err) => {
        const status = err?.status;
        if (status === 409) this.toast.error('Event has registrations and cannot be deleted.');
        else this.toast.error('Failed to delete event');
      }
    });
  }
}



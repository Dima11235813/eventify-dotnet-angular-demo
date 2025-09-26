import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EventFormComponent } from './event-form.component';
import { EventService, EventDto } from '../shared/api/event.service';
import { ToastService } from '../shared/logging';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  template: `
    <h2 style="margin:0 0 12px;">Edit Event</h2>
    <ng-container *ngIf="event(); else loading">
      <div *ngIf="isPast(); else formTpl" class="admin-card" style="color:#6b7280;">
        Event in the past — editing disabled.
      </div>
      <ng-template #formTpl>
        <app-event-form [defaults]="event()!" [submitLabel]="'Save Changes'" (submitted)="save($event)"></app-event-form>
      </ng-template>
    </ng-container>
    <ng-template #loading>
      <div class="admin-card">Loading...</div>
    </ng-template>
  `
})
export class EditEventComponent {
  private readonly api = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly event = signal<EventDto | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getById(id).subscribe({
      next: (e) => this.event.set(e),
      error: () => { this.toast.error('Event not found'); this.router.navigate(['/admin/events']); }
    });
  }

  isPast() { const e = this.event(); return !!e && new Date(e.date).getTime() <= Date.now(); }

  save(payload: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    if (this.isPast()) return;
    // Guard: capacity not less than registeredCount
    if ((payload.maxCapacity ?? 0) < (this.event()?.registeredCount ?? 0)) {
      this.toast.error('Max capacity cannot be below current registrations');
      return;
    }
    this.api.update(id, payload).subscribe({
      next: () => { this.toast.success('Event updated'); this.router.navigate(['/admin/events']); },
      error: (err) => this.toast.error(err?.error || 'Failed to update event')
    });
  }
}



import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventFormComponent } from './event-form.component';
import { EventService } from '../shared/api/event.service';
import { ToastService } from '../shared/logging';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  template: `
    <h2 style="margin:0 0 12px;">Create Event</h2>
    <app-event-form (submitted)="create($event)" submitLabel="Create Event"></app-event-form>
  `
})
export class CreateEventComponent {
  private readonly api = inject(EventService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  create(payload: any) {
    this.api.create(payload).subscribe({
      next: () => { this.toast.success('Event created'); this.router.navigate(['/admin/events']); },
      error: (err) => this.toast.error(err?.error || 'Failed to create event')
    });
  }
}



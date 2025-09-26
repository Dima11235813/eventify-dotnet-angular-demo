import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventFormComponent } from './event-form.component';
import { EventService } from '../shared/api/event.service';
import { ToastService } from '../shared/logging';
import { PageLoaderService } from '../shared/ui/page-loader.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, EventFormComponent],
  template: `
    <div class="admin-card" style="margin-bottom:12px;">
      <h2 class="page-title">Create Event</h2>
      <p class="page-subtitle">Add a new event to your platform</p>
    </div>
    <app-event-form (submitted)="create($event)" submitLabel="Create Event"></app-event-form>
  `
})
export class CreateEventComponent {
  private readonly api = inject(EventService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly pageLoader = inject(PageLoaderService);

  create(payload: any) {
    this.pageLoader.start();
    this.api.create(payload).subscribe({
      next: () => { this.toast.success('Event created'); this.router.navigate(['/admin/events']); },
      error: (err) => this.toast.error(err?.error || 'Failed to create event'),
      complete: () => this.pageLoader.stop()
    });
  }
}



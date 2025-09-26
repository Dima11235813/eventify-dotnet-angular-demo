import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService, EventDto } from '../shared/api/event.service';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './events-list.component.html',
  styleUrl: './events-list.component.scss'
})
export class EventsListComponent implements OnInit {
  private readonly eventsApi = inject(EventService);

  readonly events = signal<EventDto[] | null>(null);
  readonly loading = signal<boolean>(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.eventsApi.list().subscribe({
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
}



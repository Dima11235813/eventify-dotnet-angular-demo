import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsPreviewComponent } from '../events/events-preview.component';
import { EventService, EventDto } from '../shared/api/event.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, EventsPreviewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // State lifted: fetch in container, pass data down to presentational components
  private readonly eventsApi = inject(EventService);
  readonly events = signal<EventDto[] | null>(null);

  ngOnInit(): void {
    this.eventsApi.list().subscribe({
      next: (list) => this.events.set(list),
      error: () => this.events.set([])
    });
  }
}



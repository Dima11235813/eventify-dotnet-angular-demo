import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Import the generated DTOs
import { EventDto, CreateEventDto, UpdateEventDto, RegistrationDto } from './index';

/**
 * Example service demonstrating usage of auto-generated DTOs
 * This shows how to use the TypeScript interfaces in Angular services
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:5146';

  constructor(private http: HttpClient) {}

  // GET /events - Returns array of EventDto
  getEvents(): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.apiUrl}/events`);
  }

  // GET /events/{id} - Returns single EventDto
  getEvent(id: string): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.apiUrl}/events/${id}`);
  }

  // POST /events - Creates new event using CreateEventDto
  createEvent(event: CreateEventDto): Observable<EventDto> {
    return this.http.post<EventDto>(`${this.apiUrl}/events`, event);
  }

  // PUT /events/{id} - Updates event using UpdateEventDto
  updateEvent(id: string, event: UpdateEventDto): Observable<EventDto> {
    return this.http.put<EventDto>(`${this.apiUrl}/events/${id}`, event);
  }

  // POST /events/{id}/register - Registers using RegistrationDto
  registerForEvent(id: string, registration: RegistrationDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/events/${id}/register`, registration);
  }

  // DELETE /events/{id}/register - Unregisters
  unregisterFromEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}/register`);
  }
}

/**
 * Example component demonstrating DTO usage
 */
export class EventListComponent {
  events: EventDto[] = [];
  loading = false;

  constructor(private eventService: EventService) {}

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load events:', error);
        this.loading = false;
      }
    });
  }

  createEvent(): void {
    const newEvent: CreateEventDto = {
      title: 'New Tech Conference',
      description: 'A conference about new technologies',
      date: '2025-12-01T10:00:00',
      maxCapacity: 1000
    };

    this.eventService.createEvent(newEvent).subscribe({
      next: (createdEvent) => {
        console.log('Event created:', createdEvent);
        this.loadEvents(); // Refresh the list
      },
      error: (error) => {
        console.error('Failed to create event:', error);
      }
    });
  }
}

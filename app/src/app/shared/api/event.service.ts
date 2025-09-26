import { Injectable, inject } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { APP_CONFIG, AppConfig } from '../config/app-config.model';
import { Observable } from 'rxjs';
import { CreateEventDto } from '../dto/model/createEventDto';
import { UpdateEventDto } from '../dto/model/updateEventDto';

export type EventDto = {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  maxCapacity: number;
  registeredCount: number;
  isRegistered: boolean;
};

@Injectable({ providedIn: 'root' })
export class EventService extends BaseApiService {
  private readonly cfg = inject<AppConfig>(APP_CONFIG);
  constructor() { super(); }

  list(userId?: string): Observable<EventDto[]> {
    const path = this.endpoint('events');
    const query = userId ? `${path}?userId=${encodeURIComponent(userId)}` : path;
    return this.get<EventDto[]>(query);
  }

  getById(id: string, userId?: string): Observable<EventDto> {
    const base = `${this.endpoint('events')}/${id}`;
    const url = userId ? `${base}?userId=${encodeURIComponent(userId)}` : base;
    return this.get<EventDto>(url);
  }

  create(dto: CreateEventDto) {
    return this.post<EventDto>(this.endpoint('events'), dto);
  }

  update(id: string, dto: UpdateEventDto) {
    return this.put<EventDto>(this.endpoint('eventById', { id }), dto);
  }

  deleteEvent(id: string) {
    // Backend DELETE may not be available yet; call and let caller handle 405/404
    return this.delete<void>(this.endpoint('eventById', { id }));
  }

  register(eventId: string, userId: string) {
    return this.post<void>(this.endpoint('register', { id: eventId }), { eventId, userId });
  }

  unregister(eventId: string, userId: string) {
    return this.delete<void>(this.endpoint('unregister', { id: eventId }), { eventId, userId });
  }

  private endpoint(key: string, params?: Record<string, string | number>) {
    const template = this.cfg.api.endpoints[key];
    if (!template) throw new Error(`Missing endpoint mapping for key: ${key}`);
    if (!params) return template;
    return Object.keys(params).reduce((acc, k) => acc.replace(`{${k}}`, String(params[k])), template);
  }
}



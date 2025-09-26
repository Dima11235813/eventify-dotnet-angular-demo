import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { AppConfigService } from '../config/app-config.service';
import { Observable } from 'rxjs';

export type EventDto = {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  maxCapacity: number;
  registeredCount: number;
};

@Injectable({ providedIn: 'root' })
export class EventService extends BaseApiService {
  constructor(private readonly cfg: AppConfigService) { super(); }

  list(): Observable<EventDto[]> {
    return this.get<EventDto[]>(this.cfg.endpoint('events'));
  }

  getById(id: string): Observable<EventDto> {
    return this.get<EventDto>(`${this.cfg.endpoint('events')}/${id}`);
  }
}



import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventsPreviewComponent } from '../events/events-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, EventsPreviewComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}



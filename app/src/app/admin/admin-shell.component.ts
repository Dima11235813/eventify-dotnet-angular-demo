import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-card" style="position:sticky;top:80px;">
          <h3 style="margin-top:0;">Admin Panel</h3>
          <nav class="links" style="flex-direction:column;gap:8px;">
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
            <a routerLink="/admin/events/new" routerLinkActive="active">Create Event</a>
            <a routerLink="/admin/events" routerLinkActive="active">Manage Events</a>
            <a class="disabled" aria-disabled="true">Reports <small>Soon</small></a>
          </nav>
        </div>
      </aside>
      <main>
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminShellComponent {}



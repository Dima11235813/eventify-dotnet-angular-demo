import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('@app/admin/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      { path: '', loadComponent: () => import('@app/admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'events', loadComponent: () => import('@app/admin/manage-events.component').then(m => m.ManageEventsComponent) },
      { path: 'events/new', loadComponent: () => import('@app/admin/create-event.component').then(m => m.CreateEventComponent) },
      { path: 'events/:id/edit', loadComponent: () => import('@app/admin/edit-event.component').then(m => m.EditEventComponent) },
      { path: '**', redirectTo: '' }
    ]
  }
];



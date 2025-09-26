import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageLoaderService } from '../shared/ui/page-loader.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container admin-shell">
      <aside class="admin-sidebar" aria-label="Admin sidebar">
        <div class="admin-card">
          <h3>Admin Panel</h3>
          <nav class="links">
            <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
            <a routerLink="/admin/events/new" routerLinkActive="active">Create Event</a>
            <a routerLink="/admin/events" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: false }">Manage Events</a>
            <a class="disabled" aria-disabled="true">Reports <small>Soon</small></a>
          </nav>
        </div>
      </aside>
      <main class="admin-main">
        <div *ngIf="loader.isLoading()" class="page-skeleton" aria-busy="true" aria-live="polite">
          <div class="skeleton-card">
            <div class="skeleton-line lg" style="width:180px"></div>
            <div style="height:12px"></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
              <div class="skeleton-card"><div class="skeleton-line md"></div><div style="height:8px"></div><div class="skeleton-line sm"></div></div>
              <div class="skeleton-card"><div class="skeleton-line md"></div><div style="height:8px"></div><div class="skeleton-line sm"></div></div>
              <div class="skeleton-card"><div class="skeleton-line md"></div><div style="height:8px"></div><div class="skeleton-line sm"></div></div>
            </div>
          </div>
          <div class="skeleton-card"><div class="skeleton-line md"></div><div style="height:8px"></div><div class="skeleton-line sm"></div></div>
          <div class="skeleton-card"><div class="skeleton-line md"></div><div style="height:8px"></div><div class="skeleton-line sm"></div></div>
        </div>
        <ng-container *ngIf="!loader.isLoading()">
          <router-outlet />
        </ng-container>
      </main>
    </div>
  `
  ,
  styles: [
    `.admin-shell{display:grid;grid-template-columns:260px 1fr;gap:24px;width:100vw;box-sizing:border-box}`,
    `.admin-sidebar{padding:16px;background:#f3f4f6;min-height:calc(100vh - 56px);}`,
    `.admin-sidebar .admin-card:first-child{margin-top:24px;}`,
    `.admin-main{padding:24px 48px;}`,
    `.admin-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04);}`,
    `.page-title{margin:0 0 8px;font-size:28px;font-weight:700;}`,
    `.page-subtitle{margin:0 0 12px;color:#6b7280;font-size:16px;}`,
    `.admin-sidebar .links{display:flex;flex-direction:column;gap:8px;}`,
    `.admin-sidebar .links a{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:8px;text-decoration:none;color:#111827;font-weight:600;}`,
    `.admin-sidebar .links a.active{background:rgba(37,99,235,.12);color:#2563eb;}`,
    `.admin-sidebar .links a.disabled{opacity:.5;pointer-events:none;}`,
    `.admin-main > .admin-card{margin-bottom:32px;}`,
    `.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;color:#111827;cursor:pointer}`,
    `.btn[disabled]{opacity:.6;cursor:not-allowed}`,
    `.btn-primary{background:#2563eb;border-color:#2563eb;color:#fff}`,
    `.btn-primary:hover{background:#1d4ed8}`,
    `.btn-danger{background:#fee2e2;border-color:#fecaca;color:#991b1b}`,
    `.btn.loading{position:relative}`,
    `.btn.loading::after{content:'';width:14px;height:14px;border:2px solid rgba(0,0,0,.25);border-top-color:currentColor;border-radius:50%;animation:spin .8s linear infinite}`,
    `@keyframes spin{to{transform:rotate(360deg)}}`,
    `@media (max-width:900px){.admin-shell{grid-template-columns:1fr}.admin-sidebar{position:static;min-height:auto}.admin-main{padding:0 16px}}`,
    `.page-skeleton{display:grid;gap:16px}`,
    `.skeleton-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;}`,
    `.skeleton-line{height:14px;background:linear-gradient(90deg,#f3f4f6,#e5e7eb,#f3f4f6);background-size:200% 100%;animation:shine 1.2s infinite;border-radius:6px;}`,
    `.skeleton-line.sm{height:10px;width:40%}`,
    `.skeleton-line.md{height:12px;width:70%}`,
    `.skeleton-line.lg{height:18px;width:30%}`,
    `@keyframes shine{0%{background-position:200% 0}100%{background-position:-200% 0}}`
  ],
  encapsulation: ViewEncapsulation.None
})
export class AdminShellComponent {
  constructor(public readonly loader: PageLoaderService) {}
}



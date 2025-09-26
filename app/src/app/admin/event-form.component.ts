import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CreateEventDto } from '../shared/dto/model/createEventDto';
import { UpdateEventDto } from '../shared/dto/model/updateEventDto';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="admin-card form-card">
      <div class="form-grid-2">
        <div>
          <label>Event Title *</label>
          <input formControlName="title" type="text" class="input" placeholder="Enter event title" aria-label="Event Title *" />
          <small class="error" *ngIf="form.controls.title.touched && form.controls.title.invalid">Title is required (1–200)</small>
        </div>
        <div>
          <label>Category *</label>
          <select class="input" aria-label="Category *">
            <option value="">Select category</option>
            <option>Technology</option>
            <option>Business</option>
            <option>Design</option>
            <option>Marketing</option>
            <option>Networking</option>
            <option>Workshop</option>
            <option>Conference</option>
          </select>
        </div>
      </div>

      <div class="form-grid-2">
        <div>
          <label>Date *</label>
          <input formControlName="date" type="date" class="input" aria-label="Date *" />
          <small class="error" *ngIf="form.controls.date.touched && form.controls.date.invalid">Choose a future date</small>
        </div>
        <div>
          <label>Time *</label>
          <input type="text" class="input" placeholder="e.g., 9:00 AM - 5:00 PM" />
        </div>
      </div>

      <div class="form-grid-2">
        <div>
          <label>Location</label>
          <input type="text" class="input" placeholder="Enter event location" />
        </div>
        <div>
          <label>Max Capacity *</label>
          <input formControlName="maxCapacity" type="number" min="1" class="input" placeholder="Enter maximum attendees" aria-label="Max Capacity *" />
          <small class="error" *ngIf="form.controls.maxCapacity.touched && form.controls.maxCapacity.invalid">Capacity must be greater than 0</small>
          <small class="error" *ngIf="capacityBelowRegistration()">Cannot set below registered count ({{ registeredCount || 0 }})</small>
        </div>
      </div>

      <div>
        <label>Description</label>
        <textarea formControlName="description" rows="4" class="input" placeholder="Enter event description"></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [class.loading]="isSubmitting" [disabled]="form.invalid || capacityBelowRegistration() || isSubmitting">{{ isSubmitting ? 'Saving…' : submitLabel }}</button>
        <button type="button" class="btn" (click)="form.reset(defaults)" [disabled]="isSubmitting">Clear Form</button>
      </div>
    </form>
  `,
  styles: [
    `.form-card{ display:grid; gap:12px; }`,
    `.input{ width:100%; max-width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px; }`,
    `label{ display:block; margin-bottom:6px; font-size:12px; color:#6b7280; }`,
    `.error{ color:#b91c1c; font-size:12px; }`,
    `.form-grid-2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }`,
    `.form-actions{ display:flex; gap:8px; }`,
    `.btn{ display:inline-flex; align-items:center; gap:8px; padding:10px 14px; border-radius:8px; border:1px solid #e5e7eb; background:#fff; color:#111827; cursor:pointer; }`,
    `.btn[disabled]{ opacity:.6; cursor:not-allowed; }`,
    `.btn-primary{ background:#2563eb; border-color:#2563eb; color:#fff; }`,
    `.btn-primary:hover{ background:#1d4ed8; }`,
    `.btn-primary.loading{ position:relative; }`,
    `.btn-primary.loading::after{ content:''; width:14px; height:14px; border:2px solid rgba(255,255,255,.6); border-top-color:#fff; border-radius:50%; animation:spin .8s linear infinite; display:inline-block; }`,
    `@keyframes spin{ to{ transform: rotate(360deg); } }`,
    `@media (max-width:900px){ .form-grid-2{ grid-template-columns: 1fr; } }
    `
  ]
})
export class EventFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() defaults: Partial<CreateEventDto & UpdateEventDto & { registeredCount: number }> = {};
  @Input() submitLabel = 'Create Event';
  @Output() submitted = new EventEmitter<CreateEventDto | UpdateEventDto>();
  isSubmitting = false;

  get registeredCount() { return this.defaults.registeredCount ?? 0; }

  private futureDateValidator = (c: any) => {
    if (!c?.value) return { required: true };
    try {
      const d = new Date(c.value);
      const today = new Date();
      today.setHours(0,0,0,0);
      return d.getTime() > today.getTime() ? null : { past: true };
    } catch { return { invalid: true }; }
  };

  readonly form = this.fb.group({
    title: this.fb.control(this.defaults.title ?? '', { validators: [Validators.required, Validators.minLength(1), Validators.maxLength(200)] }),
    description: this.fb.control(this.defaults.description ?? '', { validators: [Validators.maxLength(2000)] }),
    date: this.fb.control(this.defaults.date ? this.defaults.date.substring(0,10) : '', { validators: [Validators.required, this.futureDateValidator] }),
    maxCapacity: this.fb.control<number | null>(this.defaults.maxCapacity ?? null, { validators: [Validators.required, Validators.min(1)] })
  });

  capacityBelowRegistration = computed(() => {
    const cap = this.form.controls.maxCapacity.value ?? 0;
    return cap < (this.registeredCount || 0);
  });

  ngOnChanges() {
    this.form.patchValue({
      title: this.defaults.title ?? '',
      description: this.defaults.description ?? '',
      date: this.defaults.date ? this.defaults.date.substring(0,10) : '',
      maxCapacity: this.defaults.maxCapacity ?? null
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.form.invalid || this.capacityBelowRegistration()) return;
    this.isSubmitting = true;
    const v = this.form.getRawValue();
    const payload: CreateEventDto = {
      title: v.title!, description: v.description || '', date: new Date(v.date!).toISOString(), maxCapacity: Number(v.maxCapacity)
    };
    this.submitted.emit(payload);
    // parent components stop loading via PageLoaderService; re-enable button after async turn
    setTimeout(() => this.isSubmitting = false, 0);
  }
}



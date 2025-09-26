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
    <div class="admin-card" style="margin-bottom:12px;">
      <h2 style="margin:0 0 6px; font-size:28px;">{{ submitLabel === 'Create Event' ? 'Create Event' : 'Edit Event' }}</h2>
      <p style="margin:0; color:#6b7280;">Add a new event to your platform</p>
    </div>
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="admin-card" style="display:grid; gap:12px;">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <div>
          <label>Event Title *</label>
          <input formControlName="title" type="text" class="input" placeholder="Enter event title" />
          <small class="error" *ngIf="form.controls.title.touched && form.controls.title.invalid">Title is required (1–200)</small>
        </div>
        <div>
          <label>Category *</label>
          <select class="input"><option>Technology</option></select>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <div>
          <label>Date *</label>
          <input formControlName="date" type="date" class="input" />
          <small class="error" *ngIf="form.controls.date.touched && form.controls.date.invalid">Choose a future date</small>
        </div>
        <div>
          <label>Time *</label>
          <input type="text" class="input" placeholder="e.g., 9:00 AM - 5:00 PM" />
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
        <div>
          <label>Location</label>
          <input type="text" class="input" placeholder="Enter event location" />
        </div>
        <div>
          <label>Max Capacity *</label>
          <input formControlName="maxCapacity" type="number" min="1" class="input" placeholder="Enter maximum attendees" />
          <small class="error" *ngIf="form.controls.maxCapacity.touched && form.controls.maxCapacity.invalid">Capacity must be greater than 0</small>
          <small class="error" *ngIf="capacityBelowRegistration()">Cannot set below registered count ({{ registeredCount || 0 }})</small>
        </div>
      </div>

      <div>
        <label>Description</label>
        <textarea formControlName="description" rows="4" class="input" placeholder="Enter event description"></textarea>
      </div>

      <div class="admin-card" style="border-style:dashed; text-align:center; color:#6b7280;">
        Click to upload or drag and drop
        <div style="font-size:12px;">PNG, JPG up to 10MB</div>
      </div>

      <div style="display:flex; gap:8px;">
        <button type="submit" class="capacity-chip" [disabled]="form.invalid || capacityBelowRegistration()">{{ submitLabel }}</button>
        <button type="button" class="capacity-chip" (click)="form.reset(defaults)">Clear Form</button>
      </div>
    </form>
  `,
  styles: [
    `.input{ width:100%; padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px; }`,
    `label{ display:block; margin-bottom:6px; font-size:12px; color:#6b7280; }`,
    `.error{ color:#b91c1c; font-size:12px; }`
  ]
})
export class EventFormComponent {
  private readonly fb = inject(FormBuilder);

  @Input() defaults: Partial<CreateEventDto & UpdateEventDto & { registeredCount: number }> = {};
  @Input() submitLabel = 'Create Event';
  @Output() submitted = new EventEmitter<CreateEventDto | UpdateEventDto>();

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
    const v = this.form.getRawValue();
    const payload: CreateEventDto = {
      title: v.title!, description: v.description || '', date: new Date(v.date!).toISOString(), maxCapacity: Number(v.maxCapacity)
    };
    this.submitted.emit(payload);
  }
}



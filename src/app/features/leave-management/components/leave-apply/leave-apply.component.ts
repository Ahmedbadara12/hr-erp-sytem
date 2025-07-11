import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Apply for Leave</h5>
      </div>
      <div class="card-body">
        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="progress" style="height: 1.2rem;">
            <div class="progress-bar bg-primary" role="progressbar" [style.width]="progress + '%'">
              Step {{ step }} / 4
            </div>
          </div>
        </div>
        <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
          <!-- Step 1: Type -->
          <div *ngIf="step === 1">
            <div class="mb-3">
              <label class="form-label">Type</label>
              <select class="form-select" formControlName="type">
                <option value="">Select type</option>
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Unpaid">Unpaid</option>
              </select>
              <div *ngIf="leaveForm.get('type')?.invalid && leaveForm.get('type')?.touched" class="text-danger">
                Type is required.
              </div>
            </div>
          </div>
          <!-- Step 2: Dates -->
          <div *ngIf="step === 2">
            <div class="mb-3">
              <label class="form-label">From</label>
              <input type="date" class="form-control" formControlName="from" />
              <div *ngIf="leaveForm.get('from')?.invalid && leaveForm.get('from')?.touched" class="text-danger">
                Start date is required.
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">To</label>
              <input type="date" class="form-control" formControlName="to" />
              <div *ngIf="leaveForm.get('to')?.invalid && leaveForm.get('to')?.touched" class="text-danger">
                End date is required.
              </div>
            </div>
          </div>
          <!-- Step 3: Reason -->
          <div *ngIf="step === 3">
            <div class="mb-3">
              <label class="form-label">Reason</label>
              <textarea class="form-control" formControlName="reason"></textarea>
            </div>
          </div>
          <!-- Step 4: Review -->
          <div *ngIf="step === 4">
            <div class="mb-3">
              <label class="form-label">Review your request</label>
              <ul class="list-group">
                <li class="list-group-item"><b>Type:</b> {{ leaveForm.value.type }}</li>
                <li class="list-group-item"><b>From:</b> {{ leaveForm.value.from }}</li>
                <li class="list-group-item"><b>To:</b> {{ leaveForm.value.to }}</li>
                <li class="list-group-item"><b>Reason:</b> {{ leaveForm.value.reason }}</li>
              </ul>
            </div>
          </div>
          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-secondary" (click)="prevStep()" [disabled]="step === 1">Back</button>
            <button *ngIf="step < 4" type="button" class="btn btn-primary" (click)="nextStep()" [disabled]="!canProceed()">Next</button>
            <button *ngIf="step === 4" class="btn btn-primary" type="submit">Submit</button>
          </div>
        </form>
        <div *ngIf="showSuccess" class="alert alert-success mt-3">Leave request submitted!</div>
      </div>
    </div>
  `
})
export class LeaveApplyComponent {
  leaveForm: FormGroup;
  showSuccess = false;
  step = 1;
  get progress() { return (this.step - 1) * 100 / 3; }
  constructor(private fb: FormBuilder, private leaveService: LeaveService, private router: Router) {
    this.leaveForm = this.fb.group({
      type: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      reason: ['']
    });
  }
  nextStep() {
    if (this.step === 1 && this.leaveForm.get('type')?.invalid) {
      this.leaveForm.get('type')?.markAsTouched();
      return;
    }
    if (this.step === 2 && (this.leaveForm.get('from')?.invalid || this.leaveForm.get('to')?.invalid)) {
      this.leaveForm.get('from')?.markAsTouched();
      this.leaveForm.get('to')?.markAsTouched();
      return;
    }
    this.step++;
  }
  prevStep() {
    if (this.step > 1) this.step--;
  }
  canProceed() {
    if (this.step === 1) return this.leaveForm.get('type')?.valid;
    if (this.step === 2) return this.leaveForm.get('from')?.valid && this.leaveForm.get('to')?.valid;
    return true;
  }
  onSubmit() {
    if (this.leaveForm.valid) {
      this.leaveService.addLeave(this.leaveForm.value).subscribe(() => {
        this.showSuccess = true;
        setTimeout(() => this.router.navigate(['/leave']), 1000);
      });
    }
  }
} 
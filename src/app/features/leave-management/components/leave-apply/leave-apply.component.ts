import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div
      *ngIf="role === 'Employee' || role === 'Admin'; else notAllowed"
      class="leave-apply-container"
    >
      <div class="leave-apply-card">
        <div class="leave-apply-header">
          <h2 class="leave-apply-title">
            <i class="fas fa-calendar-plus me-2"></i>Apply for Leave
          </h2>
          <p class="leave-apply-subtitle">
            Submit your leave request for approval
          </p>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section mb-4">
          <div class="progress-bar-container">
            <div class="progress-bar" [style.width]="progress + '%'">
              <span class="progress-text">Step {{ step }} / 4</span>
            </div>
          </div>
          <div class="progress-steps">
            <div class="progress-step" [class.active]="step >= 1">
              <div class="step-dot">1</div>
              <span class="step-label">Type</span>
            </div>
            <div class="progress-step" [class.active]="step >= 2">
              <div class="step-dot">2</div>
              <span class="step-label">Dates</span>
            </div>
            <div class="progress-step" [class.active]="step >= 3">
              <div class="step-dot">3</div>
              <span class="step-label">Reason</span>
            </div>
            <div class="progress-step" [class.active]="step >= 4">
              <div class="step-dot">4</div>
              <span class="step-label">Review</span>
            </div>
          </div>
        </div>

        <!-- Form Navigation Buttons - Moved Above Form -->
        <div class="form-navigation mb-4">
          <button
            *ngIf="step > 1"
            type="button"
            class="btn btn-outline-secondary"
            (click)="previousStep()"
          >
            <i class="fas fa-arrow-left me-2"></i>Previous
          </button>
          <button
            *ngIf="step < 4"
            type="button"
            class="btn btn-odoo"
            (click)="nextStep()"
            [disabled]="!canProceed()"
          >
            Next<i class="fas fa-arrow-right ms-2"></i>
          </button>
          <button
            *ngIf="step === 4"
            type="submit"
            class="btn btn-odoo"
            [disabled]="leaveForm.invalid"
          >
            <i class="fas fa-paper-plane me-2"></i>Submit Request
          </button>
        </div>

        <form
          [formGroup]="leaveForm"
          (ngSubmit)="onSubmit()"
          class="leave-form"
        >
          <!-- Step 1: Leave Type -->
          <div *ngIf="step === 1" class="form-step">
            <h3 class="step-title">
              <i class="fas fa-tag me-2"></i>Select Leave Type
            </h3>
            <div class="form-group">
              <label class="form-label">Leave Type</label>
              <select class="form-select" formControlName="type">
                <option value="">Choose leave type</option>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
                <option value="Personal">Personal Leave</option>
              </select>
              <div
                *ngIf="
                  leaveForm.get('type')?.invalid &&
                  leaveForm.get('type')?.touched
                "
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>Please select a
                leave type
              </div>
            </div>
          </div>

          <!-- Step 2: Dates -->
          <div *ngIf="step === 2" class="form-step">
            <h3 class="step-title">
              <i class="fas fa-calendar me-2"></i>Select Dates
            </h3>
            <div class="row">
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">From Date</label>
                  <input
                    type="date"
                    class="form-control"
                    formControlName="from"
                  />
                  <div
                    *ngIf="
                      leaveForm.get('from')?.invalid &&
                      leaveForm.get('from')?.touched
                    "
                    class="error-message"
                  >
                    <i class="fas fa-exclamation-circle me-1"></i>Please select
                    a start date
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group">
                  <label class="form-label">To Date</label>
                  <input
                    type="date"
                    class="form-control"
                    formControlName="to"
                  />
                  <div
                    *ngIf="
                      leaveForm.get('to')?.invalid &&
                      leaveForm.get('to')?.touched
                    "
                    class="error-message"
                  >
                    <i class="fas fa-exclamation-circle me-1"></i>Please select
                    an end date
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Reason -->
          <div *ngIf="step === 3" class="form-step">
            <h3 class="step-title">
              <i class="fas fa-comment me-2"></i>Reason for Leave
            </h3>
            <div class="form-group">
              <label class="form-label">Reason</label>
              <textarea
                class="form-control"
                formControlName="reason"
                rows="4"
                placeholder="Please provide a detailed reason for your leave request..."
              ></textarea>
              <div
                *ngIf="
                  leaveForm.get('reason')?.invalid &&
                  leaveForm.get('reason')?.touched
                "
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>Please provide a
                reason
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div *ngIf="step === 4" class="form-step">
            <h3 class="step-title">
              <i class="fas fa-eye me-2"></i>Review Your Request
            </h3>
            <div class="review-card">
              <div class="review-item">
                <span class="review-label">Leave Type:</span>
                <span class="review-value">{{
                  leaveForm.get('type')?.value
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">From:</span>
                <span class="review-value">{{
                  leaveForm.get('from')?.value
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">To:</span>
                <span class="review-value">{{
                  leaveForm.get('to')?.value
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Reason:</span>
                <span class="review-value">{{
                  leaveForm.get('reason')?.value
                }}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <ng-template #notAllowed>
      <div class="not-allowed">
        <div class="not-allowed-icon">
          <i class="fas fa-ban"></i>
        </div>
        <h3>Access Denied</h3>
        <p>You don't have permission to apply for leave.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .leave-apply-container {
        padding: 2rem 0;
      }

      .leave-apply-card {
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        padding: 2.5rem;
        max-width: 700px;
        margin: 0 auto;
        border: 1px solid rgba(124, 58, 237, 0.1);
      }

      .leave-apply-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .leave-apply-title {
        color: #1f2937;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .leave-apply-subtitle {
        color: #6b7280;
        font-size: 1rem;
        margin-bottom: 0;
      }

      .progress-section {
        margin-bottom: 2rem;
      }

      .progress-bar-container {
        background: #e5e7eb;
        border-radius: 1rem;
        height: 0.5rem;
        margin-bottom: 1rem;
        overflow: hidden;
      }

      .progress-bar {
        background: linear-gradient(135deg, #7c3aed, #a78bfa);
        height: 100%;
        border-radius: 1rem;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-text {
        position: absolute;
        top: -2rem;
        right: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #7c3aed;
      }

      .progress-steps {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .step-dot {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: #e5e7eb;
        color: #9ca3af;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.3s ease;
      }

      .progress-step.active .step-dot {
        background: linear-gradient(135deg, #7c3aed, #a78bfa);
        color: white;
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
      }

      .step-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
      }

      .progress-step.active .step-label {
        color: #7c3aed;
      }

      .form-step {
        margin-bottom: 2rem;
      }

      .step-title {
        color: #1f2937;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        color: #374151;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
      }

      .form-control,
      .form-select {
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 0.875rem 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #f9fafb;
      }

      .form-control:focus,
      .form-select:focus {
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        background: white;
        outline: none;
      }

      .error-message {
        color: #dc2626;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
      }

      .review-card {
        background: #f8fafc;
        border-radius: 1rem;
        padding: 1.5rem;
        border: 1px solid #e5e7eb;
      }

      .review-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e5e7eb;
      }

      .review-item:last-child {
        border-bottom: none;
      }

      .review-label {
        font-weight: 600;
        color: #374151;
      }

      .review-value {
        color: #6b7280;
      }

      .form-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 2rem;
        gap: 1rem;
      }

      .not-allowed {
        text-align: center;
        padding: 4rem 2rem;
      }

      .not-allowed-icon {
        font-size: 4rem;
        color: #dc2626;
        margin-bottom: 1rem;
      }

      .not-allowed h3 {
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .not-allowed p {
        color: #6b7280;
      }

      @media (max-width: 768px) {
        .leave-apply-card {
          padding: 1.5rem;
          margin: 1rem;
        }

        .leave-apply-title {
          font-size: 1.5rem;
        }

        .progress-steps {
          flex-wrap: wrap;
          gap: 1rem;
        }

        .form-navigation {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .leave-apply-card {
          padding: 1rem;
          margin: 0.5rem;
        }

        .progress-steps {
          flex-direction: column;
          gap: 1rem;
        }

        .review-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
      }
    `,
  ],
})
export class LeaveApplyComponent {
  leaveForm: FormGroup;
  step = 1;
  progress = 25;
  role: UserRole | null = null;

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private router: Router,
    private auth: AuthService
  ) {
    this.leaveForm = this.fb.group({
      type: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
      reason: ['', Validators.required],
    });

    this.auth.getRole().subscribe((role) => {
      this.role = role;
    });
  }

  nextStep() {
    if (this.canProceed() && this.step < 4) {
      this.step++;
      this.progress = this.step * 25;
    }
  }

  previousStep() {
    if (this.step > 1) {
      this.step--;
      this.progress = this.step * 25;
    }
  }

  canProceed(): boolean {
    switch (this.step) {
      case 1:
        return this.leaveForm.get('type')?.valid || false;
      case 2:
        return (
          (this.leaveForm.get('from')?.valid &&
            this.leaveForm.get('to')?.valid) ||
          false
        );
      case 3:
        return this.leaveForm.get('reason')?.valid || false;
      default:
        return false;
    }
  }

  onSubmit() {
    if (this.leaveForm.valid) {
      const leaveData = this.leaveForm.value;
      this.leaveService.addLeave(leaveData).subscribe(() => {
        this.router.navigate(['/leave']);
      });
    }
  }
}

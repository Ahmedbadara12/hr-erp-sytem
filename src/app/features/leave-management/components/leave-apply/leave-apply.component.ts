import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../../core/services/auth.service';
import { ValidationService } from '../../../../shared/services/validation.service';
import {
  AlertComponent,
  AlertType,
} from '../../../../shared/components/alert/alert.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    AlertComponent,
    InputComponent,
  ],
  template: `
    <div
      *ngIf="role === 'Employee' || role === 'Admin'; else notAllowed"
      class="leave-apply-container"
    >
      <div class="leave-apply-card">
        <!-- Alert Messages -->
        <app-alert
          *ngIf="alertMessage"
          [type]="alertType"
          [message]="alertMessage"
          [title]="alertTitle"
          [dismissible]="true"
          [autoDismiss]="true"
          [autoDismissTime]="5000"
          (dismissed)="clearAlert()"
        ></app-alert>

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

        <!-- Form Navigation Buttons -->
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
            type="button"
            class="btn btn-success"
            (click)="submitLeaveRequest()"
            [disabled]="leaveForm.invalid || isSubmitting"
          >
            <i class="fas fa-paper-plane me-2"></i>
            <span *ngIf="!isSubmitting">Submit Request</span>
            <span *ngIf="isSubmitting">Submitting...</span>
          </button>
        </div>

        <form [formGroup]="leaveForm" class="leave-form">
          <!-- Step 1: Leave Type -->
          <div *ngIf="step === 1" class="step-content">
            <h3 class="step-title text-white ">
              <i class="fas fa-list me-2"></i>Select Leave Type
            </h3>
            <div class="form-group">
              <label for="leave-type" class="form-label">
                <i class="fas fa-calendar me-2"></i>Leave Type
                <span class="required-indicator">*</span>
              </label>
              <select
                class="form-control"
                formControlName="leaveType"
                [class.is-invalid]="hasError(leaveForm.get('leaveType')!)"
                [class.is-valid]="isValid(leaveForm.get('leaveType')!)"
                id="leave-type"
                autocomplete="off"
              >
                <option value="">Choose leave type</option>
                <option value="Annual">Annual Leave</option>
                <option value="Sick">Sick Leave</option>
                <option value="Personal">Personal Leave</option>
                <option value="Maternity">Maternity Leave</option>
                <option value="Paternity">Paternity Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
              <div class="input-feedback" *ngIf="showFeedback">
                <div
                  *ngIf="hasError(leaveForm.get('leaveType')!)"
                  class="error-message"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>
                  {{
                    getErrorMessage(leaveForm.get('leaveType')!, 'Leave Type')
                  }}
                </div>
                <div
                  *ngIf="isValid(leaveForm.get('leaveType')!)"
                  class="success-message"
                >
                  <i class="fas fa-check-circle me-1"></i>
                  Leave type selected!
                </div>
              </div>
              <div class="field-help">
                <i class="fas fa-info-circle me-1"></i>
                Select the type of leave you want to apply for
              </div>
            </div>
          </div>

          <!-- Step 2: Dates -->
          <div *ngIf="step === 2" class="step-content">
            <h3 class="step-title text-white ">
              <i class="fas fa-calendar-alt text-white me-2"></i>Select Dates
            </h3>
            <div class="row">
              <div class="col-md-6">
                <app-input
                  label="Start Date"
                  type="date"
                  [control]="startDateControl"
                  placeholder="Select start date"
                  icon="fas fa-calendar"
                  [required]="true"
                  helpText="Select the start date of your leave"
                  successMessage="Start date is valid!"
                  fieldId="leave-start-date"
                  autocomplete="date"
                ></app-input>
              </div>
              <div class="col-md-6">
                <app-input
                  label="End Date"
                  type="date"
                  [control]="endDateControl"
                  placeholder="Select end date"
                  icon="fas fa-calendar"
                  [required]="true"
                  helpText="Select the end date of your leave"
                  successMessage="End date is valid!"
                  fieldId="leave-end-date"
                  autocomplete="date"
                ></app-input>
              </div>
            </div>
            <div class="form-group">
              <app-input
                label="Number of Days"
                type="number"
                [control]="daysControl"
                placeholder="Enter number of days"
                icon="fas fa-calculator"
                [required]="true"
                helpText="Enter the total number of leave days"
                successMessage="Days count is valid!"
                fieldId="leave-days"
                autocomplete="off"
              ></app-input>
            </div>
          </div>

          <!-- Step 3: Reason -->
          <div *ngIf="step === 3" class="step-content">
            <h3 class="step-title text-white ">
              <i class="fas fa-comment me-2"></i>Provide Reason
            </h3>
            <div class="form-group">
              <label for="leave-reason" class="form-label">
                <i class="fas fa-edit me-2"></i>Reason for Leave
                <span class="required-indicator">*</span>
              </label>
              <textarea
                class="form-control"
                formControlName="reason"
                rows="4"
                placeholder="Please provide a detailed reason for your leave request..."
                [class.is-invalid]="hasError(leaveForm.get('reason')!)"
                [class.is-valid]="isValid(leaveForm.get('reason')!)"
                id="leave-reason"
                autocomplete="off"
              ></textarea>
              <div class="input-feedback" *ngIf="showFeedback">
                <div
                  *ngIf="hasError(leaveForm.get('reason')!)"
                  class="error-message"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>
                  {{ getErrorMessage(leaveForm.get('reason')!, 'Reason') }}
                </div>
                <div
                  *ngIf="isValid(leaveForm.get('reason')!)"
                  class="success-message"
                >
                  <i class="fas fa-check-circle me-1"></i>
                  Reason looks good!
                </div>
              </div>
              <div class="field-help">
                <i class="fas fa-info-circle me-1"></i>
                Provide a detailed explanation for your leave request (10-500
                characters)
              </div>
            </div>
          </div>

          <!-- Step 4: Review -->
          <div *ngIf="step === 4" class="step-content">
            <h3 class="step-title">
              <i class="fas fa-eye me-2"></i>Review Your Request
            </h3>
            <div class="review-summary">
              <div class="review-item">
                <span class="review-label">Leave Type:</span>
                <span class="review-value">{{
                  leaveForm.get('leaveType')?.value
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Start Date:</span>
                <span class="review-value">{{
                  leaveForm.get('startDate')?.value | date : 'mediumDate'
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">End Date:</span>
                <span class="review-value">{{
                  leaveForm.get('endDate')?.value | date : 'mediumDate'
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Days:</span>
                <span class="review-value"
                  >{{ leaveForm.get('days')?.value }} days</span
                >
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
      <div class="not-allowed-container">
        <div class="not-allowed-card">
          <div class="not-allowed-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3 class="not-allowed-title">Access Denied</h3>
          <p class="not-allowed-message">
            You don't have permission to apply for leave with your current role.
          </p>
          <a class="btn btn-odoo" [routerLink]="['/']">
            <i class="fas fa-home me-2"></i>Go to Dashboard
          </a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .leave-apply-container {
        padding: 2rem;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .leave-apply-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
      }

      .leave-apply-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .leave-apply-title {
        color: #2d3748;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .leave-apply-subtitle {
        color: #718096;
        font-size: 1.1rem;
      }

      .progress-section {
        margin-bottom: 2rem;
      }

      .progress-bar-container {
        background: #e2e8f0;
        border-radius: 1rem;
        height: 0.5rem;
        margin-bottom: 1rem;
        overflow: hidden;
      }

      .progress-bar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        height: 100%;
        border-radius: 1rem;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
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
        background: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a0aec0;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .progress-step.active .step-dot {
        background: #667eea;
        color: white;
      }

      .step-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
      }

      .form-navigation {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-odoo {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-odoo:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }

      .btn-outline-secondary {
        background: transparent;
        color: #4a5568;
        border: 2px solid #e2e8f0;
      }

      .btn-outline-secondary:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
      }

      .btn-success {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
        color: white;
      }

      .btn-success:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(72, 187, 120, 0.3);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .step-content {
        margin-top: 2rem;
      }

      .step-title {
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: flex;
        align-items: center;
        font-weight: 700;
        color: #000000;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
      }

      .required-indicator {
        color: #e53e3e;
        margin-left: 0.25rem;
        font-weight: 700;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: var(--surface-primary);
        color: #2d3748;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-control.is-valid {
        border-color: #48bb78;
        background-color: #f0fff4;
      }

      .form-control.is-invalid {
        border-color: #f56565;
        background-color: #fff5f5;
      }

      .input-feedback {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }

      .error-message {
        color: #e53e3e;
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .success-message {
        color: #38a169;
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .field-help {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #718096;
        display: flex;
        align-items: center;
      }

      .review-summary {
        background: #f7fafc;
        border-radius: 0.75rem;
        padding: 1.5rem;
        border: 1px solid #e2e8f0;
      }

      .review-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e2e8f0;
      }

      .review-item:last-child {
        border-bottom: none;
      }

      .review-label {
        font-weight: 600;
        color: #4a5568;
      }

      .review-value {
        color: #2d3748;
        font-weight: 500;
      }

      .not-allowed-container {
        padding: 2rem;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .not-allowed-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 3rem;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 500px;
      }

      .not-allowed-icon {
        font-size: 4rem;
        color: #f56565;
        margin-bottom: 1rem;
      }

      .not-allowed-title {
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      .not-allowed-message {
        color: #718096;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .leave-apply-container {
          padding: 1rem;
        }

        .leave-apply-card {
          padding: 1.5rem;
        }

        .leave-apply-title {
          font-size: 1.5rem;
        }

        .leave-apply-subtitle {
          font-size: 1rem;
        }

        .form-navigation {
          flex-direction: column;
        }

        .btn {
          width: 100%;
          justify-content: center;
        }

        .progress-steps {
          gap: 0.5rem;
        }

        .step-label {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class LeaveApplyComponent {
  leaveForm: FormGroup;
  step = 1;
  progress = 25;
  role: UserRole = 'Employee';
  isSubmitting = false;

  // Alert properties
  alertMessage = '';
  alertType: AlertType = 'info';
  alertTitle = '';
  showFeedback = true;

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private router: Router,
    private authService: AuthService,
    private validationService: ValidationService
  ) {
    this.leaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      startDate: [
        '',
        [Validators.required, this.validationService.dateValidator()],
      ],
      endDate: [
        '',
        [Validators.required, this.validationService.dateValidator()],
      ],
      days: ['', [Validators.required, Validators.min(1), Validators.max(365)]],
      reason: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Get user role
    this.authService.getRole().subscribe((role) => {
      if (role) this.role = role;
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
        const leaveTypeControl = this.leaveForm.get('leaveType');
        if (leaveTypeControl && !leaveTypeControl.touched) {
          leaveTypeControl.markAsTouched();
        }
        return leaveTypeControl?.valid || false;
      case 2:
        const startDateControl = this.leaveForm.get('startDate');
        const endDateControl = this.leaveForm.get('endDate');
        const daysControl = this.leaveForm.get('days');

        if (startDateControl && !startDateControl.touched) {
          startDateControl.markAsTouched();
        }
        if (endDateControl && !endDateControl.touched) {
          endDateControl.markAsTouched();
        }
        if (daysControl && !daysControl.touched) {
          daysControl.markAsTouched();
        }

        return (
          (startDateControl?.valid &&
            endDateControl?.valid &&
            daysControl?.valid) ||
          false
        );
      case 3:
        const reasonControl = this.leaveForm.get('reason');
        if (reasonControl && !reasonControl.touched) {
          reasonControl.markAsTouched();
        }
        return reasonControl?.valid || false;
      default:
        return false;
    }
  }

  submitLeaveRequest() {
    if (this.leaveForm.valid) {
      this.isSubmitting = true;
      const leaveData = this.leaveForm.value;
      setTimeout(() => {
        this.leaveService.applyLeave(leaveData).subscribe({
          next: () => {
            this.showAlert(
              'success',
              'Leave Request Submitted',
              'Your leave request has been submitted successfully and is pending approval.'
            );
            setTimeout(() => {
              this.router.navigate(['/leave']);
            }, 2000);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showAlert(
              'danger',
              'Submission Failed',
              'Failed to submit leave request. Please try again.'
            );
          },
        });
      }, 1000);
    } else {
      this.markFormGroupTouched();
      this.showAlert(
        'warning',
        'Validation Error',
        'Please fix the errors in the form before submitting.'
      );
    }
  }

  markFormGroupTouched() {
    Object.values(this.leaveForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  // Validation helper methods
  hasError(control: any): boolean {
    return this.validationService.hasError(control);
  }

  isValid(control: any): boolean {
    return this.validationService.isValid(control);
  }

  getErrorMessage(control: any, fieldName: string): string {
    return this.validationService.getErrorMessage(control, fieldName);
  }

  // Alert methods
  showAlert(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
  }

  clearAlert() {
    this.alertMessage = '';
    this.alertTitle = '';
  }

  // Getter methods for form controls to avoid type casting issues
  get startDateControl(): FormControl {
    return this.leaveForm.get('startDate') as FormControl;
  }
  get endDateControl(): FormControl {
    return this.leaveForm.get('endDate') as FormControl;
  }
  get daysControl(): FormControl {
    return this.leaveForm.get('days') as FormControl;
  }
}

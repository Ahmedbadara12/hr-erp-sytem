import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { IEmployee } from '../../../../shared/models/employee.model';
import { ValidationService } from '../../../../shared/services/validation.service';
import {
  AlertComponent,
  AlertType,
} from '../../../../shared/components/alert/alert.component';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent,
    InputComponent,
  ],
  template: `
    <div class="form-container">
      <div class="form-card">
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

        <div class="form-header">
          <h2 class="form-title">
            <i class="fas fa-user-plus me-2"></i>
            {{ isEditMode ? 'Edit' : 'Create' }} Employee
          </h2>
          <p class="form-subtitle">
            {{
              isEditMode
                ? 'Update employee information'
                : 'Add a new employee to the system'
            }}
          </p>
        </div>

        <!-- Progress Indicator -->
        <div class="progress-indicator mb-4">
          <div class="progress-step active">
            <div class="progress-dot">
              <i class="fas fa-user"></i>
            </div>
            <span class="progress-label">Basic Info</span>
          </div>
          <div class="progress-line"></div>
          <div class="progress-step">
            <div class="progress-dot">
              <i class="fas fa-id-card"></i>
            </div>
            <span class="progress-label">Profile</span>
          </div>
        </div>

        <!-- Form Action Buttons -->
        <div class="form-actions mb-4">
          <button
            class="btn btn-odoo"
            type="submit"
            [disabled]="employeeForm.invalid || isSubmitting"
            (click)="onSubmit()"
          >
            <i class="fas fa-save me-2"></i>
            <span *ngIf="!isSubmitting"
              >{{ isEditMode ? 'Update' : 'Save' }} Employee</span
            >
            <span *ngIf="isSubmitting">Saving...</span>
          </button>
          <a class="btn btn-outline-secondary" [routerLink]="['/employee']">
            <i class="fas fa-times me-2"></i>Cancel
          </a>
        </div>

        <form
          *ngIf="!showSuccess"
          [formGroup]="employeeForm"
          (ngSubmit)="onSubmit()"
          class="employee-form"
        >
          <div class="row">
            <div class="col-md-6">
              <app-input
                label="Full Name"
                type="text"
                [control]="nameControl"
                placeholder="Enter full name"
                icon="fas fa-user"
                [required]="true"
                helpText="Enter the employee's full name (2-50 characters)"
                successMessage="Name looks good!"
                fieldId="employee-name"
                autocomplete="name"
              ></app-input>
            </div>

            <div class="col-md-6">
              <app-input
                label="Email Address"
                type="email"
                [control]="emailControl"
                placeholder="Enter email address"
                icon="fas fa-envelope"
                [required]="true"
                helpText="Enter a valid email address"
                successMessage="Email is valid!"
                fieldId="employee-email"
                autocomplete="email"
              ></app-input>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <app-input
                label="Position"
                type="text"
                [control]="positionControl"
                placeholder="Enter job position"
                icon="fas fa-briefcase"
                [required]="true"
                helpText="Enter the employee's job position"
                successMessage="Position looks good!"
                fieldId="employee-position"
                autocomplete="off"
              ></app-input>
            </div>

            <div class="col-md-6">
              <app-input
                label="Department"
                type="text"
                [control]="departmentControl"
                placeholder="Enter department"
                icon="fas fa-building"
                [required]="true"
                helpText="Enter the employee's department"
                successMessage="Department looks good!"
                fieldId="employee-department"
                autocomplete="off"
              ></app-input>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <app-input
                label="Phone Number"
                type="tel"
                [control]="phoneControl"
                placeholder="Enter phone number"
                icon="fas fa-phone"
                [required]="true"
                helpText="Enter a valid phone number"
                successMessage="Phone number is valid!"
                fieldId="employee-phone"
                autocomplete="tel"
              ></app-input>
            </div>

            <div class="col-md-6">
              <app-input
                label="Date of Birth"
                type="date"
                [control]="dateOfBirthControl"
                placeholder="Select date of birth"
                icon="fas fa-calendar"
                [required]="true"
                helpText="Select the employee's date of birth"
                successMessage="Date of birth is valid!"
                fieldId="employee-date-of-birth"
                autocomplete="bday"
              ></app-input>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <app-input
                label="Hire Date"
                type="date"
                [control]="hireDateControl!"
                placeholder="Select hire date"
                icon="fas fa-calendar-check"
                [required]="true"
                helpText="Select the employee's hire date"
                successMessage="Hire date is valid!"
                fieldId="employee-hire-date"
                autocomplete="off"
              ></app-input>
            </div>

            <div class="col-md-6">
              <app-input
                label="Salary"
                type="number"
                [control]="salaryControl!"
                placeholder="Enter salary amount"
                icon="fas fa-dollar-sign"
                [required]="true"
                helpText="Enter the employee's salary (numbers only)"
                successMessage="Salary is valid!"
                fieldId="employee-salary"
                autocomplete="off"
              ></app-input>
            </div>
          </div>

          <div class="form-group">
            <label for="employee-address" class="form-label">
              <i class="fas fa-map-marker-alt me-2"></i>Address
              <span class="required-indicator">*</span>
            </label>
            <textarea
              id="employee-address"
              class="form-control"
              formControlName="address"
              rows="3"
              placeholder="Enter full address"
              autocomplete="street-address"
              [class.is-invalid]="hasError(employeeForm.get('address')!)"
              [class.is-valid]="isValid(employeeForm.get('address')!)"
            ></textarea>
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(employeeForm.get('address')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ getErrorMessage(employeeForm.get('address')!, 'Address') }}
              </div>
              <div
                *ngIf="isValid(employeeForm.get('address')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Address looks good!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Enter the employee's full address
            </div>
          </div>

          <div class="form-group">
            <label for="employee-emergency-contact" class="form-label">
              <i class="fas fa-phone-alt me-2"></i>Emergency Contact
            </label>
            <input
              id="employee-emergency-contact"
              class="form-control"
              formControlName="emergencyContact"
              placeholder="Enter emergency contact number"
              autocomplete="tel"
              [class.is-invalid]="
                hasError(employeeForm.get('emergencyContact')!)
              "
              [class.is-valid]="isValid(employeeForm.get('emergencyContact')!)"
            />
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(employeeForm.get('emergencyContact')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{
                  getErrorMessage(
                    employeeForm.get('emergencyContact')!,
                    'Emergency Contact'
                  )
                }}
              </div>
              <div
                *ngIf="isValid(employeeForm.get('emergencyContact')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Emergency contact is valid!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Enter emergency contact phone number
            </div>
          </div>
        </form>

        <!-- Success Message -->
        <div *ngIf="showSuccess" class="success-container">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3 class="success-title">
            Employee {{ isEditMode ? 'Updated' : 'Created' }} Successfully!
          </h3>
          <p class="success-message">
            The employee has been
            {{ isEditMode ? 'updated' : 'created' }} successfully.
          </p>
          <div class="success-actions">
            <button class="btn btn-odoo" (click)="goToProfile()">
              <i class="fas fa-user me-2"></i>View Profile
            </button>
            <a class="btn btn-outline-secondary" [routerLink]="['/employee']">
              <i class="fas fa-list me-2"></i>Back to List
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .form-container {
        padding: 2rem;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .form-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
      }

      .form-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .form-title {
        color: #2d3748;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .form-subtitle {
        color: #718096;
        font-size: 1.1rem;
      }

      .progress-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
      }

      .progress-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
      }

      .progress-dot {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #a0aec0;
        transition: all 0.3s ease;
      }

      .progress-step.active .progress-dot {
        background: #667eea;
        color: white;
      }

      .progress-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #4a5568;
      }

      .progress-line {
        width: 60px;
        height: 2px;
        background: #e2e8f0;
        margin: 0 1rem;
      }

      .form-actions {
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

      .btn-odoo:hover {
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

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .employee-form {
        margin-top: 2rem;
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

      .success-container {
        text-align: center;
        padding: 3rem 2rem;
      }

      .success-icon {
        font-size: 4rem;
        color: #48bb78;
        margin-bottom: 1rem;
      }

      .success-title {
        color: #2d3748;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }

      .success-message {
        color: #718096;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .success-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .form-container {
          padding: 1rem;
        }

        .form-card {
          padding: 1.5rem;
        }

        .form-title {
          font-size: 1.5rem;
        }

        .form-subtitle {
          font-size: 1rem;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
          justify-content: center;
        }

        .success-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  showSuccess = false;
  isSubmitting = false;
  private employeeId?: number;
  newEmployeeId?: number;

  // Alert properties
  alertMessage = '';
  alertType: AlertType = 'info';
  alertTitle = '';
  showFeedback = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private validationService: ValidationService
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, this.validationService.nameValidator()]],
      email: [
        '',
        [Validators.required, this.validationService.emailValidator()],
      ],
      position: [
        '',
        [Validators.required, this.validationService.alphanumericValidator()],
      ],
      department: [
        '',
        [Validators.required, this.validationService.alphanumericValidator()],
      ],
      phone: [
        '',
        [Validators.required, this.validationService.phoneValidator()],
      ],
      dateOfBirth: [
        '',
        [Validators.required, this.validationService.dateValidator()],
      ],
      hireDate: [
        '',
        [Validators.required, this.validationService.dateValidator()],
      ],
      salary: [
        '',
        [Validators.required, this.validationService.decimalValidator()],
      ],
      address: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      emergencyContact: ['', [this.validationService.phoneValidator()]],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.employeeId = +id;
      this.loadEmployee();
    }
  }

  loadEmployee() {
    if (this.employeeId) {
      this.employeeService.getEmployeeById(this.employeeId).subscribe({
        next: (employee) => {
          if (employee) {
            this.employeeForm.patchValue(employee);
          } else {
            this.showAlert(
              'danger',
              'Employee Not Found',
              'No employee found with the provided ID.'
            );
          }
        },
        error: (error) => {
          this.showAlert(
            'danger',
            'Error loading employee',
            'Failed to load employee data. Please try again.'
          );
        },
      });
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      this.isSubmitting = true;
      const employeeData: IEmployee = this.employeeForm.value;

      if (this.isEditMode && this.employeeId) {
        this.employeeService
          .updateEmployee(this.employeeId, employeeData)
          .subscribe({
            next: () => {
              this.showSuccess = true;
              this.showAlert(
                'success',
                'Employee Updated',
                'Employee information has been updated successfully.'
              );
            },
            error: (error) => {
              this.isSubmitting = false;
              this.showAlert(
                'danger',
                'Update Failed',
                'Failed to update employee. Please try again.'
              );
            },
          });
      } else {
        this.employeeService.createEmployee(employeeData).subscribe({
          next: (newEmployee) => {
            this.newEmployeeId = newEmployee.id;
            this.showSuccess = true;
            this.showAlert(
              'success',
              'Employee Created',
              'New employee has been created successfully.'
            );
          },
          error: (error) => {
            this.isSubmitting = false;
            this.showAlert(
              'danger',
              'Creation Failed',
              'Failed to create employee. Please try again.'
            );
          },
        });
      }
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
    Object.values(this.employeeForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  goToProfile() {
    if (this.newEmployeeId) {
      this.router.navigate(['/employee/profile', this.newEmployeeId]);
    } else if (this.employeeId) {
      this.router.navigate(['/employee/profile', this.employeeId]);
    }
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
  get nameControl(): FormControl {
    return this.employeeForm.get('name') as FormControl;
  }

  get emailControl(): FormControl {
    return this.employeeForm.get('email') as FormControl;
  }

  get positionControl(): FormControl {
    return this.employeeForm.get('position') as FormControl;
  }

  get departmentControl(): FormControl {
    return this.employeeForm.get('department') as FormControl;
  }

  get phoneControl(): FormControl {
    return this.employeeForm.get('phone') as FormControl;
  }

  get dateOfBirthControl(): FormControl {
    return this.employeeForm.get('dateOfBirth') as FormControl;
  }

  get hireDateControl(): FormControl | null {
    return this.employeeForm.get('hireDate') as FormControl | null;
  }

  get salaryControl(): FormControl | null {
    return this.employeeForm.get('salary') as FormControl | null;
  }
}

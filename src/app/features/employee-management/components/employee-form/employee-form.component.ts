import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { IEmployee } from '../../../../shared/models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="form-container">
      <div class="form-card">
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

        <!-- Form Action Buttons - Moved Above Form -->
        <div class="form-actions mb-4">
          <button
            class="btn btn-odoo"
            type="submit"
            [disabled]="employeeForm.invalid"
            (click)="onSubmit()"
          >
            <i class="fas fa-save me-2"></i>
            {{ isEditMode ? 'Update' : 'Save' }} Employee
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
              <div class="form-group">
                <label for="name" class="form-label">
                  <i class="fas fa-user me-2"></i>Full Name
                </label>
                <input
                  id="name"
                  class="form-control"
                  formControlName="name"
                  placeholder="Enter full name"
                />
                <div
                  *ngIf="
                    employeeForm.get('name')?.invalid &&
                    employeeForm.get('name')?.touched
                  "
                  class="error-message"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>Name is required
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="email" class="form-label">
                  <i class="fas fa-envelope me-2"></i>Email Address
                </label>
                <input
                  id="email"
                  class="form-control"
                  formControlName="email"
                  type="email"
                  placeholder="Enter email address"
                />
                <div
                  *ngIf="
                    employeeForm.get('email')?.invalid &&
                    employeeForm.get('email')?.touched
                  "
                  class="error-message"
                >
                  <i class="fas fa-exclamation-circle me-1"></i>Valid email is
                  required
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="position" class="form-label">
                  <i class="fas fa-briefcase me-2"></i>Position
                </label>
                <input
                  id="position"
                  class="form-control"
                  formControlName="position"
                  placeholder="Enter job position"
                />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="department" class="form-label">
                  <i class="fas fa-building me-2"></i>Department
                </label>
                <input
                  id="department"
                  class="form-control"
                  formControlName="department"
                  placeholder="Enter department"
                />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="phone" class="form-label">
                  <i class="fas fa-phone me-2"></i>Phone Number
                </label>
                <input
                  id="phone"
                  class="form-control"
                  formControlName="phone"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div class="col-md-6">
              <div class="form-group">
                <label for="dateOfBirth" class="form-label">
                  <i class="fas fa-calendar me-2"></i>Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  class="form-control"
                  formControlName="dateOfBirth"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="address" class="form-label">
              <i class="fas fa-map-marker-alt me-2"></i>Address
            </label>
            <textarea
              id="address"
              class="form-control"
              formControlName="address"
              rows="3"
              placeholder="Enter full address"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="hireDate" class="form-label">
              <i class="fas fa-calendar-check me-2"></i>Hire Date
            </label>
            <input
              id="hireDate"
              type="date"
              class="form-control"
              formControlName="hireDate"
            />
          </div>
        </form>

        <div *ngIf="showSuccess" class="success-message">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Employee saved successfully!</h3>
          <p>
            Employee information has been
            {{ isEditMode ? 'updated' : 'created' }} successfully.
          </p>
          <button class="btn btn-odoo" (click)="goToProfile()">
            <i class="fas fa-user me-2"></i>View Profile
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .form-container {
        padding: 2rem 0;
      }

      .form-card {
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        padding: 2.5rem;
        max-width: 800px;
        margin: 0 auto;
        border: 1px solid rgba(124, 58, 237, 0.1);
      }

      .form-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .form-title {
        color: #1f2937;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .form-subtitle {
        color: #6b7280;
        font-size: 1rem;
        margin-bottom: 0;
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
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        font-size: 1.2rem;
        transition: all 0.3s ease;
      }

      .progress-step.active .progress-dot {
        background: linear-gradient(135deg, #7c3aed, #a78bfa);
        color: white;
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
      }

      .progress-label {
        font-size: 0.9rem;
        font-weight: 600;
        color: #6b7280;
      }

      .progress-step.active .progress-label {
        color: #7c3aed;
      }

      .progress-line {
        width: 100px;
        height: 2px;
        background: #e5e7eb;
        margin: 0 1rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        color: #374151;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
      }

      .form-control {
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 0.875rem 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #f9fafb;
      }

      .form-control:focus {
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

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        justify-content: center;
      }

      .success-message {
        text-align: center;
        padding: 2rem;
      }

      .success-icon {
        font-size: 4rem;
        color: #10b981;
        margin-bottom: 1rem;
      }

      .success-message h3 {
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .success-message p {
        color: #6b7280;
        margin-bottom: 1.5rem;
      }

      @media (max-width: 768px) {
        .form-card {
          padding: 1.5rem;
          margin: 1rem;
        }

        .form-title {
          font-size: 1.5rem;
        }

        .progress-line {
          width: 60px;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .form-card {
          padding: 1rem;
          margin: 0.5rem;
        }

        .progress-indicator {
          flex-direction: column;
          gap: 1rem;
        }

        .progress-line {
          width: 2px;
          height: 40px;
        }
      }
    `,
  ],
})
export class EmployeeFormComponent implements OnInit {
  employeeForm: FormGroup;
  isEditMode = false;
  showSuccess = false;
  private employeeId?: number;
  newEmployeeId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService
  ) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      position: [''],
      department: [''],
      phone: [''],
      address: [''],
      dateOfBirth: [''],
      hireDate: [''],
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.employeeId = +id;
        this.employeeService
          .getEmployeeById(this.employeeId)
          .subscribe((emp) => {
            if (emp) {
              this.employeeForm.patchValue(emp);
            }
          });
      }
    });
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const employee: IEmployee = this.employeeForm.value;
      if (this.isEditMode && this.employeeId != null) {
        // Update existing employee
        this.employeeService
          .updateEmployee(this.employeeId, employee)
          .subscribe(() => {
            this.showSuccess = true;
            setTimeout(() => {
              this.router.navigate(['/employee']);
            }, 2000);
          });
      } else {
        // Create new employee
        this.employeeService.addEmployee(employee).subscribe((emp) => {
          this.showSuccess = true;
          this.newEmployeeId = emp.id;
        });
      }
    }
  }

  goToProfile() {
    if (this.newEmployeeId) {
      this.router.navigate(['/employee', 'profile', this.newEmployeeId]);
    } else {
      this.router.navigate(['/employee']);
    }
  }
}

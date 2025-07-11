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
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">{{ isEditMode ? 'Edit' : 'Create' }} Employee</h5>
      </div>
      <div class="card-body">
        <!-- Step Indicator -->
        <div class="mb-4 d-flex align-items-center">
          <div class="badge bg-primary me-2">1</div>
          <span class="fw-bold">Basic Info</span>
          <span class="mx-2">→</span>
          <div class="badge bg-secondary me-2">2</div>
          <span>Profile</span>
        </div>
        <form
          *ngIf="!showSuccess"
          [formGroup]="employeeForm"
          (ngSubmit)="onSubmit()"
        >
          <!-- Name -->
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input id="name" class="form-control" formControlName="name" />
            <div
              *ngIf="
                employeeForm.get('name')?.invalid &&
                employeeForm.get('name')?.touched
              "
              class="text-danger"
            >
              Name is required.
            </div>
          </div>
          <!-- Email -->
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input id="email" class="form-control" formControlName="email" />
            <div
              *ngIf="
                employeeForm.get('email')?.invalid &&
                employeeForm.get('email')?.touched
              "
              class="text-danger"
            >
              Valid email is required.
            </div>
          </div>
          <!-- Position -->
          <div class="mb-3">
            <label for="position" class="form-label">Position</label>
            <input
              id="position"
              class="form-control"
              formControlName="position"
            />
          </div>
          <!-- Department -->
          <div class="mb-3">
            <label for="department" class="form-label">Department</label>
            <input
              id="department"
              class="form-control"
              formControlName="department"
            />
          </div>
          <!-- Phone -->
          <div class="mb-3">
            <label for="phone" class="form-label">Phone</label>
            <input id="phone" class="form-control" formControlName="phone" />
          </div>
          <!-- Address -->
          <div class="mb-3">
            <label for="address" class="form-label">Address</label>
            <input
              id="address"
              class="form-control"
              formControlName="address"
            />
          </div>
          <!-- Date of Birth -->
          <div class="mb-3">
            <label for="dateOfBirth" class="form-label">Date of Birth</label>
            <input
              id="dateOfBirth"
              type="date"
              class="form-control"
              formControlName="dateOfBirth"
            />
          </div>
          <!-- Hire Date -->
          <div class="mb-3">
            <label for="hireDate" class="form-label">Hire Date</label>
            <input
              id="hireDate"
              type="date"
              class="form-control"
              formControlName="hireDate"
            />
          </div>
          <button
            class="btn btn-primary"
            type="submit"
            [disabled]="employeeForm.invalid"
          >
            Save
          </button>
          <a class="btn btn-secondary ms-2" [routerLink]="['/employee']"
            >Cancel</a
          >
        </form>
        <div
          *ngIf="showSuccess"
          class="alert alert-success mt-3 d-flex flex-column align-items-center"
        >
          <div>Employee saved successfully!</div>
          <button class="btn btn-primary mt-3" (click)="goToProfile()">
            Next: Complete Profile
          </button>
        </div>
      </div>
    </div>
  `,
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
            }, 1000);
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

import { Component, OnInit, Inject } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { IEmployee } from '../../../../shared/models/employee.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService, UserRole } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { CsvUtilService } from '../../../../shared/services/csv-util.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="table-card">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div class="section-title mb-0"><i class="fas fa-users"></i> Employee List</div>
        <div class="action-btn-container d-flex gap-2 p-2">
          <a class="btn btn-odoo" [routerLink]="['/employee', 'create']" *ngIf="role === 'HR' || role === 'Admin'">
            <i class="fas fa-plus"></i> Add Employee
          </a>
          <button class="btn btn-outline-secondary" (click)="exportEmployees()" *ngIf="role === 'HR' || role === 'Admin'">
            <i class="fas fa-file-export"></i> Export CSV
          </button>
          <label class="btn btn-outline-secondary mb-0" *ngIf="role === 'HR' || role === 'Admin'">
            <i class="fas fa-file-import"></i> Import CSV
            <input type="file" accept=".csv" (change)="importEmployees($event)" hidden />
          </label>
        </div>
      </div>
      <ng-container *ngIf="employees$ | async as employees; else loading">
        <!-- Desktop Table -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-striped payroll-table mb-0">
            <thead class="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Department</th>
                <th style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees">
                <td>{{ emp.name }}</td>
                <td>{{ emp.email }}</td>
                <td>{{ emp.position }}</td>
                <td>{{ emp.department }}</td>
                <td>
                  <a class="btn btn-sm btn-info me-1 mb-1" [routerLink]="['/employee', 'profile', emp.id]">
                    <i class="fas fa-user"></i>
                  </a>
                  <a class="btn btn-sm btn-warning me-1 mb-1" [routerLink]="['/employee', 'edit', emp.id]" *ngIf="role === 'HR' || role === 'Admin'">
                    <i class="fas fa-edit"></i>
                  </a>
                  <button class="btn btn-sm btn-danger mb-1" (click)="deleteEmployee(emp.id)" *ngIf="role === 'HR' || role === 'Admin'">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Mobile Card List -->
        <div class="d-block d-md-none">
          <div *ngIf="employees.length === 0" class="text-center text-muted py-4">
            <i class="fas fa-inbox fa-2x mb-3"></i>
            <p>No employees found.</p>
          </div>
          <div *ngFor="let emp of employees" class="employee-card mb-3">
            <div class="employee-card-body">
              <div class="d-flex align-items-center mb-2">
                <span class="fw-bold text-primary me-2">{{ emp.name }}</span>
              </div>
              <div class="mb-1"><b>Email:</b> <span class="text-secondary">{{ emp.email }}</span></div>
              <div class="mb-1"><b>Position:</b> <span class="text-secondary">{{ emp.position }}</span></div>
              <div class="mb-2"><b>Department:</b> <span class="text-secondary">{{ emp.department }}</span></div>
              <div class="d-flex gap-2 mt-2 employee-card-actions">
                <a class="btn btn-info btn-sm" [routerLink]="['/employee', 'profile', emp.id]">
                  <i class="fas fa-user me-1"></i> Profile
                </a>
                <a class="btn btn-warning btn-sm" [routerLink]="['/employee', 'edit', emp.id]" *ngIf="role === 'HR' || role === 'Admin'">
                  <i class="fas fa-edit me-1"></i> Edit
                </a>
                <button class="btn btn-danger btn-sm" (click)="deleteEmployee(emp.id)" *ngIf="role === 'HR' || role === 'Admin'">
                  <i class="fas fa-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
      <ng-template #loading>
        <app-loading-spinner></app-loading-spinner>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .table td,
      .table th {
        vertical-align: middle;
      }
      .table-card {
        background: var(--surface-primary);
        border-radius: 1.1em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.06);
        padding: 1.5em 1em;
        margin-bottom: 1.5em;
        border: 1px solid var(--border-light);
      }
      .table {
        background: var(--surface-primary);
        color: var(--text-primary);
      }
      .table th,
      .table td {
        background: var(--surface-primary);
        color: var(--text-primary);
      }
      .table-light th {
        background: var(--surface-secondary);
        color: var(--text-primary);
      }
      .table-striped tbody tr:nth-of-type(odd) {
        background: var(--surface-secondary);
      }
      .table-striped tbody tr:nth-of-type(even) {
        background: var(--surface-primary);
      }
      .action-btn-container {
        background: var(--surface-secondary);
        border-radius: 1.1em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.06);
        padding: 0.7em 1em;
        margin-bottom: 0.5em;
        display: flex;
        flex-wrap: wrap;
        gap: 0.7em;
      }
      .btn-info {
        background: var(--primary-light) !important;
        color: var(--primary-dark) !important;
        border: none;
      }
      .btn-info:hover {
        background: var(--primary) !important;
        color: #fff !important;
      }
      .btn-warning {
        background: var(--warning, #fde68a) !important;
        color: #92400e !important;
        border: none;
      }
      .btn-warning:hover {
        background: #fbbf24 !important;
        color: #fff !important;
      }
      .btn-danger {
        background: var(--danger, #ef4444) !important;
        color: #fff !important;
        border: none;
      }
      .btn-danger:hover {
        background: #b91c1c !important;
        color: #fff !important;
      }
      .action-btn-container .btn-outline-secondary {
        color: var(--primary) !important;
        background: var(--surface-primary) !important;
        border: 1.5px solid var(--primary) !important;
        font-weight: 600;
      }
      .action-btn-container .btn-outline-secondary:hover {
        background: var(--primary) !important;
        color: #fff !important;
        border: 1.5px solid var(--primary) !important;
      }
      /* Mobile Card Styles */
      .employee-card {
        background: var(--surface-secondary);
        border-radius: 1.1em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
        padding: 1.1em 1em 0.7em 1em;
        margin-bottom: 1.2em;
        border: 1px solid var(--border-light);
      }
      .employee-card-body {
        display: flex;
        flex-direction: column;
      }
      .employee-card .btn {
        width: 100%;
        min-width: 160px;
        max-width: 100%;
        margin: 0.25em 0;
        font-size: 1em;
        padding: 0.7em 0.7em;
        border-radius: 0.7em;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .employee-card .btn:last-child {
        margin-bottom: 0;
      }
      .employee-card .fw-bold {
        font-size: 1.08em;
      }
      .employee-card .text-secondary {
        font-size: 0.97em;
      }
      .employee-card-actions {
        display: flex;
        flex-direction: column;
        gap: 0.7em;
        width: 100%;
        align-items: center;
        margin-top: 0.5em;
      }
      @media (max-width: 991.98px) {
        .table {
          font-size: 0.95rem;
        }
      }
      @media (max-width: 480px) {
        .employee-card {
          padding: 0.9em 0.7em 0.6em 0.7em;
        }
        .employee-card .btn {
          font-size: 0.95em;
          padding: 0.6em 0.6em;
        }
        .employee-card .fw-bold {
          font-size: 1em;
        }
        .employee-card .text-secondary {
          font-size: 0.95em;
        }
        .employee-card-actions {
          gap: 0.5em;
        }
      }
    `,
  ],
})
export class EmployeeListComponent implements OnInit {
  employees$!: Observable<IEmployee[]>;
  role: UserRole | null = null;

  constructor(
    private employeeService: EmployeeService,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private csvUtil: CsvUtilService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server, do nothing (avoid SSR issues)
      return;
    }
    this.auth.getRole().subscribe((role) => {
      this.role = role;
      if (role === 'HR' || role === 'Admin') {
        // HR and Admin can see the full employee list
        this.employees$ = this.employeeService.getEmployees();
      } else {
        // Other roles are redirected to their profile
        const userId = this.auth.getUserId();
        if (userId) {
          this.router.navigate(['/employee/profile', userId]);
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  deleteEmployee(id: number) {
    if (this.role !== 'HR' && this.role !== 'Admin') return;
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe((success) => {
        if (success) {
          this.employees$ = this.employeeService.getEmployees();
        }
      });
    }
  }

  exportEmployees() {
    this.employeeService.getEmployees().subscribe((employees) => {
      const csv = this.csvUtil.arrayToCsv(employees);
      this.csvUtil.downloadCsv(csv, 'employees.csv');
    });
  }

  importEmployees(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.csvUtil.readCsvFile(file).then(csv => {
      const employees = this.csvUtil.csvToArray(csv);
      this.employeeService.setEmployees(employees); // You may need to implement setEmployees in EmployeeService
      this.employees$ = this.employeeService.getEmployees();
    });
  }
}

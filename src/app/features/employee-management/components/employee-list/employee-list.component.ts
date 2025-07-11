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

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="table-card">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div class="section-title mb-0"><i class="fas fa-users"></i> Employee List</div>
        <a
          class="btn btn-odoo"
          [routerLink]="['/employee', 'create']"
          *ngIf="role === 'HR'"
        >
          <i class="fas fa-plus"></i> Add Employee
        </a>
      </div>
      <ng-container *ngIf="employees$ | async as employees; else loading">
        <div class="table-responsive">
          <table class="table table-striped mb-0">
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
                  <a
                    class="btn btn-sm btn-info me-1 mb-1"
                    [routerLink]="['/employee', 'profile', emp.id]"
                  >
                    <i class="fas fa-user"></i>
                  </a>
                  <a
                    class="btn btn-sm btn-warning me-1 mb-1"
                    [routerLink]="['/employee', 'edit', emp.id]"
                    *ngIf="role === 'HR'"
                  >
                    <i class="fas fa-edit"></i>
                  </a>
                  <button
                    class="btn btn-sm btn-danger mb-1"
                    (click)="deleteEmployee(emp.id)"
                    *ngIf="role === 'HR'"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server, do nothing (avoid SSR issues)
      return;
    }
    this.auth.getRole().subscribe((role) => {
      this.role = role;
      if (role !== 'HR') {
        const userId = this.auth.getUserId();
        if (userId) {
          this.router.navigate(['/employee/profile', userId]);
        } else {
          this.router.navigate(['/login']);
        }
      } else {
        this.employees$ = this.employeeService.getEmployees();
      }
    });
  }

  deleteEmployee(id: number) {
    if (this.role !== 'HR') return;
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe((success) => {
        if (success) {
          this.employees$ = this.employeeService.getEmployees();
        }
      });
    }
  }
}

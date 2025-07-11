import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { IEmployee } from '../../../../shared/models/employee.model';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService, UserRole } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">Employee List</h5>
        <a
          class="btn btn-primary btn-sm"
          [routerLink]="['/employee', 'create']"
          *ngIf="role === 'HR'"
        >
          <i class="fas fa-plus"></i> Add Employee
        </a>
      </div>
      <div class="card-body p-0">
        <ng-container *ngIf="employees$ | async as employees; else loading">
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
                    class="btn btn-sm btn-info me-1"
                    [routerLink]="['/employee', 'profile', emp.id]"
                  >
                    <i class="fas fa-user"></i>
                  </a>
                  <a
                    class="btn btn-sm btn-warning me-1"
                    [routerLink]="['/employee', 'edit', emp.id]"
                    *ngIf="role === 'HR'"
                  >
                    <i class="fas fa-edit"></i>
                  </a>
                  <button
                    class="btn btn-sm btn-danger"
                    (click)="deleteEmployee(emp.id)"
                    *ngIf="role === 'HR'"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </ng-container>
        <ng-template #loading>
          <app-loading-spinner></app-loading-spinner>
        </ng-template>
      </div>
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
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.getRole().subscribe((role) => {
      this.role = role;
      if (role !== 'HR') {
        const userId = this.auth.getUserId();
        this.router.navigate(['/employee/profile', userId]);
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

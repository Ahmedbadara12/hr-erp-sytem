import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { Observable, of, Subscription } from 'rxjs';
import { EmployeeService } from '../employee-management/services/employee.service';
import { LeaveService } from '../leave-management/services/leave.service';
import { PayrollService } from '../payroll/services/payroll.service';
import { IEmployee } from '../../shared/models/employee.model';
import { ILeaveRequest } from '../../shared/models/leave-request.model';
import { IPayroll } from '../../shared/models/payroll.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  providers: [EmployeeService, LeaveService, PayrollService],
  template: `
    <div class="dashboard-bg py-4">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10">
            <div class="card card-accent mb-4">
              <div
                class="card-header bg-primary text-white d-flex align-items-center"
              >
                <i class="fas fa-home me-2"></i>
                <h4 class="mb-0">Welcome to HR ERP</h4>
              </div>
              <div class="card-body">
                <ng-container *ngIf="role$ | async as role">
                  <!-- DASHBOARD WIDGETS -->
                  <div class="row mb-4 g-3">
                    <!-- Employee Widgets -->
                    <ng-container *ngIf="role === 'Employee'">
                      <div class="col-6 col-md-3">
                        <div class="info-card">
                          <span class="icon"><i class="fas fa-tasks"></i></span>
                          <div>
                            <div class="value">{{ taskCount }}</div>
                            <div class="label">My Tasks</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div class="info-card">
                          <span class="icon"
                            ><i class="fas fa-check-circle"></i
                          ></span>
                          <div>
                            <div class="value text-success">
                              {{ leaveApproved }}
                            </div>
                            <div class="label">Leave Approved</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div class="info-card">
                          <span class="icon"
                            ><i class="fas fa-hourglass-half"></i
                          ></span>
                          <div>
                            <div class="value text-warning">
                              {{ leavePending }}
                            </div>
                            <div class="label">Leave Pending</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div class="info-card">
                          <span class="icon"
                            ><i class="fas fa-times-circle"></i
                          ></span>
                          <div>
                            <div class="value text-danger">
                              {{ leaveRejected }}
                            </div>
                            <div class="label">Leave Rejected</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                    <!-- HR Widgets -->
                    <ng-container *ngIf="role === 'HR'">
                      <div class="col-6 col-md-4">
                        <div class="info-card">
                          <span class="icon"><i class="fas fa-users"></i></span>
                          <div>
                            <div class="value">{{ employeeCount }}</div>
                            <div class="label">Employees</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-4">
                        <div class="info-card">
                          <span class="icon"
                            ><i class="fas fa-hourglass-half"></i
                          ></span>
                          <div>
                            <div class="value text-warning">
                              {{ leavePending }}
                            </div>
                            <div class="label">Pending Leaves</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-4">
                        <div class="info-card">
                          <span class="icon"><i class="fas fa-tasks"></i></span>
                          <div>
                            <div class="value text-info">{{ taskCount }}</div>
                            <div class="label">Open Tasks</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                    <!-- Admin Widgets -->
                    <ng-container *ngIf="role === 'Admin'">
                      <div class="col-6 col-md-6">
                        <div class="info-card">
                          <span class="icon"
                            ><i class="fas fa-money-check-alt"></i
                          ></span>
                          <div>
                            <div class="value text-success">
                              {{ payrollCount }}
                            </div>
                            <div class="label">Payrolls</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-6">
                        <div class="info-card">
                          <span class="icon"><i class="fas fa-tasks"></i></span>
                          <div>
                            <div class="value text-info">{{ taskCount }}</div>
                            <div class="label">Total Tasks</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                    <!-- Project Manager Widgets -->
                    <ng-container *ngIf="role === 'ProjectManager'">
                      <div class="col-6 col-md-6">
                        <div class="info-card">
                          <span class="icon"><i class="fas fa-users"></i></span>
                          <div>
                            <div class="value">{{ employeeCount }}</div>
                            <div class="label">Employees</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-6">
                        <div class="info-card">
                          <span class="icon"><i class="fas fa-tasks"></i></span>
                          <div>
                            <div class="value text-info">{{ taskCount }}</div>
                            <div class="label">Open Tasks</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                  </div>
                  <!-- END DASHBOARD WIDGETS -->
                  <ng-container [ngSwitch]="role">
                    <!-- Employee Dashboard -->
                    <ng-container *ngSwitchCase="'Employee'">
                      <div class="section-title mb-3">
                        <i class="fas fa-user"></i> Employee Dashboard
                      </div>
                      <ul class="list-group mb-3">
                        <li class="list-group-item">
                          <i class="fas fa-id-badge me-2 text-primary"></i> View
                          & edit your <b>profile</b>
                        </li>
                        <li class="list-group-item">
                          <i class="fas fa-calendar-alt me-2 text-success"></i>
                          Apply for <b>leave</b> and view leave status/history
                        </li>
                        <li class="list-group-item">
                          <i class="fas fa-tasks me-2 text-info"></i> View &
                          update your <b>tasks</b>
                        </li>
                      </ul>
                      <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-odoo" (click)="goToProfile()">
                          <i class="fas fa-user"></i> My Profile
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          (click)="goToLeave()"
                        >
                          <i class="fas fa-calendar-alt"></i> My Leave
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          (click)="goToTasks()"
                        >
                          <i class="fas fa-tasks"></i> My Tasks
                        </button>
                      </div>
                    </ng-container>
                    <!-- HR Dashboard -->
                    <ng-container *ngSwitchCase="'HR'">
                      <div class="section-title mb-3">
                        <i class="fas fa-user-tie"></i> HR Dashboard
                      </div>
                      <ul class="list-group mb-3">
                        <li class="list-group-item">
                          <i class="fas fa-users me-2 text-primary"></i> Manage
                          <b>employees</b> (add, edit, delete)
                        </li>
                        <li class="list-group-item">
                          <i
                            class="fas fa-calendar-check me-2 text-success"
                          ></i>
                          Approve/review <b>leave requests</b>
                        </li>
                        <li class="list-group-item">
                          <i class="fas fa-tasks me-2 text-info"></i> Create,
                          assign, and edit <b>tasks</b>
                        </li>
                      </ul>
                      <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-odoo" (click)="goToEmployee()">
                          <i class="fas fa-users"></i> Employee List
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          (click)="goToTasks()"
                        >
                          <i class="fas fa-tasks"></i> Tasks
                        </button>
                      </div>
                    </ng-container>
                    <!-- Admin Dashboard -->
                    <ng-container *ngSwitchCase="'Admin'">
                      <div class="section-title mb-3">
                        <i class="fas fa-user-shield"></i> Admin Dashboard
                      </div>
                      <ul class="list-group mb-3">
                        <li class="list-group-item">
                          <i
                            class="fas fa-money-check-alt me-2 text-success"
                          ></i>
                          View <b>payroll</b> and payslip reports
                        </li>
                        <li class="list-group-item">
                          <i class="fas fa-tasks me-2 text-info"></i> Assign and
                          manage <b>tasks</b>
                        </li>
                      </ul>
                      <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-odoo" (click)="goToPayroll()">
                          <i class="fas fa-money-check-alt"></i> Payroll
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          (click)="goToTasks()"
                        >
                          <i class="fas fa-tasks"></i> Tasks
                        </button>
                      </div>
                    </ng-container>
                    <!-- Project Manager Dashboard -->
                    <ng-container *ngSwitchCase="'ProjectManager'">
                      <div class="section-title mb-3">
                        <i class="fas fa-user-cog"></i> Project Manager
                        Dashboard
                      </div>
                      <ul class="list-group mb-3">
                        <li class="list-group-item">
                          <i class="fas fa-users me-2 text-primary"></i> View
                          employees
                        </li>
                        <li class="list-group-item">
                          <i class="fas fa-tasks me-2 text-info"></i> Manage and
                          assign <b>tasks</b>
                        </li>
                      </ul>
                      <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-odoo" (click)="goToEmployee()">
                          <i class="fas fa-users"></i> Employee List
                        </button>
                        <button
                          class="btn btn-outline-primary"
                          (click)="goToTasks()"
                        >
                          <i class="fas fa-tasks"></i> Tasks
                        </button>
                      </div>
                    </ng-container>
                  </ng-container>
                </ng-container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  role$: Observable<UserRole | null>;
  employeeCount = 0;
  leavePending = 0;
  leaveApproved = 0;
  leaveRejected = 0;
  taskCount = 0;
  payrollCount = 0;
  userId: number | null = null;
  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private payrollService: PayrollService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.role$ = this.auth.getRole();
  }

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.subs.push(
      this.role$.subscribe((role) => {
        if (role === 'Employee' && this.userId) {
          this.subs.push(
            this.leaveService.getLeaves().subscribe((leaves) => {
              const myLeaves = leaves.filter(
                (l) => l.employeeId === this.userId
              );
              this.leavePending = myLeaves.filter(
                (l) => l.status === 'Pending'
              ).length;
              this.leaveApproved = myLeaves.filter(
                (l) => l.status === 'Approved'
              ).length;
              this.leaveRejected = myLeaves.filter(
                (l) => l.status === 'Rejected'
              ).length;
            })
          );
          // For demo, count all tasks as 3
          this.taskCount = 3;
        } else if (role === 'HR') {
          this.subs.push(
            this.employeeService.getEmployees().subscribe((emps) => {
              this.employeeCount = emps.length;
            })
          );
          this.subs.push(
            this.leaveService.getLeaves().subscribe((leaves) => {
              this.leavePending = leaves.filter(
                (l) => l.status === 'Pending'
              ).length;
            })
          );
          // For demo, count all tasks as 5
          this.taskCount = 5;
        } else if (role === 'Admin') {
          this.subs.push(
            this.payrollService.getPayrolls().subscribe((payrolls) => {
              this.payrollCount = payrolls.length;
            })
          );
          // For demo, count all tasks as 2
          this.taskCount = 2;
        } else if (role === 'ProjectManager') {
          this.subs.push(
            this.employeeService.getEmployees().subscribe((emps) => {
              this.employeeCount = emps.length;
            })
          );
          // For demo, count all tasks as 4
          this.taskCount = 4;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  goToLeave() {
    this.router.navigate(['/leave']);
  }
  goToTasks() {
    this.router.navigate(['/tasks']);
  }
  goToPayroll() {
    this.router.navigate(['/payroll']);
  }
  goToEmployee() {
    this.router.navigate(['/employee']);
  }
}

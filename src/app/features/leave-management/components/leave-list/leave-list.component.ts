import { Component, OnInit, Inject } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { ILeaveRequest } from '../../../../shared/models/leave-request.model';
import { Observable, of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService, UserRole } from '../../../../core/services/auth.service';
import { map } from 'rxjs/operators';
import { EmployeeService } from '../../../employee-management/services/employee.service';
import { IEmployee } from '../../../../shared/models/employee.model';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="table-card">
      <div
        class="d-flex justify-content-between align-items-center mb-3 flex-wrap"
      >
        <div class="section-title mb-0">
          <i class="fas fa-calendar-alt"></i> Leave Requests
        </div>
        <a
          *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'Admin'"
          class="btn btn-odoo"
          routerLink="/leave/apply"
        >
          <i class="fas fa-plus"></i> Apply for Leave
        </a>
      </div>
      <ng-container *ngIf="userIdLoaded">
        <ng-container *ngIf="leaves$ | async as leaves; else loading">
          <div class="table-responsive d-none d-sm-block">
            <table class="table table-striped payroll-table mb-0">
              <thead class="table-light">
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th
                    *ngIf="
                      (role$ | async) === 'Employee' ||
                      (role$ | async) === 'HR' ||
                      (role$ | async) === 'Admin'
                    "
                  >
                    Assignee
                  </th>
                  <th style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let leave of filteredLeaves(leaves, role$ | async)">
                  <td>{{ leave.type }}</td>
                  <td>{{ leave.from }}</td>
                  <td>{{ leave.to }}</td>
                  <td>
                    <span
                      [ngClass]="{
                        'badge bg-warning text-dark':
                          leave.status === 'Pending',
                        'badge bg-success': leave.status === 'Approved',
                        'badge bg-danger': leave.status === 'Rejected'
                      }"
                      >{{ leave.status }}</span
                    >
                  </td>
                  <td
                    *ngIf="
                      (role$ | async) === 'Employee' ||
                      (role$ | async) === 'HR' ||
                      (role$ | async) === 'Admin'
                    "
                  >
                    {{ getAssigneeName(leave.employeeId) }}
                  </td>
                  <td>
                    <button
                      *ngIf="
                        (role$ | async) === 'Employee' &&
                        leave.status === 'Pending'
                      "
                      class="btn btn-sm btn-danger me-1 mb-1"
                      aria-label="Delete leave request"
                      title="Delete"
                      (click)="deleteLeave(leave.id)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <button
                      *ngIf="
                        ((role$ | async) === 'HR' &&
                          leave.status === 'Pending') ||
                        ((role$ | async) === 'Admin' &&
                          leave.status === 'Pending')
                      "
                      class="btn btn-sm btn-success me-1 mb-1"
                      aria-label="Approve leave request"
                      title="Approve"
                      (click)="approveLeave(leave.id)"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      *ngIf="
                        ((role$ | async) === 'HR' &&
                          leave.status === 'Pending') ||
                        ((role$ | async) === 'Admin' &&
                          leave.status === 'Pending')
                      "
                      class="btn btn-sm btn-danger me-1 mb-1"
                      aria-label="Reject leave request"
                      title="Reject"
                      (click)="rejectLeave(leave.id)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button
                      *ngIf="
                        (role$ | async) === 'HR' || (role$ | async) === 'Admin'
                      "
                      class="btn btn-sm btn-outline-danger mb-1"
                      aria-label="Delete leave request"
                      title="Delete"
                      (click)="deleteLeave(leave.id)"
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
      </ng-container>
    </div>
  `,
  providers: [LeaveService, EmployeeService],
})
export class LeaveListComponent implements OnInit {
  leaves$!: Observable<ILeaveRequest[]>;
  userId: number | null = null;
  userIdLoaded = false;
  public role$ = this.auth.getRole();
  private employees: IEmployee[] = [];

  constructor(
    private leaveService: LeaveService,
    private auth: AuthService,
    private employeeService: EmployeeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // SSR/static: don't run browser-only logic
      this.userIdLoaded = false;
      return;
    }
    this.userId = this.auth.getUserId();
    this.userIdLoaded = !!this.userId;
    // Always subscribe to all leaves for real-time updates
    this.leaves$ = this.leaveService.getLeaves();
    // Fetch all employees for name lookup
    this.employeeService
      .getEmployees()
      .subscribe((emps: IEmployee[]) => (this.employees = emps || []));
  }

  deleteLeave(id: number) {
    if (confirm('Are you sure you want to delete this leave request?')) {
      this.leaveService.deleteLeave(id).subscribe((success) => {
        if (success && this.userId) {
          this.leaves$ = this.leaveService
            .getLeaves()
            .pipe(
              map((leaves) =>
                leaves.filter((l) => l.employeeId === this.userId)
              )
            );
        }
      });
    }
  }

  approveLeave(id: number) {
    this.leaveService.approveLeave(id);
  }

  rejectLeave(id: number) {
    this.leaveService.rejectLeave(id);
  }

  filteredLeaves(
    leaves: ILeaveRequest[],
    role: UserRole | null
  ): ILeaveRequest[] {
    if (role === 'Employee') {
      return leaves.filter((l) => l.employeeId === this.userId);
    }
    if (role === 'HR') {
      return leaves;
    }
    return [];
  }
  getAssigneeName(employeeId: number): string {
    const emp = this.employees.find((e) => e.id === employeeId);
    return emp ? emp.name : 'Unknown';
  }
}

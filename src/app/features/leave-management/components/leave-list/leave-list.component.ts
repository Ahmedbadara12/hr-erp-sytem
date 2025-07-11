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
          *ngIf="(role$ | async) === 'Employee'"
          class="btn btn-odoo"
          routerLink="/leave/apply"
        >
          <i class="fas fa-plus"></i> Apply for Leave
        </a>
      </div>
      <ng-container *ngIf="userIdLoaded">
        <ng-container *ngIf="leaves$ | async as leaves; else loading">
          <div class="table-responsive d-none d-sm-block">
            <table class="table table-striped mb-0">
              <thead class="table-light">
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'HR'">Assignee</th>
                  <th style="width: 120px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let leave of filteredLeaves(leaves, (role$ | async))">
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
                  <td *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'HR'">
                    {{ getAssigneeName(leave.employeeId) }}
                  </td>
                  <td>
                    <button
                      *ngIf="(role$ | async) === 'Employee' && leave.status === 'Pending'"
                      class="btn btn-sm btn-danger me-1 mb-1"
                      title="Delete"
                      (click)="deleteLeave(leave.id)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                    <button
                      *ngIf="(role$ | async) === 'HR' && leave.status === 'Pending'"
                      class="btn btn-sm btn-success me-1 mb-1"
                      title="Approve"
                      (click)="approveLeave(leave.id)"
                    >
                      <i class="fas fa-check"></i>
                    </button>
                    <button
                      *ngIf="(role$ | async) === 'HR' && leave.status === 'Pending'"
                      class="btn btn-sm btn-danger me-1 mb-1"
                      title="Reject"
                      (click)="rejectLeave(leave.id)"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                    <button
                      *ngIf="(role$ | async) === 'HR'"
                      class="btn btn-sm btn-outline-danger mb-1"
                      title="Delete"
                      (click)="deleteLeave(leave.id)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredLeaves(leaves, (role$ | async)).length === 0">
                  <td colspan="6" class="text-center">
                    No leave requests found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Mobile Timeline Layout -->
          <div class="d-block d-sm-none">
            <div class="timeline-mobile">
              <div *ngFor="let leave of filteredLeaves(leaves, (role$ | async)); let i = index" class="timeline-step position-relative mb-4">
                <div class="timeline-dot position-absolute top-0 start-0 translate-middle"></div>
                <div class="timeline-line position-absolute start-0" *ngIf="i < filteredLeaves(leaves, (role$ | async)).length - 1"></div>
                <div class="ms-4 ps-2 pb-2">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <span class="fw-bold text-primary" style="font-size:1.1em;">{{ leave.type }}</span>
                    <span class="badge"
                      [ngClass]="{
                        'bg-warning text-dark': leave.status === 'Pending',
                        'bg-success': leave.status === 'Approved',
                        'bg-danger': leave.status === 'Rejected'
                      }"
                      style="font-size:0.98em; padding:0.4em 1em;"
                      >{{ leave.status }}</span
                    >
                  </div>
                  <div class="small text-muted mb-1">
                    <i class="fas fa-calendar-alt me-1"></i>
                    <span>{{ leave.from }}</span>
                    <span class="mx-1">→</span>
                    <span>{{ leave.to }}</span>
                  </div>
                  <div class="mb-1 small text-secondary">
                    <span *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'HR'">
                      <i class="fas fa-user me-1"></i>Assignee: {{ getAssigneeName(leave.employeeId) }}
                    </span>
                  </div>
                  <div class="mb-2 small text-muted" *ngIf="leave.reason">
                    <i class="fas fa-info-circle me-1"></i>{{ leave.reason }}
                  </div>
                  <div class="d-flex flex-column gap-2 mt-2">
                    <button
                      *ngIf="(role$ | async) === 'Employee' && leave.status === 'Pending'"
                      class="btn btn-danger btn-sm w-100"
                      (click)="deleteLeave(leave.id)"
                    >
                      <i class="fas fa-trash"></i> Delete
                    </button>
                    <button
                      *ngIf="(role$ | async) === 'HR' && leave.status === 'Pending'"
                      class="btn btn-success btn-sm w-100"
                      (click)="approveLeave(leave.id)"
                    >
                      <i class="fas fa-check"></i> Approve
                    </button>
                    <button
                      *ngIf="(role$ | async) === 'HR' && leave.status === 'Pending'"
                      class="btn btn-danger btn-sm w-100"
                      (click)="rejectLeave(leave.id)"
                    >
                      <i class="fas fa-times"></i> Reject
                    </button>
                    <button
                      *ngIf="(role$ | async) === 'HR'"
                      class="btn btn-outline-danger btn-sm w-100"
                      (click)="deleteLeave(leave.id)"
                    >
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="filteredLeaves(leaves, (role$ | async)).length === 0" class="text-center text-muted py-4">
              No leave requests found.
            </div>
          </div>
        </ng-container>
      </ng-container>
      <ng-template #loading>
        <app-loading-spinner></app-loading-spinner>
      </ng-template>
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

  filteredLeaves(leaves: ILeaveRequest[], role: UserRole | null): ILeaveRequest[] {
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

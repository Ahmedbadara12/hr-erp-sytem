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
    <div class="leave-center-container">
      <div class="table-card leave-approve-table-card">
        <div class="leave-list-header d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div class="section-title mb-0">
            <i class="fas fa-calendar-alt"></i> Leave Requests
          </div>
          <a
            *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'Admin'"
            class="btn btn-primary apply-btn"
            routerLink="/leave/apply"
          >
            <i class="fas fa-plus"></i> Apply for Leave
          </a>
        </div>
        <ng-container *ngIf="userIdLoaded">
          <ng-container *ngIf="leaves$ | async as leaves; else loading">
            <!-- Desktop Table -->
            <div class="table-responsive d-none d-md-block">
              <table class="table table-striped payroll-table mb-0 leave-approve-table">
                <thead class="table-light">
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                    <th *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'HR' || (role$ | async) === 'Admin'">Assignee</th>
                    <th style="width: 140px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let leave of filteredLeaves(leaves, role$ | async)">
                    <td>{{ leave.type }}</td>
                    <td>{{ leave.from | date: 'MMM d, y' }}</td>
                    <td>{{ leave.to | date: 'MMM d, y' }}</td>
                    <td>
                      <span class="badge" [ngClass]="{
                          'bg-warning text-dark': leave.status === 'Pending',
                          'bg-success': leave.status === 'Approved',
                          'bg-danger': leave.status === 'Rejected'
                        }">{{ leave.status }}</span>
                    </td>
                    <td *ngIf="(role$ | async) === 'Employee' || (role$ | async) === 'HR' || (role$ | async) === 'Admin'">
                      {{ getAssigneeName(leave.employeeId) }}
                    </td>
                    <td class="actions-cell">
                      <div class="action-btn-group">
                        <button *ngIf="(role$ | async) === 'Employee' && leave.status === 'Pending'" class="btn btn-danger btn-sm" aria-label="Delete leave request" title="Delete" (click)="deleteLeave(leave.id)"><i class="fas fa-trash"></i></button>
                        <button *ngIf="((role$ | async) === 'HR' && leave.status === 'Pending') || ((role$ | async) === 'Admin' && leave.status === 'Pending')" class="btn btn-success btn-sm me-1" aria-label="Approve leave request" title="Approve" (click)="approveLeave(leave.id)"><i class="fas fa-check"></i></button>
                        <button *ngIf="((role$ | async) === 'HR' && leave.status === 'Pending') || ((role$ | async) === 'Admin' && leave.status === 'Pending')" class="btn btn-danger btn-sm" aria-label="Reject leave request" title="Reject" (click)="rejectLeave(leave.id)"><i class="fas fa-times"></i></button>
                        <button *ngIf="(role$ | async) === 'HR' || (role$ | async) === 'Admin'" class="btn btn-danger btn-sm" aria-label="Delete leave request" title="Delete" (click)="deleteLeave(leave.id)"><i class="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredLeaves(leaves, role$ | async).length === 0">
                    <td colspan="6" class="text-center">No leave requests found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Mobile Card List -->
            <div class="d-block d-md-none">
              <div *ngIf="filteredLeaves(leaves, role$ | async).length === 0" class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-2x mb-3"></i>
                <p>No leave requests found.</p>
              </div>
              <div *ngFor="let leave of filteredLeaves(leaves, role$ | async)" class="leave-card mb-3">
                <div class="leave-card-body">
                  <div class="d-flex align-items-center mb-2">
                    <span class="fw-bold text-primary me-2">#{{ getAssigneeName(leave.employeeId) }}</span>
                    <span class="badge bg-warning text-dark ms-auto" *ngIf="leave.status === 'Pending'">Pending</span>
                    <span class="badge bg-success ms-auto" *ngIf="leave.status === 'Approved'">Approved</span>
                    <span class="badge bg-danger ms-auto" *ngIf="leave.status === 'Rejected'">Rejected</span>
                  </div>
                  <div class="mb-1"><b>Type:</b> {{ leave.type }}</div>
                  <div class="mb-1"><b>From:</b> {{ leave.from | date: 'MMM d, y' }}</div>
                  <div class="mb-1"><b>To:</b> {{ leave.to | date: 'MMM d, y' }}</div>
                  <div class="mb-1"><b>Reason:</b> {{ leave.reason }}</div>
                  <div class="d-flex gap-2 mt-2">
                    <button *ngIf="(role$ | async) === 'Employee' && leave.status === 'Pending'" class="btn btn-danger btn-sm flex-fill" aria-label="Delete leave request" title="Delete" (click)="deleteLeave(leave.id)"><i class="fas fa-trash"></i></button>
                    <button *ngIf="((role$ | async) === 'HR' && leave.status === 'Pending') || ((role$ | async) === 'Admin' && leave.status === 'Pending')" class="btn btn-success btn-sm flex-fill" aria-label="Approve leave request" title="Approve" (click)="approveLeave(leave.id)"><i class="fas fa-check"></i> Approve</button>
                    <button *ngIf="((role$ | async) === 'HR' && leave.status === 'Pending') || ((role$ | async) === 'Admin' && leave.status === 'Pending')" class="btn btn-danger btn-sm flex-fill" aria-label="Reject leave request" title="Reject" (click)="rejectLeave(leave.id)"><i class="fas fa-times"></i> Reject</button>
                    <button *ngIf="(role$ | async) === 'HR' || (role$ | async) === 'Admin'" class="btn btn-danger btn-sm flex-fill" aria-label="Delete leave request" title="Delete" (click)="deleteLeave(leave.id)"><i class="fas fa-trash"></i> Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #loading>
            <app-loading-spinner></app-loading-spinner>
          </ng-template>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .leave-center-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 3rem 1rem 3rem 1rem;
        min-height: 80vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .leave-list-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .apply-btn {
        min-width: 160px;
        font-weight: 700;
        border-radius: 2em;
        font-size: 1.08em;
        padding: 0.7em 1.5em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.10);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5em;
      }
      @media (max-width: 767.98px) {
        .leave-list-header {
          flex-direction: column;
          align-items: stretch;
          gap: 0.7rem;
        }
        .apply-btn {
          width: 100%;
          min-width: 0;
        }
      }
      .leave-approve-table-card {
        padding: 2rem 1.5rem;
        background: #fff;
        border-radius: 1.5rem;
        box-shadow: 0 4px 24px rgba(124, 58, 237, 0.10);
        margin-bottom: 2.5rem;
        width: 100%;
        max-width: 700px;
      }
      .leave-approve-table {
        min-width: 100%;
        font-size: 1rem;
        table-layout: fixed;
      }
      .leave-approve-table th,
      .leave-approve-table td {
        vertical-align: middle;
        text-align: center;
        padding: 0.85em 0.5em;
        word-break: break-word;
        overflow-wrap: break-word;
      }
      .leave-approve-table th.actions-col,
      .leave-approve-table td.actions-cell {
        width: 140px;
        min-width: 100px;
        max-width: 180px;
        white-space: normal !important;
      }
      .action-btn-group {
        display: flex;
        gap: 0.7em;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      }
      .action-btn-group .btn {
        min-width: 120px;
        padding: 0.7em 1.5em;
        font-size: 1.08em;
        border-radius: 2em;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.10);
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        overflow: visible;
        transition: background 0.2s, box-shadow 0.2s, color 0.2s;
      }
      .action-btn-group .btn-success {
        background: linear-gradient(135deg, #34d399 0%, #059669 100%);
        color: #fff;
        border: none;
      }
      .action-btn-group .btn-success:hover {
        background: linear-gradient(135deg, #059669 0%, #065f46 100%);
        color: #fff;
        box-shadow: 0 4px 16px rgba(52, 211, 153, 0.18);
      }
      .action-btn-group .btn-danger {
        background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
        color: #fff;
        border: none;
      }
      .action-btn-group .btn-danger:hover {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: #fff;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.18);
      }
      .action-btn-group .btn i {
        font-size: 1.1em;
      }
      .badge {
        font-size: 0.98em;
        padding: 0.4em 1em;
        border-radius: 1em;
      }
      .table-striped > tbody > tr:nth-of-type(odd) {
        background: #f8f7fc;
      }
      .table-striped > tbody > tr:hover {
        background: #ede9fe;
        transition: background 0.2s;
      }
      .leave-approve-table thead th {
        position: sticky;
        top: 0;
        background: #ede9fe;
        z-index: 2;
      }
      /* Mobile Card Styles */
      .leave-card {
        background: #f8f7fc;
        border-radius: 1.1em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
        padding: 1.1em 1em 0.7em 1em;
        margin-bottom: 1.2em;
        border: 1px solid #ede9fe;
      }
      .leave-card-body {
        display: flex;
        flex-direction: column;
      }
      .leave-card .badge {
        font-size: 0.95em;
        padding: 0.4em 1em;
      }
      .leave-card .btn {
        width: 100%;
        margin-bottom: 0.4em;
        font-size: 1em;
        padding: 0.7em 0.7em;
        border-radius: 0.7em;
      }
      .leave-card .btn:last-child {
        margin-bottom: 0;
      }
      .leave-card .fw-bold {
        font-size: 1.08em;
      }
      .leave-card .text-secondary {
        font-size: 0.97em;
      }
      @media (max-width: 991.98px) {
        .leave-approve-table {
          font-size: 0.95rem;
        }
        .leave-approve-table-card {
          padding: 1.2rem 0.5rem;
        }
        .leave-approve-table th.actions-col,
        .leave-approve-table td.actions-cell {
          width: 120px;
          min-width: 90px;
          max-width: 140px;
        }
      }
      @media (max-width: 767.98px) {
        .leave-center-container {
          padding: 1.2rem 0.2rem 2rem 0.2rem;
        }
        .leave-approve-table {
          font-size: 0.92rem;
        }
        .action-btn-group {
          flex-direction: column;
          gap: 0.4em;
        }
        .action-btn-group .btn {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          padding: 0.5em 0.7em;
        }
        .leave-approve-table th,
        .leave-approve-table td {
          padding: 0.5em 0.2em;
        }
      }
    `
  ],
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

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
    <div class="leave-center-container ">
      <div class="leave-request-list">
        <div
          class="leave-list-header d-flex justify-content-between align-items-center mb-3 flex-wrap"
        >
          <div class="section-title mb-0">
            <i class="fas fa-calendar-alt"></i> Leave Requests
          </div>
          <a
            *ngIf="
              (role$ | async) === 'Employee' || (role$ | async) === 'Admin'
            "
            class="btn btn-primary apply-btn"
            routerLink="/leave/apply"
          >
            <i class="fas fa-plus"></i> Apply for Leave
          </a>
        </div>
        <ng-container *ngIf="userIdLoaded">
          <ng-container *ngIf="leaves$ | async as leaves; else loading">
            <div
              *ngIf="filteredLeaves(leaves, role$ | async).length === 0"
              class="text-center text-muted py-4"
            >
              <i class="fas fa-inbox fa-2x mb-3"></i>
              <p>No leave requests found.</p>
            </div>
            <div
              *ngFor="let leave of filteredLeaves(leaves, role$ | async)"
              class="leave-request-card"
            >
              <div class="leave-info">
                <div class="leave-type">{{ leave.type }}</div>
                <div class="leave-dates">
                  {{ leave.from | date : 'MMM d, y' }} &rarr;
                  {{ leave.to | date : 'MMM d, y' }}
                </div>
                <div class="leave-status">
                  <span
                    class="badge"
                    [ngClass]="{
                      'bg-warning text-dark': leave.status === 'Pending',
                      'bg-success': leave.status === 'Approved',
                      'bg-danger': leave.status === 'Rejected'
                    }"
                    >{{ leave.status }}</span
                  >
                </div>
                <div
                  class="leave-assignee"
                  *ngIf="
                    (role$ | async) === 'Employee' ||
                    (role$ | async) === 'HR' ||
                    (role$ | async) === 'Admin'
                  "
                >
                  {{ getAssigneeName(leave.employeeId) }}
                </div>
              </div>
              <div class="leave-actions">
                <button
                  *ngIf="
                    (role$ | async) === 'Employee' && leave.status === 'Pending'
                  "
                  class="btn btn-danger"
                  aria-label="Delete leave request"
                  title="Delete"
                  (click)="deleteLeave(leave.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  *ngIf="
                    ((role$ | async) === 'HR' && leave.status === 'Pending') ||
                    ((role$ | async) === 'Admin' && leave.status === 'Pending')
                  "
                  class="btn btn-success"
                  aria-label="Approve leave request"
                  title="Approve"
                  (click)="approveLeave(leave.id)"
                >
                  <i class="fas fa-check"></i>
                </button>
                <button
                  *ngIf="
                    ((role$ | async) === 'HR' && leave.status === 'Pending') ||
                    ((role$ | async) === 'Admin' && leave.status === 'Pending')
                  "
                  class="btn btn-danger"
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
                  class="btn btn-danger"
                  aria-label="Delete leave request"
                  title="Delete"
                  (click)="deleteLeave(leave.id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
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
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
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
      .leave-request-list {
        width: 100%;
        max-width: 700px;
        padding: 2rem 1.5rem;
        background: #fff;
        border-radius: 1.5rem;
        box-shadow: 0 4px 24px rgba(124, 58, 237, 0.1);
        margin-bottom: 2.5rem;
      }
      .leave-request-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.2em 1.5em;
        margin-bottom: 1.2em;
        border: 1px solid #ede9fe;
        border-radius: 1.1em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.08);
        background: #f8f7fc;
      }
      .leave-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .leave-type {
        font-size: 1.1em;
        font-weight: 600;
        color: #333;
        margin-bottom: 0.3em;
      }
      .leave-dates {
        font-size: 0.95em;
        color: #666;
        margin-bottom: 0.3em;
      }
      .leave-status {
        margin-bottom: 0.3em;
      }
      .leave-assignee {
        font-size: 0.95em;
        color: #555;
      }
      .leave-actions {
        display: flex;
        gap: 0.7em;
        align-items: center;
      }
      .leave-actions .btn {
        min-width: 120px;
        padding: 0.7em 1.5em;
        font-size: 1.08em;
        border-radius: 2em;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        overflow: visible;
        transition: background 0.2s, box-shadow 0.2s, color 0.2s;
      }
      .leave-actions .btn-success {
        background: linear-gradient(135deg, #34d399 0%, #059669 100%);
        color: #fff;
        border: none;
      }
      .leave-actions .btn-success:hover {
        background: linear-gradient(135deg, #059669 0%, #065f46 100%);
        color: #fff;
        box-shadow: 0 4px 16px rgba(52, 211, 153, 0.18);
      }
      .leave-actions .btn-danger {
        background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
        color: #fff;
        border: none;
      }
      .leave-actions .btn-danger:hover {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: #fff;
        box-shadow: 0 4px 16px rgba(239, 68, 68, 0.18);
      }
      .leave-actions .btn i {
        font-size: 1.1em;
      }
      .badge {
        font-size: 0.98em;
        padding: 0.4em 1em;
        border-radius: 1em;
      }
      .leave-request-list .leave-request-card:last-child {
        margin-bottom: 0;
      }
      @media (max-width: 991.98px) {
        .leave-request-card {
          padding: 1em 1em;
        }
        .leave-actions .btn {
          min-width: 100px;
          padding: 0.5em 1em;
        }
      }
      @media (max-width: 767.98px) {
        .leave-center-container {
          padding: 1.2rem 0.2rem 2rem 0.2rem;
        }
        .leave-request-list {
          padding: 1.2rem 0.5rem;
        }
        .leave-request-card {
          flex-direction: column;
          align-items: flex-start;
          padding: 0.8em 0.7em;
        }
        .leave-info {
          width: 100%;
          margin-bottom: 0.5em;
        }
        .leave-type {
          font-size: 1em;
        }
        .leave-dates {
          font-size: 0.9em;
        }
        .leave-assignee {
          font-size: 0.9em;
        }
        .leave-actions {
          width: 100%;
          justify-content: flex-end;
          gap: 0.4em;
        }
        .leave-actions .btn {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          padding: 0.5em 0.7em;
        }
      }
    `,
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

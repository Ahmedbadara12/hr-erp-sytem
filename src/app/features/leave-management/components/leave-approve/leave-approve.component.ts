import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { ILeaveRequest } from '../../../../shared/models/leave-request.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { map } from 'rxjs/operators';
import { AuthService, UserRole } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-leave-approve',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div *ngIf="role === 'HR' || role === 'Admin'" class="table-card leave-approve-table-card">
      <div class="section-title mb-3">
        <i class="fas fa-calendar-check"></i> Approve Leave Requests
      </div>
      <ng-container *ngIf="pendingLeaves$ | async as pendingLeaves; else loading">
        <!-- Desktop Table -->
        <div class="table-responsive d-none d-md-block">
          <table class="table table-striped payroll-table mb-0 leave-approve-table">
            <thead class="table-light">
              <tr>
                <th>Employee ID</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th class="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of pendingLeaves">
                <td>{{ leave.employeeId }}</td>
                <td>{{ leave.type }}</td>
                <td>{{ leave.from }}</td>
                <td>{{ leave.to }}</td>
                <td>{{ leave.reason }}</td>
                <td>
                  <span class="badge bg-warning text-dark">Pending</span>
                </td>
                <td class="actions-cell">
                  <div class="action-btn-group">
                    <button class="btn btn-success btn-sm" (click)="approve(leave.id)">
                      <i class="fas fa-check me-1"></i> Approve
                    </button>
                    <button class="btn btn-danger btn-sm" (click)="reject(leave.id)">
                      <i class="fas fa-times me-1"></i> Reject
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="pendingLeaves.length === 0">
                <td colspan="7" class="text-center">
                  No pending leave requests.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Mobile Card List -->
        <div class="d-block d-md-none">
          <div *ngIf="pendingLeaves.length === 0" class="text-center text-muted py-4">
            <i class="fas fa-inbox fa-2x mb-3"></i>
            <p>No pending leave requests.</p>
          </div>
          <div *ngFor="let leave of pendingLeaves" class="leave-card mb-3">
            <div class="leave-card-body">
              <div class="d-flex align-items-center mb-2">
                <span class="fw-bold text-primary me-2">#{{ leave.employeeId }}</span>
                <span class="badge bg-warning text-dark ms-auto">Pending</span>
              </div>
              <div class="mb-1"><b>Type:</b> {{ leave.type }}</div>
              <div class="mb-1"><b>From:</b> {{ leave.from }}</div>
              <div class="mb-1"><b>To:</b> {{ leave.to }}</div>
              <div class="mb-2"><b>Reason:</b> {{ leave.reason }}</div>
              <div class="d-flex gap-2 mt-2">
                <button class="btn btn-success btn-sm flex-fill" (click)="approve(leave.id)">
                  <i class="fas fa-check me-1"></i> Approve
                </button>
                <button class="btn btn-danger btn-sm flex-fill" (click)="reject(leave.id)">
                  <i class="fas fa-times me-1"></i> Reject
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
      .leave-approve-table-card {
        padding: 2rem 1.5rem;
        background: #fff;
        border-radius: 1.5rem;
        box-shadow: 0 4px 24px rgba(124, 58, 237, 0.10);
        margin-bottom: 2.5rem;
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
          font-size: 0.9em;
        }
        .leave-approve-table th.actions-col,
        .leave-approve-table td.actions-cell {
          width: 100px;
          min-width: 80px;
          max-width: 120px;
        }
      }
      @media (max-width: 575.98px) {
        .leave-approve-table {
          font-size: 0.88rem;
        }
        .leave-approve-table-card {
          padding: 0.7rem 0.2rem;
        }
        .action-btn-group .btn {
          font-size: 0.95em;
          padding: 0.5em 0.7em;
        }
        .leave-approve-table th,
        .leave-approve-table td {
          padding: 0.4em 0.1em;
          font-size: 0.85em;
        }
        .leave-approve-table th.actions-col,
        .leave-approve-table td.actions-cell {
          width: 80px;
          min-width: 60px;
          max-width: 100px;
        }
      }
    `
  ]
})
export class LeaveApproveComponent implements OnInit {
  pendingLeaves$!: Observable<ILeaveRequest[]>;
  role: UserRole | null = null;

  constructor(private leaveService: LeaveService, private auth: AuthService) {}

  ngOnInit() {
    this.auth.getRole().subscribe((role) => (this.role = role));
    this.loadPending();
  }

  loadPending() {
    this.pendingLeaves$ = this.leaveService.getLeaves().pipe(
      // Filter for pending status
      map((leaves) => leaves.filter((l) => l.status === 'Pending'))
    );
  }

  approve(id: number) {
    if (this.role === 'HR' || this.role === 'Admin') {
      this.leaveService.approveLeave(id);
      this.loadPending();
    }
  }

  reject(id: number) {
    if (this.role === 'HR' || this.role === 'Admin') {
      this.leaveService.rejectLeave(id);
      this.loadPending();
    }
  }
}

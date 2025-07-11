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
    <div *ngIf="role === 'HR' || role === 'Admin'" class="table-card">
      <div class="section-title mb-3">
        <i class="fas fa-calendar-check"></i> Approve Leave Requests
      </div>
      <ng-container *ngIf="pendingLeaves$ | async as pendingLeaves; else loading">
        <!-- Desktop/Tablet Table -->
        <div class="table-responsive d-none d-sm-block">
          <table class="table table-striped mb-0">
            <thead class="table-light">
              <tr>
                <th>Employee ID</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th style="width: 160px;">Actions</th>
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
                <td>
                  <button
                    *ngIf="role === 'HR' || role === 'Admin'"
                    class="btn btn-sm btn-success me-1 mb-1"
                    (click)="approve(leave.id)"
                  >
                    <i class="fas fa-check"></i> Approve
                  </button>
                  <button
                    *ngIf="role === 'HR' || role === 'Admin'"
                    class="btn btn-sm btn-danger mb-1"
                    (click)="reject(leave.id)"
                  >
                    <i class="fas fa-times"></i> Reject
                  </button>
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
        <!-- Mobile Timeline Layout -->
        <div class="timeline-mobile d-block d-sm-none">
          <div *ngFor="let leave of pendingLeaves; let i = index" class="timeline-step position-relative mb-4">
            <div class="timeline-dot position-absolute top-0 start-0 translate-middle"></div>
            <div class="timeline-line position-absolute start-0" *ngIf="i < pendingLeaves.length - 1"></div>
            <div class="ms-4 ps-2 pb-2">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="fw-bold text-primary" style="font-size:1.1em;">{{ leave.type }}</span>
                <span class="badge bg-warning text-dark" style="font-size:0.98em; padding:0.4em 1em;">Pending</span>
              </div>
              <div class="small text-muted mb-1">
                <i class="fas fa-calendar-alt me-1"></i>
                <span>{{ leave.from }}</span>
                <span class="mx-1">→</span>
                <span>{{ leave.to }}</span>
              </div>
              <div class="mb-1 small text-secondary">
                <i class="fas fa-user me-1"></i>Employee ID: {{ leave.employeeId }}
              </div>
              <div class="mb-2 small text-muted" *ngIf="leave.reason">
                <i class="fas fa-info-circle me-1"></i>{{ leave.reason }}
              </div>
              <div class="d-flex flex-column gap-2 mt-2">
                <button
                  class="btn btn-success btn-sm w-100"
                  (click)="approve(leave.id)"
                >
                  <i class="fas fa-check"></i> Approve
                </button>
                <button
                  class="btn btn-danger btn-sm w-100"
                  (click)="reject(leave.id)"
                >
                  <i class="fas fa-times"></i> Reject
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="pendingLeaves.length === 0" class="text-center text-muted py-4">
            No pending leave requests.
          </div>
        </div>
      </ng-container>
      <ng-template #loading>
        <app-loading-spinner></app-loading-spinner>
      </ng-template>
    </div>
  `,
})
export class LeaveApproveComponent implements OnInit {
  pendingLeaves$!: Observable<ILeaveRequest[]>;
  role: UserRole | null = null;

  constructor(private leaveService: LeaveService, private auth: AuthService) {}

  ngOnInit() {
    this.auth.getRole().subscribe(role => this.role = role);
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

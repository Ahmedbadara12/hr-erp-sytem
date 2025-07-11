import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { ILeaveRequest } from '../../../../shared/models/leave-request.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-leave-approve',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Approve Leave Requests</h5>
      </div>
      <div class="card-body p-0">
        <ng-container
          *ngIf="pendingLeaves$ | async as pendingLeaves; else loading"
        >
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
                    class="btn btn-sm btn-success me-1"
                    (click)="approve(leave.id)"
                  >
                    <i class="fas fa-check"></i> Approve
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
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
        </ng-container>
        <ng-template #loading>
          <app-loading-spinner></app-loading-spinner>
        </ng-template>
      </div>
    </div>
  `,
})
export class LeaveApproveComponent implements OnInit {
  pendingLeaves$!: Observable<ILeaveRequest[]>;

  constructor(private leaveService: LeaveService) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.pendingLeaves$ = this.leaveService.getLeaves().pipe(
      // Filter for pending status
      map((leaves) => leaves.filter((l) => l.status === 'Pending'))
    );
  }

  approve(id: number) {
    this.leaveService.approveLeave(id);
    this.loadPending();
  }

  reject(id: number) {
    this.leaveService.rejectLeave(id);
    this.loadPending();
  }
}

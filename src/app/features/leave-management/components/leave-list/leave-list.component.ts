import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { ILeaveRequest } from '../../../../shared/models/leave-request.model';
import { Observable, of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService, UserRole } from '../../../../core/services/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { EmployeeService } from '../../../employee-management/services/employee.service';
import { IEmployee } from '../../../../shared/models/employee.model';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [RouterModule, CommonModule, LoadingSpinnerComponent],
  template: `
    <div class="card">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">Leave Requests</h5>
        <a
          *ngIf="role === 'Employee'"
          class="btn btn-primary btn-sm"
          routerLink="/leave/apply"
        >
          <i class="fas fa-plus"></i> Apply for Leave
        </a>
        <span *ngIf="role === 'HR'" class="text-muted small"
          >HR can manage all leave requests</span
        >
      </div>
      <div class="card-body p-0">
        <ng-container *ngIf="leaves$ | async as leaves; else loading">
          <table class="table table-striped mb-0">
            <thead class="table-light">
              <tr>
                <th *ngIf="role !== 'Employee'">Employee ID</th>
                <th *ngIf="role === 'HR'">Name</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th style="width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let leave of leaves">
                <td *ngIf="role !== 'Employee'">{{ leave.employeeId }}</td>
                <td *ngIf="role === 'HR'">
                  {{ getEmployeeName(leave.employeeId) }}
                </td>
                <td>{{ leave.type }}</td>
                <td>{{ leave.from }}</td>
                <td>{{ leave.to }}</td>
                <td>
                  <span
                    [ngClass]="{
                      'badge bg-warning text-dark': leave.status === 'Pending',
                      'badge bg-success': leave.status === 'Approved',
                      'badge bg-danger': leave.status === 'Rejected'
                    }"
                    >{{ leave.status }}</span
                  >
                </td>
                <td>
                  <button
                    *ngIf="role === 'Employee'"
                    class="btn btn-sm btn-danger me-1"
                    title="Delete"
                    (click)="deleteLeave(leave.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    *ngIf="role === 'HR'"
                    class="btn btn-sm btn-info me-1"
                    title="View"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    *ngIf="role === 'HR'"
                    class="btn btn-sm btn-danger me-1"
                    title="Delete"
                    (click)="deleteLeave(leave.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    *ngIf="role === 'HR' && leave.status === 'Pending'"
                    class="btn btn-sm btn-success me-1"
                    title="Approve"
                    (click)="approveLeave(leave.id)"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button
                    *ngIf="role === 'HR' && leave.status === 'Pending'"
                    class="btn btn-sm btn-warning"
                    title="Reject"
                    (click)="rejectLeave(leave.id)"
                  >
                    <i class="fas fa-times"></i>
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
  providers: [LeaveService, EmployeeService],
})
export class LeaveListComponent implements OnInit {
  leaves$!: Observable<ILeaveRequest[]>;
  private userId: number | null = null;
  public role: UserRole | null = null;
  private employees: IEmployee[] = [];

  constructor(
    private leaveService: LeaveService,
    private auth: AuthService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.auth.getRole().subscribe((role) => {
      this.role = role;
      if (role === 'HR') {
        this.leaves$ = this.leaveService.getLeaves();
      } else {
        // All other roles see only their own leaves
        this.leaves$ = this.leaveService
          .getLeaves()
          .pipe(
            map((leaves) => leaves.filter((l) => l.employeeId === this.userId))
          );
      }
      // Fetch all employees for name lookup
      this.employeeService
        .getEmployees()
        .subscribe((emps: IEmployee[]) => (this.employees = emps || []));
    });
  }

  getEmployeeName(id: number): string {
    const emp = this.employees.find((e) => e.id === id);
    return emp ? emp.name : '';
  }

  approveLeave(id: number) {
    this.leaveService.approveLeave(id);
    this.refreshLeaves();
  }

  rejectLeave(id: number) {
    this.leaveService.rejectLeave(id);
    this.refreshLeaves();
  }

  refreshLeaves() {
    if (this.role === 'Employee') {
      this.leaves$ = this.leaveService
        .getLeaves()
        .pipe(
          map((leaves) => leaves.filter((l) => l.employeeId === this.userId))
        );
    } else {
      this.leaves$ = this.leaveService.getLeaves();
    }
  }

  deleteLeave(id: number) {
    if (confirm('Are you sure you want to delete this leave request?')) {
      this.leaveService.deleteLeave(id).subscribe((success) => {
        if (success) {
          this.leaves$ = this.leaveService.getLeaves();
        }
      });
    }
  }
}

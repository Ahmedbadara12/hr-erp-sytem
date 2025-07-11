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
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">My Leave Requests</h5>
        <a
          *ngIf="role === 'Employee'"
          class="btn btn-primary btn-sm"
          routerLink="/leave/apply"
        >
          <i class="fas fa-plus"></i> Apply for Leave
        </a>
      </div>
      <div class="card-body p-0">
        <ng-container *ngIf="userIdLoaded; else loading">
          <ng-container *ngIf="leaves$ | async as leaves; else loading">
            <div class="table-responsive">
              <table class="table table-striped mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                    <th style="width: 120px;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let leave of leaves">
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
                        *ngIf="role === 'Employee' && leave.status === 'Pending'"
                        class="btn btn-sm btn-danger me-1"
                        title="Delete"
                        (click)="deleteLeave(leave.id)"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="leaves.length === 0">
                    <td colspan="5" class="text-center">No leave requests found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ng-container>
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
  userId: number | null = null;
  userIdLoaded = false;
  public role: UserRole | null = null;
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
    this.auth.getRole().subscribe((role) => {
      this.role = role;
      if (role === 'Employee' && this.userId) {
        this.leaves$ = this.leaveService
          .getLeaves()
          .pipe(map((leaves) => leaves.filter((l) => l.employeeId === this.userId)));
      } else {
        this.leaves$ = of([]);
      }
      // Fetch all employees for name lookup (not used for Employee view, but kept for completeness)
      this.employeeService
        .getEmployees()
        .subscribe((emps: IEmployee[]) => (this.employees = emps || []));
    });
  }

  deleteLeave(id: number) {
    if (confirm('Are you sure you want to delete this leave request?')) {
      this.leaveService.deleteLeave(id).subscribe((success) => {
        if (success && this.userId) {
          this.leaves$ = this.leaveService
            .getLeaves()
            .pipe(map((leaves) => leaves.filter((l) => l.employeeId === this.userId)));
        }
      });
    }
  }
}

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ILeaveRequest } from '../../../shared/models/leave-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private mockLeaves: ILeaveRequest[] = [
    {
      id: 1,
      employeeId: 1,
      type: 'Annual',
      from: '2024-06-01',
      to: '2024-06-05',
      status: 'Approved',
      reason: 'Family vacation'
    },
    {
      id: 2,
      employeeId: 2,
      type: 'Sick',
      from: '2024-06-10',
      to: '2024-06-12',
      status: 'Pending',
      reason: 'Flu'
    },
    {
      id: 3,
      employeeId: 1,
      type: 'Unpaid',
      from: '2024-07-01',
      to: '2024-07-03',
      status: 'Rejected',
      reason: 'Personal reasons'
    },
    {
      id: 4,
      employeeId: 2,
      type: 'Annual',
      from: '2024-07-10',
      to: '2024-07-15',
      status: 'Pending',
      reason: 'Travel'
    },
    {
      id: 5,
      employeeId: 1,
      type: 'Sick',
      from: '2024-08-01',
      to: '2024-08-02',
      status: 'Pending',
      reason: 'Medical checkup'
    }
  ];

  constructor(private auth: AuthService) {}

  getLeaves(): Observable<ILeaveRequest[]> {
    return of(this.mockLeaves);
  }

  getLeaveById(id: number): Observable<ILeaveRequest | undefined> {
    return of(this.mockLeaves.find((l) => l.id === id));
  }

  addLeave(leave: Partial<ILeaveRequest>): Observable<ILeaveRequest> {
    const employeeId = this.auth.getUserId();
    if (!employeeId) {
      return throwError(() => new Error('No userId found for leave request.'));
    }
    const newLeave: ILeaveRequest = {
      id: this.mockLeaves.length + 1,
      employeeId,
      type: leave.type as any,
      from: leave.from!,
      to: leave.to!,
      status: 'Pending',
      reason: leave.reason,
    };
    this.mockLeaves.push(newLeave);
    return of(newLeave);
  }

  approveLeave(id: number): void {
    const leave = this.mockLeaves.find((l) => l.id === id);
    if (leave) {
      leave.status = 'Approved';
    }
  }

  rejectLeave(id: number): void {
    const leave = this.mockLeaves.find((l) => l.id === id);
    if (leave) {
      leave.status = 'Rejected';
    }
  }

  updateLeave(
    id: number,
    leave: Partial<ILeaveRequest>
  ): Observable<ILeaveRequest | undefined> {
    const index = this.mockLeaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.mockLeaves[index] = { ...this.mockLeaves[index], ...leave };
      return of(this.mockLeaves[index]);
    }
    return of(undefined);
  }

  deleteLeave(id: number): Observable<boolean> {
    const index = this.mockLeaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.mockLeaves.splice(index, 1);
      return of(true);
    }
    return of(false);
  }
}

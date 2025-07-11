import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ILeaveRequest } from '../../../shared/models/leave-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../shared/services/notification.service';

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
      reason: 'Family vacation',
    },
    {
      id: 2,
      employeeId: 2,
      type: 'Sick',
      from: '2024-06-10',
      to: '2024-06-12',
      status: 'Pending',
      reason: 'Flu',
    },
    {
      id: 3,
      employeeId: 1,
      type: 'Unpaid',
      from: '2024-07-01',
      to: '2024-07-03',
      status: 'Rejected',
      reason: 'Personal reasons',
    },
    {
      id: 4,
      employeeId: 2,
      type: 'Annual',
      from: '2024-07-10',
      to: '2024-07-15',
      status: 'Pending',
      reason: 'Travel',
    },
    {
      id: 5,
      employeeId: 1,
      type: 'Sick',
      from: '2024-08-01',
      to: '2024-08-02',
      status: 'Pending',
      reason: 'Medical checkup',
    },
  ];
  private leavesSubject = new BehaviorSubject<ILeaveRequest[]>(
    this.mockLeaves.slice()
  );

  constructor(
    private auth: AuthService,
    private notification: NotificationService
  ) {}

  getLeaves(): Observable<ILeaveRequest[]> {
    return this.leavesSubject.asObservable();
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
    this.leavesSubject.next(this.mockLeaves.slice());
    this.notification.show('success', 'Leave request submitted!');
    return of(newLeave);
  }

  approveLeave(id: number): void {
    const role = this.auth['getStoredRole'] ? this.auth['getStoredRole']() : null;
    if (role !== 'HR' && role !== 'Admin') {
      this.notification.show('danger', 'Only HR or Admin can approve leave!');
      return;
    }
    const leave = this.mockLeaves.find((l) => l.id === id);
    if (leave) {
      leave.status = 'Approved';
      this.leavesSubject.next(this.mockLeaves.slice());
      this.notification.show('success', 'Leave approved!');
    }
  }

  rejectLeave(id: number): void {
    const role = this.auth['getStoredRole'] ? this.auth['getStoredRole']() : null;
    if (role !== 'HR' && role !== 'Admin') {
      this.notification.show('danger', 'Only HR or Admin can reject leave!');
      return;
    }
    const leave = this.mockLeaves.find((l) => l.id === id);
    if (leave) {
      leave.status = 'Rejected';
      this.leavesSubject.next(this.mockLeaves.slice());
      this.notification.show('danger', 'Leave rejected!');
    }
  }

  updateLeave(
    id: number,
    leave: Partial<ILeaveRequest>
  ): Observable<ILeaveRequest | undefined> {
    const index = this.mockLeaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.mockLeaves[index] = { ...this.mockLeaves[index], ...leave };
      this.leavesSubject.next(this.mockLeaves.slice());
      this.notification.show('info', 'Leave updated!');
      return of(this.mockLeaves[index]);
    }
    return of(undefined);
  }

  deleteLeave(id: number): Observable<boolean> {
    const index = this.mockLeaves.findIndex((l) => l.id === id);
    if (index !== -1) {
      this.mockLeaves.splice(index, 1);
      this.leavesSubject.next(this.mockLeaves.slice());
      this.notification.show('danger', 'Leave deleted!');
      return of(true);
    }
    return of(false);
  }
}

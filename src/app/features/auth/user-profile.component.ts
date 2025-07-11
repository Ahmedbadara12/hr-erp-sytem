import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card p-4 mt-4" style="max-width: 400px; margin: auto;">
      <h4 class="mb-3">User Profile</h4>
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input class="form-control" [value]="username" disabled />
      </div>
      <div class="mb-3">
        <label class="form-label">Current Role</label>
        <input class="form-control" [value]="role" disabled />
      </div>
      <div class="mb-3">
        <label class="form-label">Request Role Change</label>
        <select class="form-select" [(ngModel)]="requestedRole">
          <option [ngValue]="null">Select new role</option>
          <option *ngFor="let r of roles" [ngValue]="r" [disabled]="r === role">{{ r }}</option>
        </select>
      </div>
      <button class="btn btn-primary w-100" [disabled]="!requestedRole || requestedRole === role" (click)="requestRoleChange()">Request Change</button>
    </div>
  `
})
export class UserProfileComponent {
  @Input() username: string = 'demo-user';
  @Input() role: UserRole = 'Employee';
  @Output() roleChangeRequested = new EventEmitter<UserRole>();
  roles: UserRole[] = ['Admin', 'Employee', 'HR'];
  requestedRole: UserRole | null = null;

  requestRoleChange() {
    if (this.requestedRole && this.requestedRole !== this.role) {
      this.roleChangeRequested.emit(this.requestedRole);
    }
  }
} 
import { Component } from '@angular/core';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container d-flex justify-content-center align-items-center" style="min-height: 60vh;">
      <div class="card p-4" style="min-width: 320px;">
        <h4 class="mb-3">Login</h4>
        <form (ngSubmit)="onLogin()">
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input class="form-control" [(ngModel)]="username" name="username" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select class="form-select" [(ngModel)]="role" name="role" required>
              <option value="">Select role</option>
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="ProjectManager">Project Manager</option>
            </select>
          </div>
          <button class="btn btn-primary w-100" type="submit" [disabled]="!role || !username">Login</button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  role: UserRole | '' = '';
  username: string = '';
  constructor(private auth: AuthService, private router: Router) {}
  onLogin() {
    if (this.role && this.username) {
      this.auth.login(this.role, this.username);
      this.router.navigate(['/']);
    }
  }
} 
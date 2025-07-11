import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserRole } from '../../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div
      class="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light"
    >
      <div class="text-center p-4 rounded shadow bg-white">
        <h1 class="display-4 text-danger mb-3">
          <i class="fas fa-exclamation-triangle"></i> 404
        </h1>
        <h2 class="mb-3">Page Not Found</h2>
        <p class="mb-4">Sorry, the page you are looking for does not exist.</p>
        <ng-container *ngIf="isLoggedIn$ | async; else loginBtn">
          <button class="btn btn-primary" (click)="goToDashboard()">
            Go to Dashboard
          </button>
        </ng-container>
        <ng-template #loginBtn>
          <a routerLink="/login" class="btn btn-primary">Go to Login</a>
        </ng-template>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  isLoggedIn$ = this.auth.isLoggedIn();

  goToDashboard() {
    this.auth.getRole().subscribe((role: UserRole | null) => {
      if (role === 'Admin') this.router.navigate(['/payroll']);
      else if (role === 'HR') this.router.navigate(['/employee']);
      else if (role === 'Employee') this.router.navigate(['/leave']);
      else if (role === 'ProjectManager') this.router.navigate(['/tasks']);
      else this.router.navigate(['/home']);
    });
  }
}

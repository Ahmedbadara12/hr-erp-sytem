import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">
            <i class="fas fa-users-cog"></i>
          </div>
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to your HR ERP account</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <!-- Login Button - Moved Above Form -->
          <button class="btn btn-odoo w-100 login-btn mb-3" type="submit">
            <i class="fas fa-sign-in-alt me-2"></i>Sign In
          </button>

          <div class="form-group">
            <label class="form-label" for="login-username">
              <i class="fas fa-user me-2"></i>Username
            </label>
            <input
              id="login-username"
              class="form-control"
              [(ngModel)]="username"
              name="username"
              required
              placeholder="Enter your username"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-role">
              <i class="fas fa-user-tag me-2"></i>Role
            </label>
            <select
              id="login-role"
              class="form-select"
              [(ngModel)]="role"
              name="role"
              required
            >
              <option value="">Select your role</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </form>

        <div class="login-footer">
          <p class="text-muted small">
            <i class="fas fa-shield-alt me-1"></i>
            Secure login powered by HR ERP
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
      }

      .login-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        padding: 2.5rem;
        width: 100%;
        max-width: 400px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin: 0;
      }

      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .login-logo {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #7c3aed, #a78bfa);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
      }

      .login-logo i {
        font-size: 2rem;
        color: white;
      }

      .login-title {
        color: #1f2937;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .login-subtitle {
        color: #6b7280;
        font-size: 1rem;
        margin-bottom: 0;
      }

      .login-form {
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        color: #374151;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
      }

      .form-control,
      .form-select {
        border: 2px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 0.875rem 1rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #f9fafb;
      }

      .form-control:focus,
      .form-select:focus {
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        background: white;
        outline: none;
      }

      .login-btn {
        padding: 1rem;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 0.75rem;
        margin-top: 1rem;
        transition: all 0.3s ease;
      }

      .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
      }

      .login-footer {
        text-align: center;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
      }

      body.noscroll,
      html.noscroll {
        overflow: hidden !important;
        height: 100vh !important;
      }

      @media (max-width: 480px) {
        .login-card {
          padding: 2rem 1.5rem;
          margin: 1rem;
        }

        .login-logo {
          width: 70px;
          height: 70px;
        }

        .login-logo i {
          font-size: 1.75rem;
        }

        .login-title {
          font-size: 1.5rem;
        }

        .login-subtitle {
          font-size: 0.9rem;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  role: UserRole | '' = '';
  username: string = '';
  private isBrowser: boolean;

  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      document.body.classList.add('noscroll');
      document.documentElement.classList.add('noscroll');
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      document.body.classList.remove('noscroll');
      document.documentElement.classList.remove('noscroll');
    }
  }

  onLogin() {
    if (this.username && this.role) {
      this.auth.login(this.role as UserRole, this.username);
      this.router.navigate(['/home']);
    }
  }
}

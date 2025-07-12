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
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ValidationService } from '../../shared/services/validation.service';
import {
  AlertComponent,
  AlertType,
} from '../../shared/components/alert/alert.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, InputComponent],
  template: `
    <div class="login-container">
      <div class="login-card">
        <!-- Alert Messages -->
        <app-alert
          *ngIf="alertMessage"
          [type]="alertType"
          [message]="alertMessage"
          [title]="alertTitle"
          [dismissible]="true"
          [autoDismiss]="true"
          [autoDismissTime]="5000"
          (dismissed)="clearAlert()"
        ></app-alert>

        <div class="login-header">
          <div class="login-logo">
            <i class="fas fa-users-cog"></i>
          </div>
          <h2 class="login-title">Welcome Back</h2>
          <p class="login-subtitle">Sign in to your HR ERP account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="login-form">
          <!-- Login Button - Moved Above Form -->
          <button
            class="btn btn-odoo w-100 login-btn mb-3"
            type="submit"
            [disabled]="loginForm.invalid || isSubmitting"
          >
            <i class="fas fa-sign-in-alt me-2"></i>
            <span *ngIf="!isSubmitting">Sign In</span>
            <span *ngIf="isSubmitting">Signing In...</span>
          </button>

          <div class="form-group">
            <label for="login-username" class="form-label">
              <i class="fas fa-user me-2"></i>Username
              <span class="required-indicator">*</span>
            </label>
            <input
              id="login-username"
              type="text"
              class="form-control"
              formControlName="username"
              placeholder="Enter your name"
              autocomplete="username"
              [class.is-invalid]="hasError(loginForm.get('username')!)"
              [class.is-valid]="isValid(loginForm.get('username')!)"
            />
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(loginForm.get('username')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ getErrorMessage(loginForm.get('username')!, 'Username') }}
              </div>
              <div
                *ngIf="isValid(loginForm.get('username')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Username looks good!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Enter your name (3-20 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="login-role" class="form-label">
              <i class="fas fa-user-tag me-2"></i>Select Role
              <span class="required-indicator">*</span>
            </label>
            <select
              id="login-role"
              class="form-control"
              formControlName="role"
              [class.is-invalid]="hasError(loginForm.get('role')!)"
              [class.is-valid]="isValid(loginForm.get('role')!)"
            >
              <option value="">Choose your role</option>
              <option value="Employee">Employee</option>
              <option value="HR">HR Manager</option>
              <option value="Admin">Administrator</option>
              <option value="ProjectManager">Project Manager</option>
            </select>
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(loginForm.get('role')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ getErrorMessage(loginForm.get('role')!, 'Role') }}
              </div>
              <div
                *ngIf="isValid(loginForm.get('role')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Role selected!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Select your role to access appropriate features
            </div>
          </div>

          <div class="form-group">
            <label for="login-rememberMe" class="form-label">
              <i class="fas fa-calendar me-2"></i>Remember Me
            </label>
            <div class="checkbox-wrapper">
              <input
                id="login-rememberMe"
                type="checkbox"
                formControlName="rememberMe"
                class="form-check-input"
              />
              <label for="login-rememberMe" class="form-check-label">
                Keep me signed in for 30 days
              </label>
            </div>
          </div>
        </form>

        <div class="login-footer">
          <p class="demo-info">
            <i class="fas fa-info-circle me-2"></i>
            This is a demo application. Use any username/password combination.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
      }

      .login-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        padding: 3rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 450px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .login-logo {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        color: white;
        font-size: 2rem;
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }

      .login-title {
        color: #2d3748;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .login-subtitle {
        color: #718096;
        font-size: 1.1rem;
      }

      .login-form {
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: flex;
        align-items: center;
        font-weight: 700;
        color: #000000;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
      }

      .required-indicator {
        color: #e53e3e;
        margin-left: 0.25rem;
        font-weight: 700;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #fff;
        color: #2d3748;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-control.is-valid {
        border-color: #48bb78;
        background-color: #f0fff4;
      }

      .form-control.is-invalid {
        border-color: #f56565;
        background-color: #fff5f5;
      }

      .input-feedback {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }

      .error-message {
        color: #e53e3e;
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .success-message {
        color: #38a169;
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .field-help {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #718096;
        display: flex;
        align-items: center;
      }

      .checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .form-check-input {
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.375rem;
        cursor: pointer;
      }

      .form-check-input:checked {
        background-color: #667eea;
        border-color: #667eea;
      }

      .form-check-label {
        color: #4a5568;
        font-size: 0.95rem;
        cursor: pointer;
      }

      .btn {
        padding: 0.875rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 1rem;
      }

      .btn-odoo {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-odoo:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .login-footer {
        text-align: center;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
      }

      .demo-info {
        color: #718096;
        font-size: 0.875rem;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .login-container {
          padding: 1rem;
        }

        .login-card {
          padding: 2rem;
        }

        .login-title {
          font-size: 1.75rem;
        }

        .login-subtitle {
          font-size: 1rem;
        }

        .login-logo {
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
        }
      }

      /* Dark Mode Support */
      @media (prefers-color-scheme: dark) {
        .login-card {
          background: rgba(26, 32, 44, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .login-title {
          color: #e2e8f0;
        }

        .login-subtitle {
          color: #a0aec0;
        }

        .form-label {
          color: #ffffff;
          text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .form-control {
          background: #2d3748;
          border-color: #4a5568;
          color: #e2e8f0;
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .form-check-label {
          color: #e2e8f0;
        }

        .demo-info {
          color: #a0aec0;
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isSubmitting = false;

  // Alert properties
  alertMessage = '';
  alertType: AlertType = 'info';
  alertTitle = '';
  showFeedback = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {
    this.loginForm = this.fb.group({
      username: [''],
      role: ['Employee'],
      rememberMe: [false],
    });
  }

  ngOnInit() {
    // Check if user is already logged in
    this.authService.isLoggedIn().subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onLogin() {
    // Debug: Log the form state
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form values:', this.loginForm.value);
    console.log(
      'Username control value:',
      this.loginForm.get('username')?.value
    );

    this.isSubmitting = true;
    const { username, role, rememberMe } = this.loginForm.value;

    // Debug: Log the form values
    console.log('Login form values:', { username, role, rememberMe });

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Use the actual username from form, or default to 'demo-user' if empty
        const actualUsername = username || 'demo-user';
        console.log('Logging in with username:', actualUsername);
        this.authService.login(role as UserRole, actualUsername);

        if (rememberMe) {
          // Store remember me preference
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('rememberMe', 'true');
          }
        }

        this.showAlert(
          'success',
          'Login Successful',
          'Welcome back! Redirecting to dashboard...'
        );

        // Navigate to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);
      } catch (error) {
        this.showAlert(
          'danger',
          'Login Failed',
          'Invalid credentials. Please try again.'
        );
      } finally {
        this.isSubmitting = false;
      }
    }, 1000);
  }

  markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Validation helper methods
  hasError(control: any): boolean {
    return this.validationService.hasError(control);
  }

  isValid(control: any): boolean {
    return this.validationService.isValid(control);
  }

  getErrorMessage(control: any, fieldName: string): string {
    return this.validationService.getErrorMessage(control, fieldName);
  }

  // Alert methods
  showAlert(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
  }

  clearAlert() {
    this.alertMessage = '';
    this.alertTitle = '';
  }
}

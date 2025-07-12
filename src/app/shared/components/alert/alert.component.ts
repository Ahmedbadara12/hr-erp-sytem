import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' | 'light' | 'dark';

export interface AlertConfig {
  type: AlertType;
  message: string;
  title?: string;
  dismissible?: boolean;
  autoDismiss?: boolean;
  autoDismissTime?: number;
  icon?: string;
  showIcon?: boolean;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="message && !dismissedState" 
      class="alert-container"
      [ngClass]="'alert-' + type"
      role="alert"
      [@alertAnimation]
    >
      <div class="alert-content">
        <div class="alert-icon" *ngIf="showIcon">
          <i [class]="getIconClass()"></i>
        </div>
        
        <div class="alert-body">
          <h6 class="alert-title" *ngIf="title">{{ title }}</h6>
          <p class="alert-message">{{ message }}</p>
        </div>
        
        <button 
          *ngIf="dismissible" 
          type="button" 
          class="alert-close" 
          (click)="dismiss()"
          aria-label="Close alert"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .alert-container {
      position: relative;
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: 0.75rem;
      font-size: 0.95rem;
      line-height: 1.5;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .alert-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .alert-body {
      flex: 1;
      min-width: 0;
    }

    .alert-title {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
      font-size: 1rem;
    }

    .alert-message {
      margin: 0;
      line-height: 1.4;
    }

    .alert-close {
      background: none;
      border: none;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    .alert-close:hover {
      opacity: 1;
    }

    /* Alert Types */
    .alert-success {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-color: #c3e6cb;
      color: #155724;
    }

    .alert-danger {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-color: #f5c6cb;
      color: #721c24;
    }

    .alert-warning {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border-color: #ffeaa7;
      color: #856404;
    }

    .alert-info {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border-color: #bee5eb;
      color: #0c5460;
    }

    .alert-primary {
      background: linear-gradient(135deg, #cce5ff 0%, #b3d9ff 100%);
      border-color: #b3d9ff;
      color: #004085;
    }

    .alert-secondary {
      background: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
      border-color: #d6d8db;
      color: #383d41;
    }

    .alert-light {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-color: #e9ecef;
      color: #495057;
    }

    .alert-dark {
      background: linear-gradient(135deg, #d6d8db 0%, #c6c8ca 100%);
      border-color: #c6c8ca;
      color: #1b1e21;
    }

    /* Animation */
    .alert-container {
      animation: slideInDown 0.3s ease-out;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .alert-container {
        padding: 0.75rem 1rem;
        font-size: 0.9rem;
      }

      .alert-content {
        gap: 0.5rem;
      }

      .alert-icon {
        width: 18px;
        height: 18px;
        font-size: 0.9rem;
      }

      .alert-close {
        width: 18px;
        height: 18px;
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .alert-success {
        background: linear-gradient(135deg, #1e4d2b 0%, #155724 100%);
        border-color: #155724;
        color: #d4edda;
      }

      .alert-danger {
        background: linear-gradient(135deg, #4d1e1e 0%, #721c24 100%);
        border-color: #721c24;
        color: #f8d7da;
      }

      .alert-warning {
        background: linear-gradient(135deg, #4d3e1e 0%, #856404 100%);
        border-color: #856404;
        color: #fff3cd;
      }

      .alert-info {
        background: linear-gradient(135deg, #1e4d4d 0%, #0c5460 100%);
        border-color: #0c5460;
        color: #d1ecf1;
      }
    }
  `],
  animations: [
    // Add animations here if needed
  ]
})
export class AlertComponent {
  @Input() type: AlertType = 'info';
  @Input() message = '';
  @Input() title = '';
  @Input() dismissible = false;
  @Input() autoDismiss = false;
  @Input() autoDismissTime = 5000;
  @Input() icon = '';
  @Input() showIcon = true;

  @Output() dismissed = new EventEmitter<void>();

  dismissedState = false;
  private autoDismissTimer?: any;

  ngOnInit() {
    if (this.autoDismiss && this.autoDismissTime > 0) {
      this.autoDismissTimer = setTimeout(() => {
        this.dismiss();
      }, this.autoDismissTime);
    }
  }

  ngOnDestroy() {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
    }
  }

  dismiss() {
    this.dismissedState = true;
    this.dismissed.emit();
  }

  getIconClass(): string {
    if (this.icon) {
      return this.icon;
    }

    const iconMap: Record<AlertType, string> = {
      success: 'fas fa-check-circle',
      danger: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
      primary: 'fas fa-info-circle',
      secondary: 'fas fa-info-circle',
      light: 'fas fa-info-circle',
      dark: 'fas fa-info-circle'
    };

    return iconMap[this.type] || 'fas fa-info-circle';
  }
}

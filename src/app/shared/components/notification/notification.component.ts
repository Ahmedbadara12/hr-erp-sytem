import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
  NotificationService,
  Notification,
} from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container" role="region" aria-label="Notifications">
      <div
        *ngFor="let notification of notifications; trackBy: trackByNotification"
        class="notification-item"
        [@notificationAnimation]
        [class]="'notification-' + notification.type"
        role="alert"
        [attr.aria-live]="notification.type === 'error' ? 'assertive' : 'polite'"
        [attr.aria-label]="'Notification: ' + notification.message"
      >
        <div class="notification-content">
          <div class="notification-icon">
            <i 
              [class]="getIconClass(notification.type)"
              [attr.aria-hidden]="true"
            ></i>
          </div>
          <div class="notification-body">
            <div class="notification-message">{{ notification.message }}</div>
            <div *ngIf="notification.details" class="notification-details">
              {{ notification.details }}
            </div>
          </div>
          <button
            class="notification-close"
            (click)="removeNotification(notification.id)"
            aria-label="Close notification"
            type="button"
          >
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div 
          *ngIf="notification.duration !== 0"
          class="notification-progress"
          [style.animation-duration]="notification.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      width: calc(100vw - 2rem);
    }

    .notification-item {
      background: var(--surface-primary);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--border-light);
      overflow: hidden;
      position: relative;
      backdrop-filter: blur(10px);
      border-left: 4px solid;
    }

    .notification-success {
      border-left-color: var(--success);
    }

    .notification-error {
      border-left-color: var(--danger);
    }

    .notification-info {
      border-left-color: var(--info);
    }

    .notification-warning {
      border-left-color: var(--warning);
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
    }

    .notification-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.875rem;
    }

    .notification-success .notification-icon {
      background: var(--success-bg, #d1fae5);
      color: var(--success-text, #065f46);
    }

    .notification-error .notification-icon,
    .notification-danger .notification-icon {
      background: #fee2e2;
      color: #991b1b;
    }

    .notification-info .notification-icon {
      background: #dbeafe;
      color: #1e40af;
    }

    .notification-warning .notification-icon {
      background: #fef3c7;
      color: #92400e;
    }

    .notification-body {
      flex: 1;
      min-width: 0;
    }

    .notification-message {
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.4;
      margin-bottom: 0.25rem;
    }

    .notification-details {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .notification-close {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .notification-close:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    .notification-progress {
      height: 3px;
      background: #e5e7eb;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .notification-progress::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background: currentColor;
      animation: progress-shrink linear forwards;
    }

    .notification-success .notification-progress::after {
      background: #10b981;
    }

    .notification-error .notification-progress::after,
    .notification-danger .notification-progress::after {
      background: #ef4444;
    }

    .notification-info .notification-progress::after {
      background: #3b82f6;
    }

    .notification-warning .notification-progress::after {
      background: #f59e0b;
    }

    @keyframes progress-shrink {
      from { width: 100%; }
      to { width: 0%; }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .notification-item {
        background: var(--surface-primary);
        border-color: var(--border-light);
      }

      .notification-message {
        color: var(--text-primary);
      }

      .notification-details {
        color: var(--text-secondary);
      }

      .notification-close:hover {
        background: var(--surface-secondary);
        color: var(--text-secondary);
      }

      .notification-success .notification-icon {
        background: var(--success-bg, #166534);
        color: var(--success-text, #bbf7d0);
      }
      .notification-error .notification-icon,
      .notification-danger .notification-icon {
        background: var(--danger-bg, #991b1b);
        color: var(--danger-text, #fecaca);
      }
      .notification-info .notification-icon {
        background: var(--info-bg, #312e81);
        color: var(--info-text, #c7d2fe);
      }
      .notification-warning .notification-icon {
        background: var(--warning-bg, #b45309);
        color: var(--warning-text, #fde68a);
      }

      .notification-success .notification-progress::after {
        background: var(--success, #10b981);
      }
      .notification-error .notification-progress::after,
      .notification-danger .notification-progress::after {
        background: var(--danger, #ef4444);
      }
      .notification-info .notification-progress::after {
        background: var(--info, #a78bfa);
      }
      .notification-warning .notification-progress::after {
        background: var(--warning, #f59e0b);
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .notification-progress::after {
        animation: none;
      }
    }

    /* Mobile responsiveness */
    @media (max-width: 480px) {
      .notification-container {
        right: 0.5rem;
        left: 0.5rem;
        width: calc(100vw - 1rem);
      }

      .notification-content {
        padding: 0.75rem;
      }
    }
  `],
  animations: [
    trigger('notificationAnimation', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateX(100%) scale(0.95)' 
        }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateX(0) scale(1)' 
          })
        )
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', 
          style({ 
            opacity: 0, 
            transform: 'translateX(100%) scale(0.95)' 
          })
        )
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscriptions: any[] = [];

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
        this.cdr.markForCheck();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success': return 'fas fa-check-circle';
      case 'error': 
      case 'danger': return 'fas fa-exclamation-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'info': return 'fas fa-info-circle';
      default: return 'fas fa-bell';
    }
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}

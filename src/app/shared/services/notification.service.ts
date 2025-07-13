import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'danger';
  message: string;
  details?: string;
  duration?: number;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  constructor(private zone: NgZone) {}

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
      duration: notification.duration ?? 5000
    };

    const currentNotifications = this.notificationsSubject.value;
    this.zone.run(() => {
      this.notificationsSubject.next([...currentNotifications, newNotification]);
    });

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.zone.run(() => this.removeNotification(newNotification.id));
      }, newNotification.duration);
    }
  }

  show(type: Notification['type'], message: string, details?: string, duration?: number): void {
    this.addNotification({ type, message, details, duration });
  }

  showSuccess(message: string, details?: string, duration?: number): void {
    this.show('success', message, details, duration);
  }

  showError(message: string, details?: string, duration?: number): void {
    this.show('error', message, details, duration);
  }

  showInfo(message: string, details?: string, duration?: number): void {
    this.show('info', message, details, duration);
  }

  showWarning(message: string, details?: string, duration?: number): void {
    this.show('warning', message, details, duration);
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.zone.run(() => {
      this.notificationsSubject.next(filteredNotifications);
    });
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
} 
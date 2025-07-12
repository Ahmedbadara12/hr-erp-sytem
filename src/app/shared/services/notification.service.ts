import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  type: 'success' | 'info' | 'warning' | 'danger';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notifications$: Observable<Notification> = this.notificationSubject.asObservable();

  show(type: Notification['type'], message: string) {
    this.notificationSubject.next({ type, message });
  }

  showSuccess(message: string) {
    this.show('success', message);
  }

  showError(message: string) {
    this.show('danger', message);
  }
} 
import { Component, OnInit } from '@angular/core';
import {
  NotificationService,
  Notification,
} from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="notification"
      class="alert alert-{{ notification.type }} position-fixed top-0 end-0 m-4"
      style="z-index: 2000; min-width: 250px;"
      role="alert"
    >
      {{ notification.message }}
    </div>
  `,
  styles: [],
})
export class NotificationComponent implements OnInit {
  notification: Notification | null = null;
  private timeout: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications$.subscribe((n) => {
      this.notification = n;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => (this.notification = null), 3000);
    });
  }
}

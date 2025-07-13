import { TestBed } from '@angular/core/testing';
import { NotificationService, Notification } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService],
    });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('show method', () => {
    it('should add a notification with default duration', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('success');
          expect(notification.message).toBe('Test message');
          expect(notification.duration).toBe(5000);
          expect(notification.id).toBeDefined();
          expect(notification.timestamp).toBeDefined();
          done();
        }
      });

      service.show('success', 'Test message');
    });

    it('should add a notification with custom duration', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.duration).toBe(10000);
          done();
        }
      });

      service.show('info', 'Test message', 'Test details', 10000);
    });

    it('should add a notification with details', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.details).toBe('Test details');
          done();
        }
      });

      service.show('warning', 'Test message', 'Test details');
    });
  });

  describe('showSuccess method', () => {
    it('should add a success notification', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('success');
          expect(notification.message).toBe('Success message');
          done();
        }
      });

      service.showSuccess('Success message');
    });

    it('should add a success notification with details', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('success');
          expect(notification.message).toBe('Success message');
          expect(notification.details).toBe('Success details');
          done();
        }
      });

      service.showSuccess('Success message', 'Success details');
    });
  });

  describe('showError method', () => {
    it('should add an error notification', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('error');
          expect(notification.message).toBe('Error message');
          done();
        }
      });

      service.showError('Error message');
    });

    it('should add an error notification with details', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('error');
          expect(notification.message).toBe('Error message');
          expect(notification.details).toBe('Error details');
          done();
        }
      });

      service.showError('Error message', 'Error details');
    });
  });

  describe('showInfo method', () => {
    it('should add an info notification', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('info');
          expect(notification.message).toBe('Info message');
          done();
        }
      });

      service.showInfo('Info message');
    });
  });

  describe('showWarning method', () => {
    it('should add a warning notification', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.type).toBe('warning');
          expect(notification.message).toBe('Warning message');
          done();
        }
      });

      service.showWarning('Warning message');
    });
  });

  describe('removeNotification method', () => {
    it('should remove a specific notification', (done) => {
      let notificationId: string;

      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0 && !notificationId) {
          notificationId = notifications[0].id;
          service.removeNotification(notificationId);
        } else if (notifications.length === 0) {
          expect(notifications.length).toBe(0);
          done();
        }
      });

      service.showSuccess('Test message');
    });

    it('should not remove notification if id does not exist', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const initialCount = notifications.length;
          service.removeNotification('non-existent-id');
          expect(notifications.length).toBe(initialCount);
          done();
        }
      });

      service.showSuccess('Test message');
    });
  });

  describe('clearAll method', () => {
    it('should clear all notifications', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          service.clearAll();
        } else if (notifications.length === 0) {
          expect(notifications.length).toBe(0);
          done();
        }
      });

      service.showSuccess('Test message 1');
      service.showError('Test message 2');
    });
  });

  describe('auto-removal functionality', () => {
    it('should auto-remove notification after duration', (done) => {
      let notificationCount = 0;

      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0 && notificationCount === 0) {
          notificationCount = notifications.length;
        } else if (notifications.length === 0 && notificationCount > 0) {
          expect(notifications.length).toBe(0);
          done();
        }
      });

      service.show('info', 'Test message', undefined, 100); // 100ms duration
    });

    it('should not auto-remove notification with duration 0', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          setTimeout(() => {
            expect(notifications.length).toBe(1);
            done();
          }, 200);
        }
      });

      service.show('info', 'Test message', undefined, 0); // No auto-removal
    });
  });

  describe('notification properties', () => {
    it('should generate unique IDs for notifications', (done) => {
      const ids: string[] = [];

      service.notifications$.subscribe((notifications) => {
        if (notifications.length >= 3) {
          notifications.forEach((notification) => {
            ids.push(notification.id);
          });

          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(3);
          done();
        }
      });

      service.showSuccess('Message 1');
      service.showError('Message 2');
      service.showInfo('Message 3');
    });

    it('should include timestamp in notifications', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(typeof notification.timestamp).toBe('number');
          expect(notification.timestamp).toBeLessThanOrEqual(
            Date.now()
          );
          done();
        }
      });

      service.showSuccess('Test message');
    });
  });

  describe('multiple notifications', () => {
    it('should maintain multiple notifications', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length === 3) {
          expect(notifications.length).toBe(3);
          expect(notifications[0].type).toBe('success');
          expect(notifications[1].type).toBe('error');
          expect(notifications[2].type).toBe('info');
          done();
        }
      });

      service.showSuccess('Success message');
      service.showError('Error message');
      service.showInfo('Info message');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', (done) => {
      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.message).toBe('');
          done();
        }
      });

      service.showSuccess('');
    });

    it('should handle very long messages', (done) => {
      const longMessage = 'A'.repeat(1000);

      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.message).toBe(longMessage);
          done();
        }
      });

      service.showSuccess(longMessage);
    });

    it('should handle special characters in messages', (done) => {
      const specialMessage =
        'Test message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

      service.notifications$.subscribe((notifications) => {
        if (notifications.length > 0) {
          const notification = notifications[0];
          expect(notification.message).toBe(specialMessage);
          done();
        }
      });

      service.showSuccess(specialMessage);
    });
  });

  describe('performance', () => {
    it('should handle rapid notification additions', (done) => {
      let count = 0;

      service.notifications$.subscribe((notifications) => {
        count = notifications.length;
        if (count === 10) {
          expect(notifications.length).toBe(10);
          done();
        }
      });

      // Add 10 notifications rapidly
      for (let i = 0; i < 10; i++) {
        service.showSuccess(`Message ${i}`);
      }
    });
  });
});

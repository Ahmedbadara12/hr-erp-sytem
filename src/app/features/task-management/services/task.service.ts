import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../../../shared/models/task.model';
import { NotificationService } from '../../../shared/services/notification.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks: Task[] = [
    // Example initial data
    {
      id: 1,
      title: 'Prepare Onboarding Documents',
      description: 'Prepare and upload all onboarding documents for new hires.',
      assignee: 'HR',
      dueDate: '2024-06-15',
      status: 'Pending',
      priority: 'High',
      comments: ['Initial task created.']
    }
  ];
  private tasksSubject = new BehaviorSubject<Task[]>(this.tasks);

  constructor(private notification: NotificationService) {}

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getTaskById(id: number): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  addTask(task: Task): void {
    this.tasks.push(task);
    this.tasksSubject.next(this.tasks.slice());
    this.notification.show('success', 'Task added!');
  }

  updateTask(updatedTask: Task): void {
    const idx = this.tasks.findIndex(t => t.id === updatedTask.id);
    if (idx > -1) {
      this.tasks[idx] = updatedTask;
      this.tasksSubject.next(this.tasks.slice());
      this.notification.show('info', 'Task updated!');
    }
  }

  deleteTask(id: number): void {
    this.tasks = this.tasks.filter(task => task.id !== id);
    this.tasksSubject.next(this.tasks.slice());
    this.notification.show('danger', 'Task deleted!');
  }
} 
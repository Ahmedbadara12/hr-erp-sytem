import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../shared/models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card w-100 mt-4">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <span class="fs-5 fw-bold">Task Details</span>
        <button class="btn btn-secondary btn-sm" (click)="close.emit()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="card-body">
        <h5 class="fw-bold mb-2">{{ task.title }}</h5>
        <p class="mb-2">{{ task.description }}</p>
        <div class="mb-2"><strong>Assignee:</strong> {{ task.assignee }}</div>
        <div class="mb-2"><strong>Due Date:</strong> {{ task.dueDate }}</div>
        <div class="mb-2">
          <strong>Status:</strong>
          <select
            class="form-select d-inline w-auto ms-2"
            [(ngModel)]="task.status"
            (change)="statusChanged.emit(task.status)"
            [disabled]="!canUpdateStatus"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div class="mb-2"><strong>Priority:</strong> {{ task.priority }}</div>
        <div class="mb-3">
          <strong>Comments:</strong>
          <ul class="list-group mb-2">
            <li
              *ngFor="let comment of task.comments"
              class="list-group-item py-1"
            >
              {{ comment }}
            </li>
          </ul>
          <form class="d-flex" (ngSubmit)="addComment()">
            <input
              class="form-control me-2"
              [(ngModel)]="newComment"
              name="newComment"
              placeholder="Add comment..."
            />
            <button
              class="btn btn-primary btn-sm"
              type="submit"
              [disabled]="!newComment.trim()"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class TaskDetailComponent {
  @Input() task!: Task;
  @Input() canUpdateStatus = false;
  @Output() statusChanged = new EventEmitter<string>();
  @Output() commentAdded = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  newComment = '';

  addComment() {
    if (this.newComment.trim()) {
      this.commentAdded.emit(this.newComment.trim());
      this.newComment = '';
    }
  }
}

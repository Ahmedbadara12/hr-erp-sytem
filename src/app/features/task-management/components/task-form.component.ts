import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../shared/models/task.model';
import { EmployeeService } from '../../../features/employee-management/services/employee.service';
import { IEmployee } from '../../../shared/models/employee.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="p-3">
      <!-- Form Action Buttons - Moved Above Form -->
      <div class="d-flex justify-content-end mb-3" *ngIf="!readonly">
        <button type="submit" class="btn btn-primary me-2">Save</button>
        <button type="button" class="btn btn-secondary" (click)="cancel.emit()">
          Cancel
        </button>
      </div>
      
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input
          class="form-control"
          [(ngModel)]="task.title"
          name="title"
          required
          [disabled]="readonly"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea
          class="form-control"
          [(ngModel)]="task.description"
          name="description"
          rows="3"
          [disabled]="readonly"
        ></textarea>
      </div>
      <div class="mb-3" *ngIf="role !== 'Employee'">
        <label class="form-label">Assignee</label>
        <select
          class="form-select"
          [(ngModel)]="task.assignee"
          name="assignee"
          required
          [disabled]="readonly"
        >
          <option value="">Select employee</option>
          <option *ngFor="let emp of employees" [value]="emp.id">
            {{ emp.name }}
          </option>
        </select>
      </div>
      <div class="mb-3" *ngIf="role === 'Employee'">
        <label class="form-label">Assignee</label>
        <input class="form-control" [value]="userId" name="assignee" disabled />
      </div>
      <div class="mb-3">
        <label class="form-label">Due Date</label>
        <input
          type="date"
          class="form-control"
          [(ngModel)]="task.dueDate"
          name="dueDate"
          required
          [disabled]="readonly"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">Status</label>
        <select
          class="form-select"
          [(ngModel)]="task.status"
          name="status"
          required
          [disabled]="readonly"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Priority</label>
        <select
          class="form-select"
          [(ngModel)]="task.priority"
          name="priority"
          required
          [disabled]="readonly"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
    </form>
  `,
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task = {
    id: 0,
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
    comments: [],
  };
  @Input() readonly = false;
  @Input() role: string | null = null;
  @Input() userId: string | number | null = null;
  @Output() submitTask = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();
  employees: IEmployee[] = [];

  constructor(private employeeService: EmployeeService) {}

  ngOnInit() {
    if (this.role !== 'Employee') {
      this.employeeService.getEmployees().subscribe((emps) => {
        this.employees = emps || [];
      });
    } else if (this.userId) {
      this.task.assignee = String(this.userId);
    }
  }

  onSubmit() {
    this.submitTask.emit(this.task);
  }
}

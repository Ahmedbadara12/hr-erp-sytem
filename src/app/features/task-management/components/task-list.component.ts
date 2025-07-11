import { Component, OnInit } from '@angular/core';
import { Task } from '../../../shared/models/task.model';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';
import { TaskDetailComponent } from './task-detail.component';
import { AuthService, UserRole } from '../../../core/services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  template: `
    <div
      *ngIf="
        role === 'Employee' && tasks.length === 0 && showAddTaskFormForEmployee
      "
      class="card w-100 mt-4"
    >
      <div class="card-header">
        <span class="fs-5 fw-bold">Add Your First Task</span>
      </div>
      <div class="card-body">
        <app-task-form
          [task]="emptyTask()"
          (submitTask)="addFirstTaskForEmployee($event)"
          [readonly]="false"
        ></app-task-form>
      </div>
    </div>
    <div class="card w-100 mt-4">
      <div
        class="card-header d-flex justify-content-between align-items-center"
      >
        <span class="fs-5 fw-bold">Task List</span>
        <span class="badge bg-secondary ms-2">Role: {{ role }}</span>
        <button
          class="btn btn-primary btn-sm"
          (click)="openAddTask()"
          *ngIf="isAdminOrHR"
        >
          <i class="fas fa-plus me-1"></i> Add Task
        </button>
      </div>
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-4">
            <select class="form-select" [(ngModel)]="filterStatus">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div class="col-md-4">
            <input
              class="form-control"
              placeholder="Filter by assignee..."
              [(ngModel)]="filterAssignee"
            />
          </div>
        </div>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th *ngIf="isAdminOrHR">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let task of filteredTasks()"
              [class.table-active]="task.id === selectedTaskId"
            >
              <td (click)="openDetail(task)" style="cursor:pointer">
                {{ task.title }}
              </td>
              <td>{{ task.assignee }}</td>
              <td>{{ task.dueDate }}</td>
              <td>
                <span
                  class="badge"
                  [ngClass]="{
                    'bg-warning text-dark': task.status === 'Pending',
                    'bg-info text-dark': task.status === 'In Progress',
                    'bg-success': task.status === 'Completed'
                  }"
                  >{{ task.status }}</span
                >
              </td>
              <td>
                <span
                  class="badge"
                  [ngClass]="{
                    'bg-danger': task.priority === 'High',
                    'bg-secondary': task.priority === 'Medium',
                    'bg-light text-dark': task.priority === 'Low'
                  }"
                  >{{ task.priority }}</span
                >
              </td>
              <td *ngIf="isAdminOrHR">
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  (click)="openEditTask(task); $event.stopPropagation()"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  (click)="deleteTask(task.id); $event.stopPropagation()"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div
          *ngIf="filteredTasks().length === 0"
          class="text-center text-muted py-4"
        >
          No tasks found.
        </div>
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.3);"
      *ngIf="showTaskForm"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingTask ? 'Edit Task' : 'Add Task' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              (click)="closeTaskForm()"
            ></button>
          </div>
          <div class="modal-body">
            <app-task-form
              [task]="taskFormModel"
              (submitTask)="saveTask($event)"
              (cancel)="closeTaskForm()"
              [readonly]="!isAdminOrHR"
            ></app-task-form>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showTaskForm"></div>

    <!-- Task Detail Modal -->
    <div
      class="modal fade show"
      tabindex="-1"
      style="display: block; background: rgba(0,0,0,0.3);"
      *ngIf="showTaskDetail"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body p-0">
            <app-task-detail
              [task]="selectedTask!"
              (statusChanged)="updateTaskStatus($event)"
              (commentAdded)="addComment($event)"
              (close)="closeTaskDetail()"
              [canUpdateStatus]="canUpdateStatus(selectedTask)"
            ></app-task-detail>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showTaskDetail"></div>
  `,
  styles: [],
  imports: [CommonModule, FormsModule, TaskFormComponent, TaskDetailComponent],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filterStatus = '';
  filterAssignee = '';
  showTaskForm = false;
  showTaskDetail = false;
  editingTask: Task | null = null;
  selectedTask: Task | null = null;
  taskFormModel: Task = this.emptyTask();
  role: UserRole | null = null;
  userId: number | null = null;
  isAdminOrHR = false;
  selectedTaskId: number | null = null;
  showAddTaskFormForEmployee = false;

  constructor(private taskService: TaskService, private auth: AuthService) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks;
      // For Employee: auto-select the first task if none selected
      if (this.role === 'Employee') {
        if (this.tasks.length === 0) {
          this.showAddTaskFormForEmployee = true;
        } else if (this.selectedTaskId == null) {
          const firstTask = this.filteredTasks()[0];
          if (firstTask) {
            this.selectedTaskId = firstTask.id;
            this.selectedTask = { ...firstTask };
          }
        }
      }
    });
    this.auth.getRole().subscribe((role) => {
      this.role = role;
      this.isAdminOrHR =
        role === 'Admin' || role === 'HR' || role === 'ProjectManager';
    });
    this.userId = this.auth.getUserId();
  }

  filteredTasks(): Task[] {
    if (this.role === 'Employee' && this.userId !== null) {
      // Only show tasks assigned to this employee
      return this.tasks.filter((task) => task.assignee === String(this.userId));
    }
    return this.tasks.filter(
      (task) =>
        (!this.filterStatus || task.status === this.filterStatus) &&
        (!this.filterAssignee ||
          task.assignee
            .toLowerCase()
            .includes(this.filterAssignee.toLowerCase()))
    );
  }

  openAddTask() {
    if (!this.isAdminOrHR) return;
    this.editingTask = null;
    this.taskFormModel = this.emptyTask();
    this.showTaskForm = true;
  }

  openEditTask(task: Task) {
    if (!this.isAdminOrHR) return;
    this.editingTask = { ...task };
    this.taskFormModel = { ...task };
    this.showTaskForm = true;
  }

  saveTask(task: Task) {
    if (!this.isAdminOrHR) return;
    if (this.editingTask) {
      this.taskService.updateTask(task);
    } else {
      task.id = this.generateId();
      this.taskService.addTask(task);
    }
    this.closeTaskForm();
  }

  closeTaskForm() {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  openDetail(task: Task) {
    this.selectedTask = { ...task };
    this.selectedTaskId = task.id;
    this.showTaskDetail = true;
  }

  closeTaskDetail() {
    this.showTaskDetail = false;
    this.selectedTask = null;
    this.selectedTaskId = null;
  }

  updateTaskStatus(newStatus: string) {
    if (this.selectedTask && this.canUpdateStatus(this.selectedTask)) {
      this.selectedTask.status = newStatus as Task['status'];
      this.taskService.updateTask(this.selectedTask);
    }
  }

  addComment(comment: string) {
    if (this.selectedTask) {
      this.selectedTask.comments = [...this.selectedTask.comments, comment];
      this.taskService.updateTask(this.selectedTask);
    }
  }

  deleteTask(id: number) {
    if (!this.isAdminOrHR) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id);
    }
  }

  emptyTask(): Task {
    return {
      id: 0,
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      status: 'Pending',
      priority: 'Medium',
      comments: [],
    };
  }

  generateId(): number {
    return this.tasks.length ? Math.max(...this.tasks.map((t) => t.id)) + 1 : 1;
  }

  canUpdateStatus(task: Task | null): boolean {
    if (!task) return false;
    if (this.role === 'Employee' && this.userId !== null) {
      return task.assignee === String(this.userId);
    }
    return this.isAdminOrHR;
  }

  addFirstTaskForEmployee(task: Task) {
    if (this.role === 'Employee') {
      task.id = this.generateId();
      task.assignee = String(this.userId);
      this.taskService.addTask(task);
      this.showAddTaskFormForEmployee = false;
      this.selectedTaskId = task.id;
      this.selectedTask = { ...task };
    }
  }
}

import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Task } from '../../../shared/models/task.model';
import { EmployeeService } from '../../../features/employee-management/services/employee.service';
import { IEmployee } from '../../../shared/models/employee.model';
import { ValidationService } from '../../../shared/services/validation.service';
import {
  AlertComponent,
  AlertType,
} from '../../../shared/components/alert/alert.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, InputComponent],
  template: `
    <div class="task-form-container" [class.modal-form]="isModal">
      <div class="task-form-card" [class.modal-card]="isModal">
        <!-- Alert Messages -->
        <app-alert
          *ngIf="alertMessage"
          [type]="alertType"
          [message]="alertMessage"
          [title]="alertTitle"
          [dismissible]="true"
          [autoDismiss]="true"
          [autoDismissTime]="5000"
          (dismissed)="clearAlert()"
        ></app-alert>

        <div class="task-form-header" *ngIf="!isModal">
          <h2 class="task-form-title">
            <i class="fas fa-tasks me-2"></i>
            {{ isEditMode ? 'Edit' : 'Create' }} Task
          </h2>
          <p class="task-form-subtitle">
            {{ isEditMode ? 'Update task information' : 'Create a new task' }}
          </p>
        </div>

        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
          <div class="form-group">
            <app-input
              label="Task Title"
              type="text"
              [control]="titleControl"
              placeholder="Enter task title"
              icon="fas fa-heading"
              [required]="true"
              helpText="Enter a descriptive title for the task (3-100 characters)"
              successMessage="Title looks good!"
              fieldId="task-title"
              autocomplete="off"
            ></app-input>
          </div>

          <div class="form-group">
            <label for="task-description" class="form-label">
              <i class="fas fa-align-left me-2"></i>Description
              <span class="required-indicator">*</span>
            </label>
            <textarea
              id="task-description"
              class="form-control"
              formControlName="description"
              rows="4"
              placeholder="Enter detailed task description..."
              autocomplete="off"
              [class.is-invalid]="hasError(taskForm.get('description')!)"
              [class.is-valid]="isValid(taskForm.get('description')!)"
            ></textarea>
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(taskForm.get('description')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{
                  getErrorMessage(taskForm.get('description')!, 'Description')
                }}
              </div>
              <div
                *ngIf="isValid(taskForm.get('description')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Description looks good!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Provide a detailed description of the task (10-500 characters)
            </div>
          </div>

          <div class="form-group" *ngIf="role !== 'Employee'">
            <label for="task-assignee" class="form-label">
              <i class="fas fa-user me-2"></i>Assignee
              <span class="required-indicator">*</span>
            </label>
            <select
              id="task-assignee"
              class="form-control"
              formControlName="assignee"
              [class.is-invalid]="hasError(taskForm.get('assignee')!)"
              [class.is-valid]="isValid(taskForm.get('assignee')!)"
              autocomplete="off"
            >
              <option value="">Select employee</option>
              <option *ngFor="let emp of employees" [value]="emp.id">
                {{ emp.name }}
              </option>
            </select>
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(taskForm.get('assignee')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ getErrorMessage(taskForm.get('assignee')!, 'Assignee') }}
              </div>
              <div
                *ngIf="isValid(taskForm.get('assignee')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Assignee selected!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Select the employee to assign this task to
            </div>
          </div>

          <div class="form-group" *ngIf="role === 'Employee'">
            <label for="task-assignee-employee" class="form-label">
              <i class="fas fa-user me-2"></i>Assignee
            </label>
            <input
              id="task-assignee-employee"
              class="form-control"
              [value]="userId"
              disabled
              autocomplete="off"
            />
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              You are automatically assigned to this task
            </div>
          </div>

          <div class="form-group">
            <app-input
              label="Due Date"
              type="date"
              [control]="dueDateControl"
              placeholder="Select due date"
              icon="fas fa-calendar"
              [required]="true"
              helpText="Select the due date for this task"
              successMessage="Due date is valid!"
              fieldId="task-due-date"
              autocomplete="off"
            ></app-input>
          </div>

          <div class="form-group">
            <label for="task-status" class="form-label">
              <i class="fas fa-info-circle me-2"></i>Status
              <span class="required-indicator">*</span>
            </label>
            <select
              id="task-status"
              class="form-control"
              formControlName="status"
              [class.is-invalid]="hasError(taskForm.get('status')!)"
              [class.is-valid]="isValid(taskForm.get('status')!)"
              autocomplete="off"
            >
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(taskForm.get('status')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ getErrorMessage(taskForm.get('status')!, 'Status') }}
              </div>
              <div
                *ngIf="isValid(taskForm.get('status')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Status selected!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Select the current status of the task
            </div>
          </div>

          <div class="form-group">
            <label for="task-priority" class="form-label">
              <i class="fas fa-exclamation-triangle me-2"></i>Priority
              <span class="required-indicator">*</span>
            </label>
            <select
              id="task-priority"
              class="form-control"
              formControlName="priority"
              [class.is-invalid]="hasError(taskForm.get('priority')!)"
              [class.is-valid]="isValid(taskForm.get('priority')!)"
              autocomplete="off"
            >
              <option value="">Select priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div class="input-feedback" *ngIf="showFeedback">
              <div
                *ngIf="hasError(taskForm.get('priority')!)"
                class="error-message"
              >
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ getErrorMessage(taskForm.get('priority')!, 'Priority') }}
              </div>
              <div
                *ngIf="isValid(taskForm.get('priority')!)"
                class="success-message"
              >
                <i class="fas fa-check-circle me-1"></i>
                Priority selected!
              </div>
            </div>
            <div class="field-help">
              <i class="fas fa-info-circle me-1"></i>
              Select the priority level for this task
            </div>
          </div>

          <!-- Form Action Buttons -->
          <div class="form-actions mb-4" *ngIf="!readonly">
            <button
              class="btn btn-odoo"
              type="submit"
              [disabled]="taskForm.invalid || isSubmitting"
            >
              <i class="fas fa-save me-2"></i>
              <span *ngIf="!isSubmitting"
                >{{ isEditMode ? 'Update' : 'Save' }} Task</span
              >
              <span *ngIf="isSubmitting">Saving...</span>
            </button>
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="cancel.emit()"
            >
              <i class="fas fa-times me-2"></i>Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .task-form-container {
        padding: 2rem;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .task-form-container.modal-form {
        padding: 0;
        min-height: auto;
        background: none;
      }

      .task-form-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
      }

      .task-form-card.modal-card {
        background: white;
        backdrop-filter: none;
        border-radius: 0;
        padding: 1rem;
        box-shadow: none;
        max-width: none;
        margin: 0;
      }

      .task-form-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .task-form-title {
        color: #2d3748;
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .task-form-subtitle {
        color: #718096;
        font-size: 1.1rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 0.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .btn-odoo {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .btn-odoo:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
      }

      .btn-outline-secondary {
        background: transparent;
        color: #4a5568;
        border: 2px solid #e2e8f0;
      }

      .btn-outline-secondary:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .task-form {
        margin-top: 2rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-label {
        display: flex;
        align-items: center;
        font-weight: 700;
        color: #000000;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
      }

      .required-indicator {
        color: #e53e3e;
        margin-left: 0.25rem;
        font-weight: 700;
      }

      .form-control {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: #fff;
        color: #2d3748;
      }

      .form-control:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-control.is-valid {
        border-color: #48bb78;
        background-color: #f0fff4;
      }

      .form-control.is-invalid {
        border-color: #f56565;
        background-color: #fff5f5;
      }

      .input-feedback {
        margin-top: 0.5rem;
        font-size: 0.875rem;
      }

      .error-message {
        color: #e53e3e;
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .success-message {
        color: #38a169;
        display: flex;
        align-items: center;
        font-weight: 500;
      }

      .field-help {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #718096;
        display: flex;
        align-items: center;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .task-form-container {
          padding: 1rem;
        }

        .task-form-card {
          padding: 1.5rem;
        }

        .task-form-title {
          font-size: 1.5rem;
        }

        .task-form-subtitle {
          font-size: 1rem;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
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
  @Input() isModal = false;
  @Output() submitTask = new EventEmitter<Task>();
  @Output() cancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  employees: IEmployee[] = [];

  // Alert properties
  alertMessage = '';
  alertType: AlertType = 'info';
  alertTitle = '';
  showFeedback = true;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private validationService: ValidationService
  ) {
    this.taskForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      assignee: ['', Validators.required],
      dueDate: [
        '',
        [Validators.required, this.validationService.dateValidator()],
      ],
      status: ['', Validators.required],
      priority: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.isEditMode = this.task.id > 0;

    if (this.role !== 'Employee') {
      this.employeeService.getEmployees().subscribe((emps) => {
        this.employees = emps || [];
      });
    } else if (this.userId) {
      this.taskForm.patchValue({ assignee: String(this.userId) });
    }

    // Patch form with existing task data
    if (this.isEditMode) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        assignee: this.task.assignee,
        dueDate: this.task.dueDate,
        status: this.task.status,
        priority: this.task.priority,
      });
    }
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.isSubmitting = true;
      const taskData: Task = {
        ...this.task,
        ...this.taskForm.value,
      };
      setTimeout(() => {
        this.submitTask.emit(taskData);
        this.isSubmitting = false;
        this.showAlert('success', 'Task Saved', 'Task has been saved successfully.');
      }, 1000);
    } else {
      this.markFormGroupTouched();
      this.showAlert('warning', 'Validation Error', 'Please fix the errors in the form before submitting.');
    }
  }

  markFormGroupTouched() {
    Object.values(this.taskForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // Validation helper methods
  hasError(control: any): boolean {
    return this.validationService.hasError(control);
  }

  isValid(control: any): boolean {
    return this.validationService.isValid(control);
  }

  getErrorMessage(control: any, fieldName: string): string {
    return this.validationService.getErrorMessage(control, fieldName);
  }

  // Alert methods
  showAlert(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
  }

  clearAlert() {
    this.alertMessage = '';
    this.alertTitle = '';
  }

  // Getter methods for form controls
  get titleControl(): FormControl {
    return this.taskForm.get('title') as FormControl;
  }

  get dueDateControl(): FormControl {
    return this.taskForm.get('dueDate') as FormControl;
  }
}

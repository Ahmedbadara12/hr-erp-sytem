import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-field-container">
      <label *ngIf="label" class="form-label" [attr.for]="fieldId">
        <i *ngIf="icon" [class]="icon + ' me-2'"></i>
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>
      
      <div class="input-wrapper">
        <input 
          [type]="type" 
          class="form-control"
          [class]="getInputClasses()"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          [placeholder]="placeholder"
          [id]="fieldId"
          [attr.autocomplete]="autocomplete"
          [name]="fieldId"
          [attr.aria-describedby]="hasError(control) ? fieldId + '-error' : null"
          [attr.aria-invalid]="hasError(control)"
        />
        
        <div class="input-icon" *ngIf="inputIcon">
          <i [class]="inputIcon"></i>
        </div>
        
        <div class="input-feedback" *ngIf="showFeedback">
          <div *ngIf="hasError(control)" class="error-message" [id]="fieldId + '-error'">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ getErrorMessage(control, label) }}
          </div>
          <div *ngIf="isValid(control)" class="success-message">
            <i class="fas fa-check-circle me-1"></i>
            {{ successMessage || 'Valid' }}
          </div>
        </div>
      </div>
      
      <div class="field-help" *ngIf="helpText">
        <i class="fas fa-info-circle me-1"></i>
        {{ helpText }}
      </div>
    </div>
  `,
  styles: [`
    .form-field-container {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .required-indicator {
      color: #dc2626;
      margin-left: 0.25rem;
      font-weight: 700;
    }

    .input-wrapper {
      position: relative;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #d1d5db;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: #ffffff;
      color: #000000;
      font-weight: 500;
    }

    .form-control::placeholder {
      color: #6b7280;
      opacity: 1;
    }

    .form-control::-webkit-input-placeholder {
      color: #6b7280;
      opacity: 1;
    }

    .form-control::-moz-placeholder {
      color: #6b7280;
      opacity: 1;
    }

    .form-control:-ms-input-placeholder {
      color: #6b7280;
      opacity: 1;
    }

    .form-control:-moz-placeholder {
      color: #6b7280;
      opacity: 1;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      color: #000000;
    }

    .form-control.is-valid {
      border-color: #10b981;
      background-color: #f0fdf4;
      color: #000000;
    }

    .form-control.is-invalid {
      border-color: #ef4444;
      background-color: #fef2f2;
      color: #000000;
    }

    .input-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #a0aec0;
      pointer-events: none;
    }

    .input-feedback {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .error-message {
      color: #dc2626;
      display: flex;
      align-items: center;
      font-weight: 500;
    }

    .success-message {
      color: #059669;
      display: flex;
      align-items: center;
      font-weight: 500;
    }

    .field-help {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
      display: flex;
      align-items: center;
    }

    /* Input Types */
    .form-control[type="email"] {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    .form-control[type="password"] {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    /* Disabled State */
    .form-control:disabled {
      background-color: #f7fafc;
      color: #a0aec0;
      cursor: not-allowed;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .form-control {
        padding: 0.875rem 1rem;
        font-size: 1rem;
      }

      .form-label {
        font-size: 0.9rem;
      }

      .input-feedback {
        font-size: 0.8rem;
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .form-label {
        color: #f9fafb;
      }

      .form-control {
        background: #1f2937;
        border-color: #374151;
        color: #ffffff;
        font-weight: 500;
      }

      .form-control::placeholder {
        color: #9ca3af;
        opacity: 1;
      }

      .form-control::-webkit-input-placeholder {
        color: #9ca3af;
        opacity: 1;
      }

      .form-control::-moz-placeholder {
        color: #9ca3af;
        opacity: 1;
      }

      .form-control:-ms-input-placeholder {
        color: #9ca3af;
        opacity: 1;
      }

      .form-control:-moz-placeholder {
        color: #9ca3af;
        opacity: 1;
      }

      .form-control:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        color: #ffffff;
      }

      .form-control.is-valid {
        background-color: #064e3b;
        border-color: #10b981;
        color: #ffffff;
      }

      .form-control.is-invalid {
        background-color: #450a0a;
        border-color: #ef4444;
        color: #ffffff;
      }

      .field-help {
        color: #9ca3af;
      }
    }

    /* Animation */
    .form-control {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .input-feedback {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class InputComponent implements ControlValueAccessor, OnChanges {
  @Input() label = '';
  @Input() type = 'text';
  @Input() control!: AbstractControl;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() icon = '';
  @Input() inputIcon = '';
  @Input() helpText = '';
  @Input() successMessage = '';
  @Input() showFeedback = true;
  @Input() fieldId = '';
  @Input() autocomplete = '';

  @Output() valueChange = new EventEmitter<any>();

  value: any = '';
  disabled = false;
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private validationService: ValidationService) {
    // Generate unique field ID if not provided
    if (!this.fieldId) {
      this.fieldId = 'field-' + Math.random().toString(36).substr(2, 9);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    if (this.control && this.control.value !== value) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: any): void {
    let value = event.target.value;
    if (this.type === 'number') {
      value = value === '' ? null : Number(value);
    } else if (this.type === 'date') {
      value = value === '' ? null : value; // keep as string, but null if empty
    }
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
    if (this.control) {
      this.control.setValue(value);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  ngOnInit() {
    // Generate unique field ID if not provided
    if (!this.fieldId) {
      this.fieldId = 'field-' + Math.random().toString(36).substr(2, 9);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['control'] && this.control) {
      // Subscribe to value changes on the control
      this.control.valueChanges.subscribe((val: any) => {
        this.value = val;
      });
      // Set initial value
      this.value = this.control.value;
    }
  }

  getInputClasses(): string {
    let classes = 'form-control';
    if (this.hasError(this.control)) {
      classes += ' is-invalid';
    } else if (this.isValid(this.control)) {
      classes += ' is-valid';
    }
    return classes;
  }

  hasError(control: AbstractControl): boolean {
    return this.validationService.hasError(control);
  }

  isValid(control: AbstractControl): boolean {
    return this.validationService.isValid(control);
  }

  getErrorMessage(control: AbstractControl, fieldName: string = 'This field'): string {
    return this.validationService.getErrorMessage(control, fieldName);
  }
} 
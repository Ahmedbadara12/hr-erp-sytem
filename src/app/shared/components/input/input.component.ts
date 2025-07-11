import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="mb-3">
      <label *ngIf="label" class="form-label">{{ label }}</label>
      <input [type]="type" class="form-control" [formControl]="formControl" [placeholder]="placeholder" />
      <div *ngIf="formControl?.invalid && formControl?.touched" class="text-danger">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class InputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() formControl!: FormControl;
  @Input() placeholder = '';
} 
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(31,41,55,0.7);">
      <div class="modal-dialog" role="document">
        <div class="modal-content" style="background: var(--surface-primary); color: var(--text-primary);">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" class="btn-close" aria-label="Close" (click)="close.emit()"></button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close.emit()">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
} 
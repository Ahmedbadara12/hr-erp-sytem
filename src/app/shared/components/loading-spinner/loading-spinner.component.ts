import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="loading-spinner-container"
      [class]="'spinner-' + size"
      role="status"
      [attr.aria-label]="message || 'Loading...'"
    >
      <div class="spinner-overlay" *ngIf="overlay"></div>
      <div class="spinner-content">
        <div class="spinner-animation">
          <div class="spinner-circle"></div>
          <div class="spinner-circle"></div>
          <div class="spinner-circle"></div>
        </div>
        <div class="spinner-message" *ngIf="message">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-spinner-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 9999;
      }

      .spinner-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
      }

      .spinner-animation {
        display: flex;
        gap: 0.25rem;
      }

      .spinner-circle {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #7c3aed;
        animation: spinner-bounce 1.4s ease-in-out infinite both;
      }

      .spinner-circle:nth-child(1) {
        animation-delay: -0.32s;
      }

      .spinner-circle:nth-child(2) {
        animation-delay: -0.16s;
      }

      .spinner-circle:nth-child(3) {
        animation-delay: 0s;
      }

      @keyframes spinner-bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .spinner-message {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 500;
        text-align: center;
      }

      /* Size variants */
      .spinner-sm .spinner-circle {
        width: 6px;
        height: 6px;
      }

      .spinner-sm .spinner-message {
        font-size: 0.75rem;
      }

      .spinner-lg .spinner-circle {
        width: 12px;
        height: 12px;
      }

      .spinner-lg .spinner-message {
        font-size: 1rem;
      }

      .spinner-xl .spinner-circle {
        width: 16px;
        height: 16px;
      }

      .spinner-xl .spinner-message {
        font-size: 1.125rem;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .spinner-circle {
          background: #a78bfa;
        }

        .spinner-message {
          color: #d1d5db;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .spinner-circle {
          animation: none;
          opacity: 0.7;
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() message?: string;
  @Input() overlay = false;
}

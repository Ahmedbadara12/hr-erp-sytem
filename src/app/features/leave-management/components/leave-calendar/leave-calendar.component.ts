import { Component } from '@angular/core';

@Component({
  selector: 'app-leave-calendar',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Leave Calendar</h5>
      </div>
      <div class="card-body">
        <p>(Calendar view will be shown here)</p>
      </div>
    </div>
  `,
})
export class LeaveCalendarComponent {}

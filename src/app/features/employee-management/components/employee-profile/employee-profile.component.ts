import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { IEmployee } from '../../../../shared/models/employee.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="card" *ngIf="employee$ | async as employee; else loading">
      <div class="card-header">
        <h5 class="mb-0">Employee Profile</h5>
      </div>
      <div class="card-body">
        <dl class="row mb-0">
          <dt class="col-sm-3">ID</dt>
          <dd class="col-sm-9">{{ employee.id }}</dd>
          <dt class="col-sm-3">Name</dt>
          <dd class="col-sm-9">{{ employee.name }}</dd>
          <dt class="col-sm-3">Email</dt>
          <dd class="col-sm-9">{{ employee.email }}</dd>
          <dt class="col-sm-3">Position</dt>
          <dd class="col-sm-9">{{ employee.position }}</dd>
          <dt class="col-sm-3">Department</dt>
          <dd class="col-sm-9">{{ employee.department }}</dd>
          <dt class="col-sm-3">Phone</dt>
          <dd class="col-sm-9">{{ employee.phone }}</dd>
          <dt class="col-sm-3">Address</dt>
          <dd class="col-sm-9">{{ employee.address }}</dd>
          <dt class="col-sm-3">Date of Birth</dt>
          <dd class="col-sm-9">{{ employee.dateOfBirth }}</dd>
          <dt class="col-sm-3">Hire Date</dt>
          <dd class="col-sm-9">{{ employee.hireDate }}</dd>
        </dl>
      </div>
    </div>
    <ng-template #loading>
      <div class="alert alert-info">Loading employee profile...</div>
    </ng-template>
  `,
})
export class EmployeeProfileComponent implements OnInit {
  employee$!: Observable<IEmployee | undefined>;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.employee$ = this.employeeService.getEmployeeById(+id);
      }
    });
  }
}

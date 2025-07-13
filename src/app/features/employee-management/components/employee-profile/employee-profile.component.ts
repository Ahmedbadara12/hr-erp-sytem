import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { IEmployee } from '../../../../shared/models/employee.model';
import { Observable } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <ng-container *ngIf="employee$ | async as employee; else loading">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-main">
            <h2 class="profile-name">{{ employee.name }}</h2>
            <div class="profile-position">{{ employee.position }}</div>
            <div class="profile-department">{{ employee.department }}</div>
          </div>
        </div>
        <div class="profile-details">
          <div class="profile-detail-item">
            <span class="label">ID:</span> <span>{{ employee.id }}</span>
          </div>
          <div class="profile-detail-item">
            <span class="label">Email:</span> <span>{{ employee.email }}</span>
          </div>
          <div class="profile-detail-item">
            <span class="label">Phone:</span> <span>{{ employee.phone }}</span>
          </div>
          <div class="profile-detail-item">
            <span class="label">Address:</span>
            <span>{{ employee.address }}</span>
          </div>
          <div class="profile-detail-item">
            <span class="label">Date of Birth:</span>
            <span>{{ employee.dateOfBirth }}</span>
          </div>
          <div class="profile-detail-item">
            <span class="label">Hire Date:</span>
            <span>{{ employee.hireDate }}</span>
          </div>
        </div>
      </div>
    </ng-container>
    <ng-template #loading>
      <div class="alert alert-info">Loading employee profile...</div>
    </ng-template>
  `,
  styles: [
    `
      .profile-card {
        background: var(--surface-primary);
        border-radius: 1.5rem;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        max-width: 480px;
        margin: 4rem auto 0 auto;
        padding: 2.5rem 2rem 2rem 2rem;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .profile-header {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        width: 100%;
        margin-bottom: 2rem;
      }
      .profile-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--primary-light) 0%,
          var(--primary) 100%
        );
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 3.5rem;
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1);
      }
      .profile-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .profile-name {
        font-size: 1.7rem;
        font-weight: 800;
        margin: 0;
        color: var(--primary);
      }
      .profile-position {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .profile-department {
        font-size: 1rem;
        color: var(--primary-light);
        font-weight: 500;
      }
      .profile-details {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.2rem 1.5rem;
        margin-top: 1.5rem;
      }
      .profile-detail-item {
        font-size: 1.04rem;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
      }
      .profile-detail-item .label {
        font-weight: 700;
        color: var(--text-secondary);
        margin-bottom: 0.1em;
      }
      @media (max-width: 600px) {
        .profile-card {
          padding: 1.2rem 0.5rem;
        }
        .profile-header {
          flex-direction: column;
          gap: 0.7rem;
          align-items: center;
        }
        .profile-details {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class EmployeeProfileComponent implements OnInit {
  employee$!: Observable<IEmployee | undefined>;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server, do nothing (avoid SSR issues)
      return;
    }
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.employee$ = this.employeeService.getEmployeeById(+id);
      }
    });
  }
}

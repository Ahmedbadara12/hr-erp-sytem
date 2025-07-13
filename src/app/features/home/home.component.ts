import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../employee-management/services/employee.service';
import { LeaveService } from '../leave-management/services/leave.service';
import { TaskService } from '../task-management/services/task.service';
import { PayrollService } from '../payroll/services/payroll.service';
import { NotificationService } from '../../shared/services/notification.service';
import { IEmployee } from '../../shared/models/employee.model';
import { ILeaveRequest } from '../../shared/models/leave-request.model';
import { Task } from '../../shared/models/task.model';
import { IPayroll } from '../../shared/models/payroll.model';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';

interface DashboardMetric {
  title: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  description: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <i class="fas fa-chart-line me-3"></i>
            Welcome to HR ERP Dashboard
          </h1>
          <p class="welcome-subtitle">
            Monitor your organization's key metrics and performance indicators
          </p>
        </div>
        <div class="welcome-actions">
          <button
            class="btn btn-primary"
            (click)="refreshData()"
            [disabled]="loading"
          >
            <i class="fas fa-sync-alt me-2" [class.fa-spin]="loading"></i>
            {{ loading ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p>Loading dashboard data...</p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading" class="dashboard-content">
        <!-- Key Metrics -->
        <section class="metrics-section">
          <h2 class="section-title">
            <i class="fas fa-chart-bar me-2"></i>
            Key Metrics
          </h2>
          <div class="metrics-grid">
            <div
              *ngFor="let metric of metrics"
              class="metric-card"
              [class]="'metric-' + metric.color"
            >
              <div class="metric-icon">
                <i [class]="metric.icon"></i>
              </div>
              <div class="metric-content">
                <h3 class="metric-title">{{ metric.title }}</h3>
                <div class="metric-value">
                  {{ metric.value.toLocaleString() }}
                </div>
                <div
                  class="metric-change"
                  [class]="'change-' + metric.changeType"
                >
                  <i
                    [class]="getChangeIcon(metric.changeType)"
                    class="me-1"
                  ></i>
                  {{ Math.abs(metric.change) }}%
                  <span class="change-label">
                    {{
                      metric.changeType === 'positive'
                        ? 'increase'
                        : metric.changeType === 'negative'
                        ? 'decrease'
                        : 'no change'
                    }}
                  </span>
                </div>
                <p class="metric-description">{{ metric.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Charts Section -->
        <section class="charts-section">
          <h2 class="section-title">
            <i class="fas fa-chart-pie me-2"></i>
            Analytics
          </h2>
          <div class="charts-grid">
            <!-- Leave Trends Chart -->
            <div class="chart-card">
              <h3 class="chart-title">
                <i class="fas fa-calendar-alt me-2"></i>
                Leave Trends
              </h3>
              <div class="chart-container">
                <canvas #leaveChart></canvas>
              </div>
            </div>

            <!-- Task Completion Chart -->
            <div class="chart-card">
              <h3 class="chart-title">
                <i class="fas fa-tasks me-2"></i>
                Task Completion
              </h3>
              <div class="chart-container">
                <canvas #taskChart></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="activity-section">
          <h2 class="section-title">
            <i class="fas fa-clock me-2"></i>
            Recent Activity
          </h2>
          <div class="activity-grid">
            <!-- Recent Leave Requests -->
            <div class="activity-card">
              <h3 class="activity-title">
                <i class="fas fa-calendar-check me-2"></i>
                Recent Leave Requests
              </h3>
              <div class="activity-list">
                <div
                  *ngFor="let leave of recentLeaveRequests"
                  class="activity-item"
                >
                  <div class="activity-icon leave-icon">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-main">
                      <strong>Employee {{ leave.employeeId }}</strong> requested
                      <span class="leave-type">{{ leave.type }}</span>
                    </div>
                    <div class="activity-details">
                      {{ leave.from | date : 'MMM dd' }} -
                      {{ leave.to | date : 'MMM dd' }}
                      <span
                        class="activity-status"
                        [class]="'status-' + leave.status"
                      >
                        {{ leave.status }}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  *ngIf="recentLeaveRequests.length === 0"
                  class="empty-state"
                >
                  <i class="fas fa-inbox fa-2x"></i>
                  <p>No recent leave requests</p>
                </div>
              </div>
            </div>

            <!-- Recent Tasks -->
            <div class="activity-card">
              <h3 class="activity-title">
                <i class="fas fa-clipboard-list me-2"></i>
                Recent Tasks
              </h3>
              <div class="activity-list">
                <div *ngFor="let task of recentTasks" class="activity-item">
                  <div class="activity-icon task-icon">
                    <i class="fas fa-tasks"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-main">
                      <strong>{{ task.title }}</strong>
                    </div>
                    <div class="activity-details">
                      Assigned to {{ task.assignee }}
                      <span
                        class="activity-status"
                        [class]="'status-' + task.status"
                      >
                        {{ task.status }}
                      </span>
                    </div>
                  </div>
                </div>
                <div *ngIf="recentTasks.length === 0" class="empty-state">
                  <i class="fas fa-clipboard fa-2x"></i>
                  <p>No recent tasks</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        background: var(--background);
        color: var(--body-color);
      }

      .welcome-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3rem;
        padding: 2rem;
        background: linear-gradient(
          135deg,
          var(--primary) 0%,
          var(--primary-light) 100%
        );
        border-radius: 1.5rem;
        color: white;
      }

      .welcome-title {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        color: white;
      }

      .welcome-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
        margin: 0;
      }

      .welcome-actions {
        display: flex;
        gap: 1rem;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .loading-spinner {
        text-align: center;
        color: var(--primary);
      }

      .loading-spinner p {
        margin-top: 1rem;
        font-weight: 600;
      }

      .section-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 2rem;
        color: var(--headings-color);
        display: flex;
        align-items: center;
      }

      .metrics-section {
        margin-bottom: 3rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .metric-card {
        background: var(--surface-primary);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        border: 1px solid var(--border-light);
        transition: all 0.3s ease;
        display: flex;
        align-items: flex-start;
        gap: 1.5rem;
        color: var(--text-primary);
      }

      .metric-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 48px rgba(124, 58, 237, 0.15);
      }

      .metric-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .metric-primary .metric-icon {
        background: linear-gradient(
          135deg,
          var(--primary-light) 0%,
          var(--primary) 100%
        );
        color: var(--primary);
      }

      .metric-success .metric-icon {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        color: #065f46;
      }

      .metric-warning .metric-icon {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #92400e;
      }

      .metric-info .metric-icon {
        background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
        color: #1e40af;
      }

      .metric-content {
        flex: 1;
      }

      .metric-title {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: 0.5rem;
      }

      .metric-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1;
        margin-bottom: 0.5rem;
      }

      .metric-change {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .change-positive {
        color: #10b981;
      }

      .change-negative {
        color: #ef4444;
      }

      .change-neutral {
        color: var(--text-secondary);
      }

      .change-label {
        margin-left: 0.25rem;
        opacity: 0.7;
      }

      .metric-description {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin: 0;
      }

      .charts-section {
        margin-bottom: 3rem;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
      }

      .chart-card {
        background: var(--surface-primary);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        border: 1px solid var(--border-light);
        color: var(--text-primary);
      }

      .chart-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--headings-color);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
      }

      .chart-container {
        height: 300px;
        position: relative;
      }

      .activity-section {
        margin-bottom: 3rem;
      }

      .activity-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
      }

      .activity-card {
        background: var(--surface-primary);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        border: 1px solid var(--border-light);
        color: var(--text-primary);
      }

      .activity-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--headings-color);
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        border-radius: 0.75rem;
        background: var(--surface-secondary);
        transition: all 0.2s ease;
        color: var(--text-primary);
      }

      .activity-item:hover {
        background: var(--surface-tertiary);
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .leave-icon {
        background: #dbeafe;
        color: #1e40af;
      }

      .task-icon {
        background: #ede9fe;
        color: #7c3aed;
      }

      .activity-content {
        flex: 1;
      }

      .activity-main {
        font-size: 0.95rem;
        margin-bottom: 0.25rem;
      }

      .leave-type {
        color: var(--primary);
        font-weight: 600;
      }

      .activity-details {
        font-size: 0.875rem;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .activity-status {
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-pending {
        background: #fef3c7;
        color: #92400e;
      }

      .status-approved {
        background: #d1fae5;
        color: #065f46;
      }

      .status-rejected {
        background: #fee2e2;
        color: #991b1b;
      }

      .status-completed {
        background: #d1fae5;
        color: #065f46;
      }

      .status-in-progress {
        background: #dbeafe;
        color: #1e40af;
      }

      .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--text-muted);
      }

      .empty-state i {
        margin-bottom: 1rem;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .metric-card,
        .chart-card,
        .activity-card {
          background: var(--surface-primary);
          border-color: var(--border-light);
        }

        .metric-value {
          color: var(--text-primary);
        }

        .metric-title,
        .metric-description {
          color: var(--text-secondary);
        }

        .activity-item {
          background: var(--surface-secondary);
        }

        .activity-item:hover {
          background: var(--surface-tertiary);
        }

        .activity-main {
          color: var(--text-primary);
        }

        .activity-details {
          color: var(--text-secondary);
        }
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .dashboard-container {
          padding: 1rem;
        }

        .welcome-section {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
        }

        .welcome-title {
          font-size: 2rem;
        }

        .metrics-grid {
          grid-template-columns: 1fr;
        }

        .charts-grid {
          grid-template-columns: 1fr;
        }

        .activity-grid {
          grid-template-columns: 1fr;
        }

        .metric-card {
          padding: 1.5rem;
        }

        .chart-container {
          height: 250px;
        }
      }

      @media (max-width: 480px) {
        .dashboard-container {
          padding: 0.5rem;
        }
        .welcome-title {
          font-size: 1.3rem;
        }
        .section-title {
          font-size: 1.1rem;
        }
        .metrics-grid,
        .charts-grid,
        .activity-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .metric-card,
        .chart-card,
        .activity-card {
          padding: 1rem;
          border-radius: 1rem;
        }
        .charts-section {
          margin-bottom: 2rem;
          margin-top: 1.5rem;
        }
        .charts-grid {
          gap: 1rem;
        }
        .chart-card {
          width: 100%;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 12px rgba(124, 58, 237, 0.08);
          border: 1px solid #ececec;
        }
        .chart-title {
          font-size: 1rem;
          word-break: break-word;
          text-align: center;
        }
        .chart-container {
          height: 180px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          min-width: 320px;
          border: 1px solid #f3f3f3;
          border-radius: 0.75rem;
        }
        .chart-container canvas {
          width: 100% !important;
          min-width: 320px;
          max-width: 100vw;
          height: auto !important;
          display: block;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  loading = true;
  metrics: DashboardMetric[] = [];
  recentLeaveRequests: ILeaveRequest[] = [];
  recentTasks: Task[] = [];
  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private taskService: TaskService,
    private payrollService: PayrollService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (this.loading) {
        console.warn('Dashboard loading timeout - forcing completion');
        this.loading = false;
        this.calculateMetrics();
      }
    }, 10000); // 10 second timeout

    // Load all data in parallel
    Promise.all([
      this.loadEmployees(),
      this.loadLeaveRequests(),
      this.loadTasks(),
      this.loadPayroll(),
    ])
      .then(() => {
        clearTimeout(timeout);
        this.calculateMetrics();
        this.loading = false;
      })
      .catch((error) => {
        clearTimeout(timeout);
        console.error('Error loading dashboard data:', error);
        this.notificationService.showError('Failed to load dashboard data');
        this.loading = false;
        // Still calculate metrics with default data
        this.calculateMetrics();
      });
  }

  private async loadEmployees(): Promise<void> {
    try {
      const employees = await firstValueFrom(
        this.employeeService.getEmployees().pipe(takeUntil(this.destroy$))
      );
      // Process employee data
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  private async loadLeaveRequests(): Promise<void> {
    try {
      const leaveRequests = await firstValueFrom(
        this.leaveService.getLeaves().pipe(takeUntil(this.destroy$))
      );
      this.recentLeaveRequests = leaveRequests?.slice(0, 5) || [];
    } catch (error) {
      console.error('Error loading leave requests:', error);
      // Fallback data
      this.recentLeaveRequests = [
        {
          id: 1,
          employeeId: 1,
          type: 'Annual',
          from: '2024-06-01',
          to: '2024-06-05',
          status: 'Approved',
          reason: 'Family vacation',
        },
      ];
    }
  }

  private async loadTasks(): Promise<void> {
    try {
      const tasks = await firstValueFrom(
        this.taskService.getTasks().pipe(takeUntil(this.destroy$))
      );
      this.recentTasks = tasks?.slice(0, 5) || [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback data
      this.recentTasks = [
        {
          id: 1,
          title: 'Prepare Onboarding Documents',
          description:
            'Prepare and upload all onboarding documents for new hires.',
          assignee: 'HR',
          dueDate: '2024-06-15',
          status: 'Pending',
          priority: 'High',
          comments: ['Initial task created.'],
        },
      ];
    }
  }

  private async loadPayroll(): Promise<void> {
    try {
      const payroll = await firstValueFrom(
        this.payrollService.getPayrolls().pipe(takeUntil(this.destroy$))
      );
      // Process payroll data
    } catch (error) {
      console.error('Error loading payroll:', error);
    }
  }

  private calculateMetrics(): void {
    // Calculate metrics based on loaded data
    this.metrics = [
      {
        title: 'Total Employees',
        value: 150,
        change: 12,
        changeType: 'positive',
        icon: 'fas fa-users',
        color: 'primary',
        description: 'Active employees in the system',
      },
      {
        title: 'Leave Requests',
        value: 23,
        change: -5,
        changeType: 'negative',
        icon: 'fas fa-calendar-alt',
        color: 'warning',
        description: 'Pending leave requests',
      },
      {
        title: 'Active Tasks',
        value: 45,
        change: 8,
        changeType: 'positive',
        icon: 'fas fa-tasks',
        color: 'info',
        description: 'Tasks in progress',
      },
      {
        title: 'Total Payroll',
        value: 125000,
        change: 15,
        changeType: 'positive',
        icon: 'fas fa-money-check-alt',
        color: 'success',
        description: 'Monthly payroll amount',
      },
    ];
  }

  getChangeIcon(changeType: string): string {
    switch (changeType) {
      case 'positive':
        return 'fas fa-arrow-up';
      case 'negative':
        return 'fas fa-arrow-down';
      default:
        return 'fas fa-minus';
    }
  }

  refreshData(): void {
    this.loadDashboardData();
    this.notificationService.showInfo('Dashboard data refreshed');
  }
}

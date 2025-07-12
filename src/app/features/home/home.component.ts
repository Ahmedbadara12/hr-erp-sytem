import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { Observable, of, Subscription } from 'rxjs';
import { EmployeeService } from '../employee-management/services/employee.service';
import { LeaveService } from '../leave-management/services/leave.service';
import { PayrollService } from '../payroll/services/payroll.service';
import { IEmployee } from '../../shared/models/employee.model';
import { ILeaveRequest } from '../../shared/models/leave-request.model';
import { IPayroll } from '../../shared/models/payroll.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  providers: [EmployeeService, LeaveService, PayrollService],
  template: `
    <div class="dashboard-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
              <div class="hero-content">
                <div class="welcome-card">
                  <div class="welcome-header">
                    <div class="welcome-icon">
                      <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="welcome-text">
                      <h1 class="welcome-title">
                        Welcome back,
                        <span class="highlight">{{ getWelcomeMessage() }}</span>
                      </h1>
                      <p class="welcome-subtitle">
                        Here's what's happening in your HR ERP system today
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-content">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-lg-10">
              <ng-container *ngIf="role$ | async as role">
                <!-- Stats Cards Section -->
                <div class="stats-section">
                  <div class="row g-4">
                    <ng-container *ngIf="role === 'Employee'">
                      <div class="col-6 col-md-3">
                        <div
                          class="stat-card stat-card-primary"
                          (click)="goToTasks()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-tasks"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ taskCount }}</div>
                            <div class="stat-label">Active Tasks</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div
                          class="stat-card stat-card-success"
                          (click)="goToLeave()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ leaveApproved }}</div>
                            <div class="stat-label">Approved Leaves</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div
                          class="stat-card stat-card-warning"
                          (click)="goToLeave()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-hourglass-half"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ leavePending }}</div>
                            <div class="stat-label">Pending Leaves</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div
                          class="stat-card stat-card-danger"
                          (click)="goToLeave()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-times-circle"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ leaveRejected }}</div>
                            <div class="stat-label">Rejected Leaves</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                    <ng-container *ngIf="role === 'HR'">
                      <div class="col-6 col-md-4">
                        <div
                          class="stat-card stat-card-primary"
                          (click)="goToEmployee()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-users"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ employeeCount }}</div>
                            <div class="stat-label">Total Employees</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-4">
                        <div
                          class="stat-card stat-card-warning"
                          (click)="goToLeave()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-hourglass-half"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ leavePending }}</div>
                            <div class="stat-label">Pending Approvals</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-4">
                        <div
                          class="stat-card stat-card-info"
                          (click)="goToTasks()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-tasks"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ taskCount }}</div>
                            <div class="stat-label">Open Tasks</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                    <ng-container *ngIf="role === 'Admin'">
                      <div class="col-6 col-md-6">
                        <div
                          class="stat-card stat-card-success"
                          (click)="goToPayroll()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-money-check-alt"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ payrollCount }}</div>
                            <div class="stat-label">Payroll Records</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-6">
                        <div
                          class="stat-card stat-card-info"
                          (click)="goToTasks()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-tasks"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ taskCount }}</div>
                            <div class="stat-label">System Tasks</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                    <ng-container *ngIf="role === 'ProjectManager'">
                      <div class="col-6 col-md-6">
                        <div
                          class="stat-card stat-card-primary"
                          (click)="goToEmployee()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-users"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ employeeCount }}</div>
                            <div class="stat-label">Team Members</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-6 col-md-6">
                        <div
                          class="stat-card stat-card-info"
                          (click)="goToTasks()"
                        >
                          <div class="stat-icon">
                            <i class="fas fa-tasks"></i>
                          </div>
                          <div class="stat-content">
                            <div class="stat-value">{{ taskCount }}</div>
                            <div class="stat-label">Project Tasks</div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                  </div>
                </div>

                <!-- Quick Actions Section -->
                <div class="quick-actions-section">
                  <div class="section-header">
                    <h2 class="section-title">
                      <i class="fas fa-bolt"></i>
                      Quick Actions
                    </h2>
                    <p class="section-subtitle">
                      Access your most important features
                    </p>
                  </div>

                  <ng-container [ngSwitch]="role">
                    <!-- Employee Quick Actions -->
                    <ng-container *ngSwitchCase="'Employee'">
                      <div class="row g-4">
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToProfile()">
                            <div class="action-icon">
                              <i class="fas fa-user"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">My Profile</h3>
                              <p class="action-description">
                                View and update your personal information
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLeave()">
                            <div class="action-icon">
                              <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Leave Management</h3>
                              <p class="action-description">
                                Apply for leave and track your requests
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToTasks()">
                            <div class="action-icon">
                              <i class="fas fa-tasks"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">My Tasks</h3>
                              <p class="action-description">
                                View and update your assigned tasks
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLearning()">
                            <div class="action-icon">
                              <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Learning</h3>
                              <p class="action-description">
                                Access training courses and materials
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                    <!-- HR Quick Actions -->
                    <ng-container *ngSwitchCase="'HR'">
                      <div class="row g-4">
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToEmployee()">
                            <div class="action-icon">
                              <i class="fas fa-users"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Employee Management</h3>
                              <p class="action-description">
                                Manage employee records and information
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLeaveApprove()">
                            <div class="action-icon">
                              <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Leave Approvals</h3>
                              <p class="action-description">
                                Review and approve leave requests
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToTasks()">
                            <div class="action-icon">
                              <i class="fas fa-tasks"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Task Management</h3>
                              <p class="action-description">
                                Create and assign tasks to employees
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLearning()">
                            <div class="action-icon">
                              <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Learning Management</h3>
                              <p class="action-description">
                                Manage training programs and courses
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToProfile()">
                            <div class="action-icon">
                              <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">My Profile</h3>
                              <p class="action-description">
                                View and update your profile
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                    <!-- Admin Quick Actions -->
                    <ng-container *ngSwitchCase="'Admin'">
                      <div class="row g-4">
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToPayroll()">
                            <div class="action-icon">
                              <i class="fas fa-money-check-alt"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Payroll Management</h3>
                              <p class="action-description">
                                View payroll reports and payslips
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToEmployee()">
                            <div class="action-icon">
                              <i class="fas fa-users"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Employee Management</h3>
                              <p class="action-description">
                                Manage all employee records
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLeaveApprove()">
                            <div class="action-icon">
                              <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Leave Approvals</h3>
                              <p class="action-description">
                                Review and approve leave requests
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToTasks()">
                            <div class="action-icon">
                              <i class="fas fa-tasks"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">System Tasks</h3>
                              <p class="action-description">
                                Manage system-wide tasks and assignments
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLearning()">
                            <div class="action-icon">
                              <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Learning Management</h3>
                              <p class="action-description">
                                Manage training programs and courses
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToProfile()">
                            <div class="action-icon">
                              <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">My Profile</h3>
                              <p class="action-description">
                                View and update your profile
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ng-container>

                    <!-- Project Manager Quick Actions -->
                    <ng-container *ngSwitchCase="'ProjectManager'">
                      <div class="row g-4">
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToEmployee()">
                            <div class="action-icon">
                              <i class="fas fa-users"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Team Members</h3>
                              <p class="action-description">
                                View and manage your team members
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToTasks()">
                            <div class="action-icon">
                              <i class="fas fa-tasks"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Project Tasks</h3>
                              <p class="action-description">
                                Manage and assign project tasks
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLeave()">
                            <div class="action-icon">
                              <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Leave Management</h3>
                              <p class="action-description">
                                View team leave requests and status
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToLearning()">
                            <div class="action-icon">
                              <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">Team Learning</h3>
                              <p class="action-description">
                                Access training courses for your team
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                        <div class="col-6 col-md-4">
                          <div class="action-card" (click)="goToProfile()">
                            <div class="action-icon">
                              <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="action-content">
                              <h3 class="action-title">My Profile</h3>
                              <p class="action-description">
                                View and update your profile
                              </p>
                            </div>
                            <div class="action-arrow">
                              <i class="fas fa-arrow-right"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                  </ng-container>
                </div>

                <!-- Recent Activity Section -->
                <div class="recent-activity-section">
                  <div class="section-header">
                    <h2 class="section-title">
                      <i class="fas fa-clock"></i>
                      Recent Activity
                    </h2>
                    <p class="section-subtitle">
                      Stay updated with the latest activities
                    </p>
                  </div>

                  <div class="activity-card">
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="fas fa-bell"></i>
                      </div>
                      <div class="activity-content">
                        <h4 class="activity-title">System Update</h4>
                        <p class="activity-description">
                          HR ERP system has been updated with new features
                        </p>
                        <span class="activity-time">2 hours ago</span>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="fas fa-check-circle"></i>
                      </div>
                      <div class="activity-content">
                        <h4 class="activity-title">Task Completed</h4>
                        <p class="activity-description">
                          Monthly report generation task has been completed
                        </p>
                        <span class="activity-time">4 hours ago</span>
                      </div>
                    </div>
                    <div class="activity-item">
                      <div class="activity-icon">
                        <i class="fas fa-user-plus"></i>
                      </div>
                      <div class="activity-content">
                        <h4 class="activity-title">New Employee</h4>
                        <p class="activity-description">
                          New employee profile has been added to the system
                        </p>
                        <span class="activity-time">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .hero-section {
        padding: 3rem 0 2rem 0;
      }

      .hero-content {
        text-align: center;
      }

      .welcome-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 2rem;
        padding: 2.5rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .welcome-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        flex-wrap: wrap;
      }

      .welcome-icon {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      }

      .welcome-text {
        text-align: left;
      }

      .welcome-title {
        font-size: 2.5rem;
        font-weight: 800;
        color: #2d3748;
        margin-bottom: 0.5rem;
        line-height: 1.2;
      }

      .highlight {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .welcome-subtitle {
        font-size: 1.1rem;
        color: #718096;
        margin: 0;
      }

      .dashboard-content {
        padding: 2rem 0 4rem 0;
      }

      .stats-section {
        margin-bottom: 3rem;
      }

      .stat-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        min-height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;
      }

      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(
          90deg,
          var(--card-color),
          var(--card-color-light)
        );
      }

      .stat-card::after {
        content: 'Click to view';
        position: absolute;
        bottom: 0.5rem;
        right: 1rem;
        font-size: 0.7rem;
        color: var(--card-color);
        opacity: 0;
        transition: opacity 0.3s ease;
        font-weight: 600;
      }

      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }

      .stat-card:hover::after {
        opacity: 1;
      }

      .stat-card:active {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
      }

      .stat-card:focus {
        outline: 2px solid var(--card-color);
        outline-offset: 2px;
      }

      .stat-card-primary {
        --card-color: #667eea;
        --card-color-light: #764ba2;
      }

      .stat-card-success {
        --card-color: #48bb78;
        --card-color-light: #38a169;
      }

      .stat-card-warning {
        --card-color: #ed8936;
        --card-color-light: #dd6b20;
      }

      .stat-card-danger {
        --card-color: #f56565;
        --card-color-light: #e53e3e;
      }

      .stat-card-info {
        --card-color: #4299e1;
        --card-color-light: #3182ce;
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(
          135deg,
          var(--card-color),
          var(--card-color-light)
        );
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .stat-content {
        text-align: center;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 1rem;
        color: #718096;
        font-weight: 600;
      }

      .section-header {
        text-align: center;
        margin-bottom: 2.5rem;
      }

      .section-title {
        font-size: 2rem;
        font-weight: 700;
        color: white;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .section-subtitle {
        font-size: 1.1rem;
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
      }

      .quick-actions-section,
      .recent-activity-section {
        margin-bottom: 3rem;
      }

      .action-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        height: 100%;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .action-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(102, 126, 234, 0.1),
          rgba(118, 75, 162, 0.1)
        );
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .action-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }

      .action-card:active {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12);
      }

      .action-card:hover::before {
        opacity: 1;
      }

      .action-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }

      .action-content {
        position: relative;
        z-index: 1;
        flex: 1;
      }

      .action-title {
        font-size: 1.3rem;
        font-weight: 700;
        color: #2d3748;
        margin-bottom: 0.5rem;
      }

      .action-description {
        font-size: 0.95rem;
        color: #718096;
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      .action-arrow {
        position: absolute;
        top: 2rem;
        right: 2rem;
        color: #667eea;
        font-size: 1.2rem;
        transition: transform 0.3s ease;
      }

      .action-card:hover .action-arrow {
        transform: translateX(5px);
      }

      .activity-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 1.5rem;
        padding: 2rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1.5rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .activity-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .activity-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      .activity-content {
        flex: 1;
      }

      .activity-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 0.25rem;
      }

      .activity-description {
        font-size: 0.9rem;
        color: #718096;
        margin-bottom: 0.5rem;
        line-height: 1.4;
      }

      .activity-time {
        font-size: 0.8rem;
        color: #a0aec0;
        font-weight: 500;
      }

      /* Mobile Optimizations */
      @media (max-width: 768px) {
        .dashboard-container {
          padding: 0 1rem;
        }

        .hero-section {
          padding: 2rem 0 1.5rem 0;
        }

        .welcome-card {
          padding: 1.5rem;
          border-radius: 1.5rem;
        }

        .welcome-header {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
        }

        .welcome-icon {
          width: 70px;
          height: 70px;
          font-size: 1.8rem;
        }

        .welcome-text {
          text-align: center;
        }

        .welcome-title {
          font-size: 1.8rem;
          line-height: 1.3;
        }

        .welcome-subtitle {
          font-size: 1rem;
        }

        .dashboard-content {
          padding: 1.5rem 0 3rem 0;
        }

        .stats-section {
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          min-height: 120px;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          font-size: 1.3rem;
          margin-bottom: 0.8rem;
        }

        .stat-value {
          font-size: 2rem;
          margin-bottom: 0.3rem;
        }

        .stat-label {
          font-size: 0.9rem;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          flex-direction: column;
          gap: 0.3rem;
        }

        .section-subtitle {
          font-size: 1rem;
        }

        .quick-actions-section,
        .recent-activity-section {
          margin-bottom: 2rem;
        }

        .action-card {
          padding: 1.5rem;
          min-height: 160px;
          margin-bottom: 1rem;
        }

        .action-icon {
          width: 50px;
          height: 50px;
          font-size: 1.3rem;
          margin-bottom: 1rem;
        }

        .action-title {
          font-size: 1.1rem;
          margin-bottom: 0.4rem;
        }

        .action-description {
          font-size: 0.9rem;
          margin-bottom: 0.8rem;
        }

        .action-arrow {
          top: 1.5rem;
          right: 1.5rem;
          font-size: 1rem;
        }

        .activity-card {
          padding: 1.5rem;
        }

        .activity-item {
          padding: 1rem 0;
          gap: 0.8rem;
        }

        .activity-icon {
          width: 45px;
          height: 45px;
          font-size: 1.1rem;
        }

        .activity-title {
          font-size: 1rem;
        }

        .activity-description {
          font-size: 0.85rem;
        }

        .activity-time {
          font-size: 0.75rem;
        }
      }

      @media (max-width: 480px) {
        .dashboard-container {
          padding: 0 0.5rem;
        }

        .hero-section {
          padding: 1.5rem 0 1rem 0;
        }

        .welcome-card {
          padding: 1.25rem;
          border-radius: 1.25rem;
        }

        .welcome-icon {
          width: 60px;
          height: 60px;
          font-size: 1.5rem;
        }

        .welcome-title {
          font-size: 1.5rem;
        }

        .welcome-subtitle {
          font-size: 0.9rem;
        }

        .dashboard-content {
          padding: 1rem 0 2rem 0;
        }

        .stat-card {
          padding: 1.25rem;
          min-height: 110px;
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          font-size: 1.2rem;
          margin-bottom: 0.6rem;
        }

        .stat-value {
          font-size: 1.8rem;
        }

        .stat-label {
          font-size: 0.85rem;
        }

        .section-title {
          font-size: 1.3rem;
        }

        .section-subtitle {
          font-size: 0.9rem;
        }

        .action-card {
          padding: 1.25rem;
          min-height: 140px;
        }

        .action-icon {
          width: 45px;
          height: 45px;
          font-size: 1.2rem;
          margin-bottom: 0.8rem;
        }

        .action-title {
          font-size: 1rem;
        }

        .action-description {
          font-size: 0.85rem;
        }

        .action-arrow {
          top: 1.25rem;
          right: 1.25rem;
          font-size: 0.9rem;
        }

        .activity-card {
          padding: 1.25rem;
        }

        .activity-item {
          padding: 0.8rem 0;
          gap: 0.6rem;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          font-size: 1rem;
        }

        .activity-title {
          font-size: 0.95rem;
        }

        .activity-description {
          font-size: 0.8rem;
        }

        .activity-time {
          font-size: 0.7rem;
        }
      }

      /* Touch Device Optimizations */
      @media (hover: none) and (pointer: coarse) {
        .stat-card:hover,
        .action-card:hover {
          transform: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .stat-card:hover::after,
        .action-card:hover .action-arrow {
          opacity: 0;
          transform: none;
        }

        .stat-card:active,
        .action-card:active {
          transform: scale(0.98);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-card:active::after {
          opacity: 1;
        }

        .action-card:active .action-arrow {
          transform: translateX(3px);
        }

        /* Show click indicator on touch devices */
        .stat-card::after {
          opacity: 0.7;
          font-size: 0.6rem;
        }
      }

      /* Landscape Mobile Optimizations */
      @media (max-width: 768px) and (orientation: landscape) {
        .hero-section {
          padding: 1rem 0;
        }

        .welcome-card {
          padding: 1rem;
        }

        .welcome-header {
          flex-direction: row;
          gap: 1rem;
        }

        .welcome-icon {
          width: 50px;
          height: 50px;
          font-size: 1.3rem;
        }

        .welcome-title {
          font-size: 1.4rem;
        }

        .dashboard-content {
          padding: 1rem 0 2rem 0;
        }

        .stat-card {
          min-height: 100px;
          padding: 1rem;
        }

        .action-card {
          min-height: 120px;
          padding: 1rem;
        }
      }

      /* High DPI Display Optimizations */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .stat-card,
        .action-card,
        .activity-card {
          border: 0.5px solid rgba(255, 255, 255, 0.2);
        }
      }

      /* Accessibility Improvements */
      @media (prefers-reduced-motion: reduce) {
        .stat-card,
        .action-card,
        .action-arrow {
          transition: none;
        }

        .stat-card:hover,
        .action-card:hover {
          transform: none;
        }
      }

      /* Dark Mode Support */
      @media (prefers-color-scheme: dark) {
        .welcome-card,
        .stat-card,
        .action-card,
        .activity-card {
          background: rgba(26, 32, 44, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .welcome-title,
        .stat-value,
        .action-title,
        .activity-title {
          color: #f7fafc;
        }

        .welcome-subtitle,
        .stat-label,
        .action-description,
        .activity-description {
          color: #a0aec0;
        }

        .activity-time {
          color: #718096;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  role$: Observable<UserRole | null>;
  employeeCount = 0;
  leavePending = 0;
  leaveApproved = 0;
  leaveRejected = 0;
  taskCount = 0;
  payrollCount = 0;
  userId: number | null = null;
  private subs: Subscription[] = [];

  constructor(
    private auth: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService,
    private payrollService: PayrollService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.role$ = this.auth.getRole();
  }

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.subs.push(
      this.role$.subscribe((role) => {
        if (role === 'Employee' && this.userId) {
          this.subs.push(
            this.leaveService.getLeaves().subscribe((leaves) => {
              const myLeaves = leaves.filter(
                (l) => l.employeeId === this.userId
              );
              this.leavePending = myLeaves.filter(
                (l) => l.status === 'Pending'
              ).length;
              this.leaveApproved = myLeaves.filter(
                (l) => l.status === 'Approved'
              ).length;
              this.leaveRejected = myLeaves.filter(
                (l) => l.status === 'Rejected'
              ).length;
            })
          );
          // For demo, count all tasks as 3
          this.taskCount = 3;
        } else if (role === 'HR') {
          this.subs.push(
            this.employeeService.getEmployees().subscribe((emps) => {
              this.employeeCount = emps.length;
            })
          );
          this.subs.push(
            this.leaveService.getLeaves().subscribe((leaves) => {
              this.leavePending = leaves.filter(
                (l) => l.status === 'Pending'
              ).length;
            })
          );
          // For demo, count all tasks as 5
          this.taskCount = 5;
        } else if (role === 'Admin') {
          this.subs.push(
            this.payrollService.getPayrolls().subscribe((payrolls) => {
              this.payrollCount = payrolls.length;
            })
          );
          // For demo, count all tasks as 2
          this.taskCount = 2;
        } else if (role === 'ProjectManager') {
          this.subs.push(
            this.employeeService.getEmployees().subscribe((emps) => {
              this.employeeCount = emps.length;
            })
          );
          // For demo, count all tasks as 4
          this.taskCount = 4;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
  goToLeave() {
    this.router.navigate(['/leave']);
  }
  goToTasks() {
    this.router.navigate(['/tasks']);
  }
  goToPayroll() {
    this.router.navigate(['/payroll']);
  }
  goToEmployee() {
    this.router.navigate(['/employee']);
  }
  goToLearning() {
    this.router.navigate(['/learning']);
  }
  goToLeaveApprove() {
    this.router.navigate(['/leave-approve']);
  }
}

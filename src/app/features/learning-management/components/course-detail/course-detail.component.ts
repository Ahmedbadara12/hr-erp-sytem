import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Course, Lesson, Enrollment } from '../../../../shared/models';
import { LearningService } from '../../services/learning.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid" *ngIf="course$ | async as course">
      <!-- Course Header -->
      <div class="row mb-4">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/learning" class="text-decoration-none">
                  <i class="fas fa-graduation-cap me-1"></i>Learning
                </a>
              </li>
              <li class="breadcrumb-item active">{{ course.title }}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div class="row">
        <!-- Course Info -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <img
                    [src]="
                      course.thumbnail ||
                      'https://via.placeholder.com/300x200/6c757d/ffffff?text=Course'
                    "
                    class="img-fluid rounded"
                    [alt]="course.title"
                  />
                </div>
                <div class="col-md-8">
                  <h2 class="card-title">{{ course.title }}</h2>
                  <p class="card-text text-muted">{{ course.description }}</p>

                  <div class="row mb-3">
                    <div class="col-6">
                      <small class="text-muted">
                        <i class="fas fa-user me-1"></i>Instructor:
                        {{ course.instructor }}
                      </small>
                    </div>
                    <div class="col-6">
                      <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>Duration:
                        {{ formatDuration(course.duration) }}
                      </small>
                    </div>
                  </div>

                  <div class="mb-3">
                    <span class="badge bg-primary me-2">{{
                      course.category
                    }}</span>
                    <span
                      class="badge"
                      [ngClass]="getDifficultyClass(course.difficulty)"
                    >
                      {{ course.difficulty }}
                    </span>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      *ngIf="!isEnrolled"
                      class="btn btn-success"
                      (click)="enrollInCourse()"
                      [disabled]="enrolling"
                    >
                      <i class="fas fa-plus me-1"></i>Enroll Now
                    </button>
                    <button
                      *ngIf="isEnrolled"
                      class="btn btn-primary"
                      (click)="startLearning()"
                    >
                      <i class="fas fa-play me-1"></i>Continue Learning
                    </button>
                    <button
                      class="btn btn-outline-secondary"
                      (click)="goBack()"
                    >
                      <i class="fas fa-arrow-left me-1"></i>Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Course Progress -->
          <div class="card mb-4" *ngIf="enrollment$ | async as enrollment">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-chart-line me-2"></i>Your Progress
              </h5>
            </div>
            <div class="card-body">
              <div class="progress mb-3" style="height: 25px;">
                <div
                  class="progress-bar"
                  role="progressbar"
                  [style.width.%]="enrollment.progress"
                  [attr.aria-valuenow]="enrollment.progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {{ enrollment.progress }}%
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    Enrolled: {{ enrollment.enrolledAt | date : 'mediumDate' }}
                  </small>
                </div>
                <div class="col-md-6" *ngIf="enrollment.completedAt">
                  <small class="text-muted">
                    <i class="fas fa-check-circle me-1"></i>
                    Completed:
                    {{ enrollment.completedAt | date : 'mediumDate' }}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Lessons -->
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-list me-2"></i>Course Content
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div
                  *ngFor="let lesson of course.lessons; let i = index"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div class="d-flex align-items-center">
                    <div class="me-3">
                      <span class="badge bg-secondary rounded-circle">{{
                        i + 1
                      }}</span>
                    </div>
                    <div>
                      <h6 class="mb-1">{{ lesson.title }}</h6>
                      <small class="text-muted">{{ lesson.description }}</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center">
                    <small class="text-muted me-3">
                      <i class="fas fa-clock me-1"></i
                      >{{ formatDuration(lesson.duration) }}
                    </small>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      (click)="startLesson(lesson.id)"
                      [disabled]="!isEnrolled"
                    >
                      <i class="fas fa-play me-1"></i>Start
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="fas fa-info-circle me-2"></i>Course Information
              </h6>
            </div>
            <div class="card-body">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <small class="text-muted">
                    <i class="fas fa-users me-1"></i>
                    {{ course.enrolledStudents.length }} students enrolled
                  </small>
                </li>
                <li class="mb-2">
                  <small class="text-muted">
                    <i class="fas fa-book me-1"></i>
                    {{ course.lessons.length }} lessons
                  </small>
                </li>
                <li class="mb-2">
                  <small class="text-muted">
                    <i class="fas fa-calendar me-1"></i>
                    Created: {{ course.createdAt | date : 'mediumDate' }}
                  </small>
                </li>
                <li class="mb-2">
                  <small class="text-muted">
                    <i class="fas fa-sync me-1"></i>
                    Updated: {{ course.updatedAt | date : 'mediumDate' }}
                  </small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .progress-bar {
        background: linear-gradient(
          90deg,
          var(--primary),
          var(--primary-light)
        );
        color: #fff;
      }

      .badge.bg-primary {
        background-color: var(--primary) !important;
        color: #fff !important;
      }

      .badge.bg-success {
        background-color: var(--success) !important;
        color: #fff !important;
      }

      .badge.bg-warning {
        background-color: var(--warning) !important;
        color: #212529 !important;
      }

      .badge.bg-danger {
        background-color: var(--danger) !important;
        color: #fff !important;
      }

      .btn-primary {
        background: var(--primary);
        color: #fff;
      }

      .btn-primary:hover {
        background: var(--primary-dark);
        color: #fff;
      }

      .btn-success {
        background: var(--success);
        color: #fff;
      }

      .btn-success:hover {
        background: var(--primary);
        color: #fff;
      }

      .btn-outline-secondary {
        color: var(--primary);
        border: 2px solid var(--primary);
        background: transparent;
      }

      .btn-outline-secondary:hover {
        background: var(--primary);
        color: #fff;
      }

      .btn {
        border-radius: var(--radius-lg);
        font-weight: 700;
        box-shadow: var(--shadow-sm);
        transition: background var(--transition-normal),
          color var(--transition-normal);
      }

      .list-group-item {
        background: var(--surface-primary);
        color: var(--text-primary);
        border: none;
        border-bottom: 1px solid var(--border-light);
      }

      .list-group-item:last-child {
        border-bottom: none;
      }

      .list-group-item.active {
        background: var(--primary-light);
        color: var(--primary-dark);
      }

      .card {
        background: var(--surface-secondary);
        color: var(--text-primary);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        border: 1.5px solid var(--border-light);
      }
      .card-title {
        color: var(--headline-color);
      }

      @media (max-width: 768px) {
        .card {
          margin-bottom: 1rem;
        }
      }
    `,
  ],
})
export class CourseDetailComponent implements OnInit {
  course$!: Observable<Course | undefined>;
  enrollment$!: Observable<Enrollment | undefined>;
  isEnrolled = false;
  enrolling = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private learningService: LearningService,
    private auth: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (!courseId) {
      this.router.navigate(['/learning']);
      return;
    }

    this.course$ = this.learningService.getCourseById(courseId);
    this.enrollment$ = this.getEnrollment(courseId);

    this.checkEnrollment(courseId);
  }

  private getEnrollment(courseId: string): Observable<Enrollment | undefined> {
    const currentUserId = this.auth.getUserId()?.toString();
    if (!currentUserId)
      return new Observable((subscriber) => subscriber.next(undefined));

    return this.learningService
      .getEnrollmentByEmployee(currentUserId)
      .pipe(
        map((enrollments) =>
          enrollments.find((enrollment) => enrollment.courseId === courseId)
        )
      );
  }

  private checkEnrollment(courseId: string): void {
    const currentUserId = this.auth.getUserId()?.toString();
    if (!currentUserId) return;

    this.learningService
      .getEnrollmentByEmployee(currentUserId)
      .subscribe((enrollments) => {
        this.isEnrolled = enrollments.some(
          (enrollment) => enrollment.courseId === courseId
        );
      });
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-success';
      case 'Intermediate':
        return 'bg-warning';
      case 'Advanced':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  enrollInCourse(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    const currentUserId = this.auth.getUserId();

    if (!courseId || !currentUserId) {
      this.notificationService.showError('Unable to enroll in course.');
      return;
    }

    this.enrolling = true;
    this.learningService
      .enrollInCourse(currentUserId.toString(), courseId)
      .subscribe({
        next: (enrollment) => {
          this.notificationService.showSuccess(
            'Successfully enrolled in course!'
          );
          this.isEnrolled = true;
          this.enrolling = false;
          this.checkEnrollment(courseId);
        },
        error: (error) => {
          this.notificationService.showError(
            'Failed to enroll in course. Please try again.'
          );
          this.enrolling = false;
        },
      });
  }

  startLearning(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/learning/course', courseId, 'learn']);
  }

  startLesson(lessonId: string): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/learning/course', courseId, 'lesson', lessonId]);
  }

  goBack(): void {
    this.router.navigate(['/learning']);
  }
}

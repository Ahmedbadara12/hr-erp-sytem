import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Course, Enrollment, Certificate } from '../../../../shared/models';

interface EnrollmentWithCourse extends Enrollment {
  course?: Course;
}
import { LearningService } from '../../services/learning.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-0"><i class="fas fa-book me-2"></i>My Courses</h2>
          <p class="text-muted">
            Track your learning progress and certificates
          </p>
        </div>
      </div>

      <!-- Active Courses -->
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="mb-3">
            <i class="fas fa-play-circle me-2"></i>Active Courses
          </h4>
          <div class="row g-4">
            <div
              *ngFor="let enrollment of activeEnrollments$ | async"
              class="col-12 col-md-6 col-lg-4"
            >
              <div class="card h-100">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-3"
                  >
                    <h5 class="card-title">{{ enrollment.course?.title }}</h5>
                    <span
                      class="badge"
                      [ngClass]="getProgressClass(enrollment.progress)"
                    >
                      {{ enrollment.progress }}%
                    </span>
                  </div>

                  <p class="card-text text-muted">
                    {{ enrollment.course?.description }}
                  </p>

                  <div class="progress mb-3" style="height: 8px;">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      [style.width.%]="enrollment.progress"
                      [attr.aria-valuenow]="enrollment.progress"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>

                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      Enrolled: {{ enrollment.enrolledAt | date : 'shortDate' }}
                    </small>
                    <button
                      class="btn btn-primary btn-sm"
                      (click)="continueCourse(enrollment.courseId)"
                    >
                      <i class="fas fa-play me-1"></i>Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Active Courses -->
          <div
            *ngIf="(activeEnrollments$ | async)?.length === 0"
            class="text-center py-5"
          >
            <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No active courses</h5>
            <p class="text-muted">
              Start learning by enrolling in a course from the catalog.
            </p>
            <button class="btn btn-primary" (click)="goToCatalog()">
              <i class="fas fa-search me-1"></i>Browse Courses
            </button>
          </div>
        </div>
      </div>

      <!-- Completed Courses -->
      <div class="row mb-4">
        <div class="col-12">
          <h4 class="mb-3">
            <i class="fas fa-check-circle me-2"></i>Completed Courses
          </h4>
          <div class="row g-4">
            <div
              *ngFor="let enrollment of completedEnrollments$ | async"
              class="col-12 col-md-6 col-lg-4"
            >
              <div class="card h-100 border-success">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-3"
                  >
                    <h5 class="card-title">{{ enrollment.course?.title }}</h5>
                    <span class="badge bg-success">
                      <i class="fas fa-check me-1"></i>Completed
                    </span>
                  </div>

                  <p class="card-text text-muted">
                    {{ enrollment.course?.description }}
                  </p>

                  <div class="mb-3">
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      Completed:
                      {{ enrollment.completedAt | date : 'shortDate' }}
                    </small>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-outline-success btn-sm"
                      (click)="viewCertificate(enrollment.courseId)"
                    >
                      <i class="fas fa-certificate me-1"></i>Certificate
                    </button>
                    <button
                      class="btn btn-outline-primary btn-sm"
                      (click)="reviewCourse(enrollment.courseId)"
                    >
                      <i class="fas fa-eye me-1"></i>Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Completed Courses -->
          <div
            *ngIf="(completedEnrollments$ | async)?.length === 0"
            class="text-center py-3"
          >
            <i class="fas fa-trophy fa-2x text-muted mb-2"></i>
            <p class="text-muted">No completed courses yet. Keep learning!</p>
          </div>
        </div>
      </div>

      <!-- Certificates -->
      <div class="row">
        <div class="col-12">
          <h4 class="mb-3">
            <i class="fas fa-certificate me-2"></i>Certificates
          </h4>
          <div class="row g-4">
            <div
              *ngFor="let certificate of certificates$ | async"
              class="col-12 col-md-6 col-lg-4"
            >
              <div class="card h-100 border-warning">
                <div class="card-body">
                  <div
                    class="d-flex justify-content-between align-items-start mb-3"
                  >
                    <h5 class="card-title">{{ certificate.courseTitle }}</h5>
                    <span class="badge bg-warning text-dark">
                      <i class="fas fa-certificate me-1"></i>Certificate
                    </span>
                  </div>

                  <div class="mb-3">
                    <small class="text-muted">
                      <i class="fas fa-calendar me-1"></i>
                      Issued: {{ certificate.issuedAt | date : 'shortDate' }}
                    </small>
                  </div>

                  <div class="mb-3">
                    <small class="text-muted">
                      <i class="fas fa-hashtag me-1"></i>
                      Certificate #: {{ certificate.certificateNumber }}
                    </small>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      class="btn btn-warning btn-sm"
                      (click)="downloadCertificate(certificate.id)"
                    >
                      <i class="fas fa-download me-1"></i>Download
                    </button>
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      (click)="viewCertificate(certificate.courseId)"
                    >
                      <i class="fas fa-eye me-1"></i>View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Certificates -->
          <div
            *ngIf="(certificates$ | async)?.length === 0"
            class="text-center py-3"
          >
            <i class="fas fa-certificate fa-2x text-muted mb-2"></i>
            <p class="text-muted">
              No certificates earned yet. Complete courses to earn certificates!
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container-fluid {
        background: var(--background);
        color: var(--text-primary);
        padding: 2rem 0;
      }
      .card {
        background: var(--surface-primary);
        color: var(--text-primary);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-lg);
        border: 1.5px solid var(--border-light);
        transition: box-shadow 0.2s;
      }
      .card .card-title {
        color: var(--headline-color);
        font-weight: 700;
        font-size: 1.15rem;
      }
      .card .card-text {
        color: var(--text-secondary);
      }
      .badge {
        background: var(--primary-light);
        color: var(--primary-dark);
        border-radius: 1em;
        font-weight: 700;
        padding: 0.4em 1.1em;
        font-size: 1em;
        box-shadow: 0 1px 4px 0 rgba(124, 58, 237, 0.08);
      }
      .badge.bg-success {
        background: #bbf7d0 !important;
        color: #065f46 !important;
      }
      .badge.bg-warning {
        background: #fde68a !important;
        color: #b45309 !important;
      }
      .progress {
        background: var(--surface-secondary);
        border-radius: var(--radius-lg);
        height: 8px;
        box-shadow: 0 1px 4px 0 rgba(124, 58, 237, 0.04);
      }
      .progress-bar {
        background: linear-gradient(90deg, var(--primary-light), var(--primary));
        border-radius: var(--radius-lg);
      }
      .btn, .btn-primary, .btn-outline-success, .btn-outline-primary {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        min-width: 160px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        color: #fff;
        border-radius: var(--radius-lg);
        font-weight: 700;
        font-size: 1.08em;
        padding: 0.7em 1.5em;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.10);
        margin: 0 0.5rem 0.5rem 0;
        border: none;
        transition: background 0.2s, color 0.2s;
      }
      .btn-outline-success, .btn-outline-primary {
        background: transparent;
        color: var(--primary);
        border: 2px solid var(--primary-light);
      }
      .btn-outline-success:hover, .btn-outline-primary:hover {
        background: var(--primary-light);
        color: #fff;
        border-color: var(--primary);
      }
      .btn:hover, .btn-primary:hover {
        background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
        color: #fff;
      }
      .btn-row, .btn-group {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }
      .text-muted {
        color: var(--text-secondary) !important;
      }
      h2, h4 {
        color: var(--headline-color);
        font-weight: 800;
      }
      .fa-book-open, .fa-trophy, .fa-certificate {
        color: var(--primary-light);
      }
    `
  ],
})
export class MyCoursesComponent implements OnInit {
  enrollments$: Observable<Enrollment[]>;
  courses$: Observable<Course[]>;
  certificates$: Observable<Certificate[]>;

  activeEnrollments$!: Observable<EnrollmentWithCourse[]>;
  completedEnrollments$!: Observable<EnrollmentWithCourse[]>;

  constructor(
    private learningService: LearningService,
    private auth: AuthService,
    private router: Router
  ) {
    this.enrollments$ = this.learningService.getEnrollments();
    this.courses$ = this.learningService.getCourses();
    this.certificates$ = this.learningService.getCertificates();
  }

  ngOnInit(): void {
    this.setupEnrollmentData();
  }

  private setupEnrollmentData(): void {
    const currentUserId = this.auth.getUserId()?.toString();
    if (!currentUserId) return;

    // Get user's enrollments
    this.learningService
      .getEnrollmentByEmployee(currentUserId)
      .subscribe((userEnrollments) => {
        // Combine with course data
        this.courses$.subscribe((courses) => {
          const enrollmentsWithCourses: EnrollmentWithCourse[] =
            userEnrollments.map((enrollment) => ({
              ...enrollment,
              course: courses.find(
                (course) => course.id === enrollment.courseId
              ),
            }));

          // Filter active and completed enrollments
          this.activeEnrollments$ = new Observable((subscriber) =>
            subscriber.next(
              enrollmentsWithCourses.filter((e) => !e.completedAt)
            )
          );

          this.completedEnrollments$ = new Observable((subscriber) =>
            subscriber.next(enrollmentsWithCourses.filter((e) => e.completedAt))
          );
        });
      });
  }

  getProgressClass(progress: number): string {
    if (progress < 30) return 'bg-progress-low';
    if (progress < 70) return 'bg-progress-medium';
    return 'bg-progress-high';
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/learning/course', courseId]);
  }

  reviewCourse(courseId: string): void {
    this.router.navigate(['/learning/course', courseId]);
  }

  viewCertificate(courseId: string): void {
    this.router.navigate(['/learning/certificate', courseId]);
  }

  downloadCertificate(certificateId: string): void {
    // Mock download functionality
    console.log('Downloading certificate:', certificateId);
  }

  goToCatalog(): void {
    this.router.navigate(['/learning']);
  }
}

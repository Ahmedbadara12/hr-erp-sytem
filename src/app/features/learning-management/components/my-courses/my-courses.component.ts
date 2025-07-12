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
      .progress-bar {
        background-color: #007bff;
      }

      .badge.bg-progress-low {
        background-color: #dc3545 !important;
      }

      .badge.bg-progress-medium {
        background-color: #ffc107 !important;
        color: #212529 !important;
      }

      .badge.bg-progress-high {
        background-color: #28a745 !important;
      }
    `,
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

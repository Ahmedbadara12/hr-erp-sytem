import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Course, Enrollment } from '../../../../shared/models';
import { LearningService } from '../../services/learning.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CsvUtilService } from '../../../../shared/services/csv-util.service';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid course-catalog-container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div
            class="d-flex flex-wrap flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-2 gap-md-0"
          >
            <h2 class="mb-2 mb-md-0">
              <i class="fas fa-graduation-cap me-2"></i>Course Catalog
            </h2>
            <div class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
              <select
                class="form-select form-select-sm filter-select"
                [(ngModel)]="selectedCategory"
                (change)="filterCourses()"
              >
                <option value="">All Categories</option>
                <option *ngFor="let category of categories" [value]="category">
                  {{ category }}
                </option>
              </select>
              <select
                class="form-select form-select-sm filter-select"
                [(ngModel)]="selectedDifficulty"
                (change)="filterCourses()"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button class="btn btn-info export-btn" (click)="exportCourses()">
                <i class="fas fa-file-export"></i> Export CSV
              </button>
              <label class="btn btn-info import-btn mb-0">
                <i class="fas fa-file-import"></i> Import CSV
                <input
                  type="file"
                  accept=".csv"
                  (change)="importCourses($event)"
                  hidden
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Grid -->
      <div class="row g-4 course-grid">
        <div
          *ngFor="let course of filteredCourses$ | async"
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="card course-card h-100 shadow-sm">
            <img
              [src]="
                course.thumbnail ||
                'https://via.placeholder.com/300x200/6c757d/ffffff?text=Course'
              "
              class="card-img-top course-img"
              [alt]="course.title"
            />
            <div class="card-body d-flex flex-column">
              <div class="mb-2 d-flex flex-wrap gap-2">
                <span class="badge bg-primary">{{ course.category }}</span>
                <span
                  class="badge"
                  [ngClass]="getDifficultyClass(course.difficulty)"
                >
                  {{ course.difficulty }}
                </span>
              </div>
              <h5 class="card-title">{{ course.title }}</h5>
              <p class="card-text text-muted">{{ course.description }}</p>
              <div class="mt-auto">
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    {{ formatDuration(course.duration) }}
                  </small>
                  <small class="text-muted">
                    <i class="fas fa-user me-1"></i>
                    {{ course.enrolledStudents.length }} enrolled
                  </small>
                </div>
                <div class="d-flex flex-column flex-sm-row gap-2">
                  <button
                    class="btn btn-outline-primary btn-sm flex-fill"
                    (click)="viewCourse(course.id)"
                  >
                    <i class="fas fa-eye me-1"></i>View Details
                  </button>
                  <button
                    *ngIf="!isEnrolled(course.id)"
                    class="btn btn-success btn-sm flex-fill"
                    (click)="enrollInCourse(course.id)"
                    [disabled]="enrolling"
                  >
                    <i class="fas fa-plus me-1"></i>Enroll
                  </button>
                  <button
                    *ngIf="isEnrolled(course.id)"
                    class="btn btn-info btn-sm flex-fill"
                    (click)="continueLearning(course.id)"
                  >
                    <i class="fas fa-play me-1"></i>Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="(filteredCourses$ | async)?.length === 0"
        class="text-center py-5"
      >
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">No courses found</h4>
        <p class="text-muted">
          Try adjusting your filters or check back later for new courses.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .course-catalog-container {
        padding: 1.5rem 1rem;
        background: var(--surface, #181f2a);
        min-height: 100vh;
      }
      .course-grid {
        margin-left: 0;
        margin-right: 0;
      }
      .course-card {
        background: var(--card-bg, #232b3e);
        color: var(--text, #f3f4f6);
        border-radius: 1.25rem;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        border: none;
        padding: 0;
        transition: transform 0.2s, box-shadow 0.2s;
        margin-bottom: 1.5rem;
      }
      .course-card:hover {
        transform: translateY(-4px) scale(1.01);
        box-shadow: 0 6px 24px 0 rgba(0, 0, 0, 0.18);
      }
      .course-img {
        height: 200px;
        object-fit: cover;
        border-top-left-radius: 1.25rem;
        border-top-right-radius: 1.25rem;
        background: #222a36;
      }
      .card-title {
        font-weight: 700;
        color: var(--text, #fff);
      }
      .card-text {
        color: var(--text-muted, #b0b8c9);
        font-size: 1em;
      }
      .badge.bg-beginner {
        background-color: #28a745 !important;
      }
      .badge.bg-intermediate {
        background-color: #ffc107 !important;
        color: #212529 !important;
      }
      .badge.bg-advanced {
        background-color: #dc3545 !important;
      }
      .btn-info {
        background: var(--info, #3b82f6);
        color: #fff;
        border: none;
        transition: background 0.2s, color 0.2s;
        height: 44px;
        min-width: 140px;
        padding: 0 1.25em;
        font-size: 1.08em;
        border-radius: 0.8em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        box-sizing: border-box;
      }
      .btn-info:hover {
        background: #2563eb;
        color: #fff;
      }
      .btn-info i {
        margin-right: 0.5em;
      }
      label.btn-info {
        cursor: pointer;
      }
      .filter-select {
        min-width: 140px;
        max-width: 200px;
      }
      .export-btn,
      .import-btn {
        min-width: 140px;
      }
      @media (max-width: 767.98px) {
        .course-catalog-container {
          padding: 1rem 0.25rem;
        }
        .course-grid {
          margin-left: 0;
          margin-right: 0;
        }
        .course-card {
          border-radius: 1rem;
          margin-bottom: 1.25rem;
        }
        .course-img {
          height: 160px;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .d-flex.flex-wrap.flex-column.flex-md-row.justify-content-between.align-items-stretch.align-items-md-center.gap-2.gap-md-0 {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0.75rem !important;
        }
        .d-flex.flex-column.flex-md-row.gap-2.w-100.w-md-auto {
          flex-direction: column !important;
          width: 100% !important;
          gap: 0.5rem !important;
        }
        .filter-select,
        .export-btn,
        .import-btn {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
        }
        .btn-info,
        .btn-outline-primary,
        .btn-success {
          width: 100%;
          min-width: 0;
          font-size: 1em;
        }
        .d-flex.flex-column.flex-sm-row.gap-2 {
          flex-direction: column !important;
          gap: 0.5rem !important;
        }
      }
    `,
  ],
})
export class CourseCatalogComponent implements OnInit {
  courses$: Observable<Course[]>;
  enrollments$: Observable<Enrollment[]>;
  filteredCourses$!: Observable<Course[]>;

  selectedCategory = '';
  selectedDifficulty = '';
  enrolling = false;

  categories: string[] = [];

  constructor(
    private learningService: LearningService,
    private auth: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private csvUtil: CsvUtilService
  ) {
    this.courses$ = this.learningService.getCourses();
    this.enrollments$ = this.learningService.getEnrollments();
  }

  ngOnInit(): void {
    this.setupFilteredCourses();
    this.loadCategories();
  }

  private setupFilteredCourses(): void {
    this.filteredCourses$ = combineLatest([
      this.courses$,
      this.enrollments$,
    ]).pipe(
      map(([courses, enrollments]) => {
        return courses.filter((course) => {
          const categoryMatch =
            !this.selectedCategory || course.category === this.selectedCategory;
          const difficultyMatch =
            !this.selectedDifficulty ||
            course.difficulty === this.selectedDifficulty;
          return categoryMatch && difficultyMatch;
        });
      })
    );
  }

  private loadCategories(): void {
    this.courses$.subscribe((courses) => {
      this.categories = [...new Set(courses.map((course) => course.category))];
    });
  }

  filterCourses(): void {
    this.setupFilteredCourses();
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-beginner';
      case 'Intermediate':
        return 'bg-intermediate';
      case 'Advanced':
        return 'bg-advanced';
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

  isEnrolled(courseId: string): boolean {
    let isEnrolled = false;
    this.enrollments$.subscribe((enrollments) => {
      const currentUserId = this.auth.getUserId()?.toString();
      isEnrolled = enrollments.some(
        (enrollment) =>
          enrollment.courseId === courseId &&
          enrollment.employeeId === currentUserId
      );
    });
    return isEnrolled;
  }

  viewCourse(courseId: string): void {
    this.router.navigate(['/learning/course', courseId]);
  }

  continueLearning(courseId: string): void {
    this.router.navigate(['/learning/course', courseId]);
  }

  enrollInCourse(courseId: string): void {
    const currentUserId = this.auth.getUserId();
    if (!currentUserId) {
      this.notificationService.showError('Please log in to enroll in courses.');
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
          this.enrolling = false;
        },
        error: (error) => {
          this.notificationService.showError(
            'Failed to enroll in course. Please try again.'
          );
          this.enrolling = false;
        },
      });
  }

  exportCourses() {
    this.courses$.subscribe((courses) => {
      const csv = this.csvUtil.arrayToCsv(courses);
      this.csvUtil.downloadCsv(csv, 'courses.csv');
    });
  }

  importCourses(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.csvUtil.readCsvFile(file).then((csv) => {
      const courses = this.csvUtil.csvToArray(csv);
      this.learningService.setCourses(courses); // You may need to implement setCourses in LearningService
      this.courses$ = this.learningService.getCourses();
      this.setupFilteredCourses();
    });
  }
}

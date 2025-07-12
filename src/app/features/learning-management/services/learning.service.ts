import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Course,
  Lesson,
  Enrollment,
  QuizResult,
  Certificate,
  Quiz,
  QuizQuestion,
} from '../../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private enrollmentsSubject = new BehaviorSubject<Enrollment[]>([]);
  private certificatesSubject = new BehaviorSubject<Certificate[]>([]);

  public courses$ = this.coursesSubject.asObservable();
  public enrollments$ = this.enrollmentsSubject.asObservable();
  public certificates$ = this.certificatesSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Course Management
  getCourses(): Observable<Course[]> {
    return this.courses$;
  }

  getCourseById(id: string): Observable<Course | undefined> {
    return of(this.coursesSubject.value.find((course) => course.id === id));
  }

  createCourse(
    course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Course> {
    const newCourse: Course = {
      ...course,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const currentCourses = this.coursesSubject.value;
    this.coursesSubject.next([...currentCourses, newCourse]);

    return of(newCourse).pipe(delay(500));
  }

  updateCourse(
    id: string,
    updates: Partial<Course>
  ): Observable<Course | undefined> {
    const currentCourses = this.coursesSubject.value;
    const courseIndex = currentCourses.findIndex((course) => course.id === id);

    if (courseIndex !== -1) {
      const updatedCourse = {
        ...currentCourses[courseIndex],
        ...updates,
        updatedAt: new Date(),
      };

      currentCourses[courseIndex] = updatedCourse;
      this.coursesSubject.next([...currentCourses]);

      return of(updatedCourse).pipe(delay(500));
    }

    return of(undefined);
  }

  deleteCourse(id: string): Observable<boolean> {
    const currentCourses = this.coursesSubject.value;
    const filteredCourses = currentCourses.filter((course) => course.id !== id);
    this.coursesSubject.next(filteredCourses);

    return of(true).pipe(delay(500));
  }

  setCourses(courses: Course[]) {
    this.coursesSubject.next(courses);
  }

  // Enrollment Management
  getEnrollments(): Observable<Enrollment[]> {
    return this.enrollments$;
  }

  getEnrollmentByEmployee(employeeId: string): Observable<Enrollment[]> {
    return of(
      this.enrollmentsSubject.value.filter(
        (enrollment) => enrollment.employeeId === employeeId
      )
    );
  }

  enrollInCourse(employeeId: string, courseId: string): Observable<Enrollment> {
    const enrollment: Enrollment = {
      id: this.generateId(),
      employeeId,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      quizResults: [],
    };

    const currentEnrollments = this.enrollmentsSubject.value;
    this.enrollmentsSubject.next([...currentEnrollments, enrollment]);

    // Update course enrolled students
    const currentCourses = this.coursesSubject.value;
    const courseIndex = currentCourses.findIndex(
      (course) => course.id === courseId
    );
    if (courseIndex !== -1) {
      currentCourses[courseIndex].enrolledStudents.push(employeeId);
      this.coursesSubject.next([...currentCourses]);
    }

    return of(enrollment).pipe(delay(500));
  }

  updateProgress(
    enrollmentId: string,
    progress: number,
    currentLessonId?: string
  ): Observable<Enrollment | undefined> {
    const currentEnrollments = this.enrollmentsSubject.value;
    const enrollmentIndex = currentEnrollments.findIndex(
      (enrollment) => enrollment.id === enrollmentId
    );

    if (enrollmentIndex !== -1) {
      const updatedEnrollment = {
        ...currentEnrollments[enrollmentIndex],
        progress,
        currentLessonId,
      };

      currentEnrollments[enrollmentIndex] = updatedEnrollment;
      this.enrollmentsSubject.next([...currentEnrollments]);

      return of(updatedEnrollment).pipe(delay(500));
    }

    return of(undefined);
  }

  completeCourse(enrollmentId: string): Observable<Enrollment | undefined> {
    const currentEnrollments = this.enrollmentsSubject.value;
    const enrollmentIndex = currentEnrollments.findIndex(
      (enrollment) => enrollment.id === enrollmentId
    );

    if (enrollmentIndex !== -1) {
      const updatedEnrollment = {
        ...currentEnrollments[enrollmentIndex],
        completedAt: new Date(),
        progress: 100,
        certificateEarned: true,
      };

      currentEnrollments[enrollmentIndex] = updatedEnrollment;
      this.enrollmentsSubject.next([...currentEnrollments]);

      // Generate certificate
      this.generateCertificate(updatedEnrollment);

      return of(updatedEnrollment).pipe(delay(500));
    }

    return of(undefined);
  }

  // Quiz Management
  submitQuizResult(
    enrollmentId: string,
    quizId: string,
    answers: any[]
  ): Observable<QuizResult> {
    // Mock quiz evaluation
    const score = Math.floor(Math.random() * 40) + 60; // 60-100 score
    const totalQuestions = 10;
    const correctAnswers = Math.floor((score / 100) * totalQuestions);

    const quizResult: QuizResult = {
      id: this.generateId(),
      enrollmentId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      completedAt: new Date(),
      timeSpent: Math.floor(Math.random() * 30) + 10, // 10-40 minutes
    };

    // Update enrollment with quiz result
    const currentEnrollments = this.enrollmentsSubject.value;
    const enrollmentIndex = currentEnrollments.findIndex(
      (enrollment) => enrollment.id === enrollmentId
    );

    if (enrollmentIndex !== -1) {
      currentEnrollments[enrollmentIndex].quizResults.push(quizResult);
      this.enrollmentsSubject.next([...currentEnrollments]);
    }

    return of(quizResult).pipe(delay(500));
  }

  // Certificate Management
  getCertificates(): Observable<Certificate[]> {
    return this.certificates$;
  }

  getCertificatesByEmployee(employeeId: string): Observable<Certificate[]> {
    return of(
      this.certificatesSubject.value.filter(
        (certificate) => certificate.employeeId === employeeId
      )
    );
  }

  private generateCertificate(enrollment: Enrollment): void {
    const course = this.coursesSubject.value.find(
      (c) => c.id === enrollment.courseId
    );
    if (!course) return;

    const certificate: Certificate = {
      id: this.generateId(),
      employeeId: enrollment.employeeId,
      courseId: enrollment.courseId,
      courseTitle: course.title,
      issuedAt: new Date(),
      certificateNumber: `CERT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
    };

    const currentCertificates = this.certificatesSubject.value;
    this.certificatesSubject.next([...currentCertificates, certificate]);
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeMockData(): void {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Angular Fundamentals',
        description:
          'Learn the basics of Angular framework including components, services, and routing.',
        category: 'Programming',
        instructor: 'John Doe',
        duration: 480, // 8 hours
        difficulty: 'Beginner',
        thumbnail:
          'https://via.placeholder.com/300x200/007acc/ffffff?text=Angular',
        lessons: [
          {
            id: '1-1',
            courseId: '1',
            title: 'Introduction to Angular',
            description: 'Overview of Angular framework and its architecture',
            content:
              'Angular is a platform for building mobile and desktop web applications...',
            duration: 60,
            order: 1,
          },
          {
            id: '1-2',
            courseId: '1',
            title: 'Components and Templates',
            description: 'Learn about Angular components and template syntax',
            content:
              'Components are the basic building blocks of Angular applications...',
            duration: 90,
            order: 2,
          },
        ],
        enrolledStudents: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: '2',
        title: 'Leadership Skills',
        description:
          'Develop essential leadership skills for managing teams and projects effectively.',
        category: 'Soft Skills',
        instructor: 'Jane Smith',
        duration: 360, // 6 hours
        difficulty: 'Intermediate',
        thumbnail:
          'https://via.placeholder.com/300x200/28a745/ffffff?text=Leadership',
        lessons: [
          {
            id: '2-1',
            courseId: '2',
            title: 'Understanding Leadership',
            description:
              'What makes a great leader and different leadership styles',
            content:
              'Leadership is the ability to influence and guide others...',
            duration: 45,
            order: 1,
          },
          {
            id: '2-2',
            courseId: '2',
            title: 'Communication Skills',
            description: 'Effective communication techniques for leaders',
            content:
              'Clear communication is essential for successful leadership...',
            duration: 60,
            order: 2,
          },
        ],
        enrolledStudents: [],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        isActive: true,
      },
      {
        id: '3',
        title: 'Project Management',
        description: 'Master project management methodologies and tools.',
        category: 'Management',
        instructor: 'Mike Johnson',
        duration: 600, // 10 hours
        difficulty: 'Advanced',
        thumbnail:
          'https://via.placeholder.com/300x200/dc3545/ffffff?text=Project+Mgmt',
        lessons: [
          {
            id: '3-1',
            courseId: '3',
            title: 'Project Planning',
            description:
              'Fundamentals of project planning and scope definition',
            content:
              'Project planning is the foundation of successful project management...',
            duration: 75,
            order: 1,
          },
          {
            id: '3-2',
            courseId: '3',
            title: 'Risk Management',
            description: 'Identifying and managing project risks',
            content: 'Risk management is crucial for project success...',
            duration: 90,
            order: 2,
          },
        ],
        enrolledStudents: [],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        isActive: true,
      },
    ];

    this.coursesSubject.next(mockCourses);
  }
}

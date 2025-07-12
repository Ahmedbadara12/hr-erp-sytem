export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration: number; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail?: string;
  lessons: Lesson[];
  enrolledStudents: string[]; // employee IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number; // in minutes
  order: number;
  resources?: CourseResource[];
  quiz?: Quiz;
}

export interface CourseResource {
  id: string;
  lessonId: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'file';
  url: string;
  description?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
}

export interface Enrollment {
  id: string;
  employeeId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number; // percentage
  currentLessonId?: string;
  quizResults: QuizResult[];
  certificateEarned?: boolean;
}

export interface QuizResult {
  id: string;
  enrollmentId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: Date;
  timeSpent: number; // in minutes
}

export interface Certificate {
  id: string;
  employeeId: string;
  courseId: string;
  courseTitle: string;
  issuedAt: Date;
  certificateNumber: string;
  validUntil?: Date;
} 
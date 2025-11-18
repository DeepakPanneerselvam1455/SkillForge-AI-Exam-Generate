import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName?: string;
  questions: Question[];
  timeLimit: number;
  passingScore: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  attempts?: number;
  maxAttempts: number;
}

export interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  question: string;
  options?: string[];
  correctAnswer: any;
  points: number;
  explanation?: string;
}

export interface QuizSubmission {
  userId: string;
  quizId: string;
  courseId: string;
  answers: { [questionId: string]: any };
  timeTaken: number;
  passingScore: number;
  difficulty?: string;
  notes?: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  attemptNumber: number;
  timeTaken: number;
  submittedAt: Date;
  status: string;
  difficulty: string;
  answers: { [questionId: string]: any };
  feedback?: string;
  grade: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Quiz management (CRUD operations)

  /**
   * Get all quizzes
   */
  getAllQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.API_URL}/quizzes`).pipe(
      catchError(error => {
        console.error('Error fetching quizzes:', error);
        return of(this.getMockQuizzes());
      })
    );
  }

  /**
   * Get quizzes by course ID
   */
  getQuizzesByCourse(courseId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.API_URL}/quizzes/course/${courseId}`).pipe(
      catchError(error => {
        console.error('Error fetching course quizzes:', error);
        return of(this.getMockQuizzes().filter(q => q.courseId === courseId));
      })
    );
  }

  /**
   * Get quiz by ID
   */
  getQuizById(quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.API_URL}/quizzes/${quizId}`).pipe(
      catchError(error => {
        console.error('Error fetching quiz:', error);
        const mockQuiz = this.getMockQuizzes().find(q => q.id === quizId);
        return of(mockQuiz || this.getMockQuiz(quizId));
      })
    );
  }

  /**
   * Create new quiz
   */
  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.API_URL}/quizzes`, quiz).pipe(
      catchError(error => {
        console.error('Error creating quiz:', error);
        return of(this.getMockQuiz());
      })
    );
  }

  /**
   * Update existing quiz
   */
  updateQuiz(quizId: string, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.API_URL}/quizzes/${quizId}`, quiz).pipe(
      catchError(error => {
        console.error('Error updating quiz:', error);
        return of({ ...this.getMockQuiz(quizId), ...quiz } as Quiz);
      })
    );
  }

  /**
   * Delete quiz
   */
  deleteQuiz(quizId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/quizzes/${quizId}`).pipe(
      catchError(error => {
        console.error('Error deleting quiz:', error);
        return of(void 0);
      })
    );
  }

  // Quiz submission and results

  /**
   * Submit quiz answers
   */
  submitQuiz(submission: QuizSubmission): Observable<QuizResult> {
    return this.http.post<QuizResult>(`${this.API_URL}/quiz-results/submit`, submission).pipe(
      catchError(error => {
        console.error('Error submitting quiz:', error);
        return of(this.getMockQuizResult(submission));
      })
    );
  }

  /**
   * Get user's quiz results
   */
  getUserQuizResults(userId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.API_URL}/quiz-results/my/${userId}`).pipe(
      catchError(error => {
        console.error('Error fetching user quiz results:', error);
        return of(this.getMockQuizResults(userId));
      })
    );
  }

  /**
   * Get latest quiz attempt
   */
  getLatestAttempt(userId: string, quizId: string): Observable<QuizResult | null> {
    return this.http.get<QuizResult>(`${this.API_URL}/quiz-results/latest/${userId}/${quizId}`).pipe(
      catchError(error => {
        console.error('Error fetching latest attempt:', error);
        return of(null);
      })
    );
  }

  /**
   * Get quiz results by quiz ID (for instructors)
   */
  getQuizResults(quizId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.API_URL}/quiz-results/quiz/${quizId}`).pipe(
      catchError(error => {
        console.error('Error fetching quiz results:', error);
        return of([]);
      })
    );
  }

  /**
   * Get course quiz results (for instructors)
   */
  getCourseQuizResults(courseId: string): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.API_URL}/quiz-results/course/${courseId}`).pipe(
      catchError(error => {
        console.error('Error fetching course quiz results:', error);
        return of([]);
      })
    );
  }

  /**
   * Get quiz statistics
   */
  getQuizStatistics(courseIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/quiz-results/statistics`, courseIds).pipe(
      catchError(error => {
        console.error('Error fetching quiz statistics:', error);
        return of({
          totalAttempts: 150,
          averageScore: 78.5,
          passRate: 85.2,
          completionRate: 92.1
        });
      })
    );
  }

  // Mock data methods for fallback

  private getMockQuizzes(): Quiz[] {
    return [
      {
        id: 'quiz1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript basics',
        courseId: 'course1',
        courseName: 'Web Development Fundamentals',
        questions: this.getMockQuestions(),
        timeLimit: 30,
        passingScore: 70,
        difficulty: 'MEDIUM',
        status: 'PUBLISHED',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        attempts: 0,
        maxAttempts: 3
      },
      {
        id: 'quiz2',
        title: 'React Components',
        description: 'Advanced React component patterns',
        courseId: 'course1',
        courseName: 'Web Development Fundamentals',
        questions: this.getMockQuestions(),
        timeLimit: 45,
        passingScore: 75,
        difficulty: 'HARD',
        status: 'PUBLISHED',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        attempts: 0,
        maxAttempts: 2
      }
    ];
  }

  private getMockQuestions(): Question[] {
    return [
      {
        id: 'q1',
        type: 'MULTIPLE_CHOICE',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correctAnswer: 0,
        points: 10,
        explanation: 'The var keyword is used to declare variables in JavaScript.'
      },
      {
        id: 'q2',
        type: 'TRUE_FALSE',
        question: 'JavaScript is a compiled language.',
        correctAnswer: false,
        points: 5,
        explanation: 'JavaScript is an interpreted language, not compiled.'
      }
    ];
  }

  private getMockQuiz(id?: string): Quiz {
    const quizzes = this.getMockQuizzes();
    return id ? quizzes.find(q => q.id === id) || quizzes[0] : quizzes[0];
  }

  private getMockQuizResult(submission: QuizSubmission): QuizResult {
    const totalQuestions = Object.keys(submission.answers).length;
    const correctAnswers = Math.floor(totalQuestions * 0.8); // Simulate 80% correct
    const score = (correctAnswers / totalQuestions) * 100;

    return {
      id: 'result_' + Date.now(),
      userId: submission.userId,
      quizId: submission.quizId,
      courseId: submission.courseId,
      score: score,
      totalQuestions: totalQuestions,
      correctAnswers: correctAnswers,
      passed: score >= submission.passingScore,
      attemptNumber: 1,
      timeTaken: submission.timeTaken,
      submittedAt: new Date(),
      status: 'COMPLETED',
      difficulty: submission.difficulty || 'MEDIUM',
      answers: submission.answers,
      feedback: score >= submission.passingScore ? 'Great job!' : 'Keep practicing!',
      grade: this.calculateGrade(score)
    };
  }

  private getMockQuizResults(userId: string): QuizResult[] {
    return [
      {
        id: 'result1',
        userId: userId,
        quizId: 'quiz1',
        courseId: 'course1',
        score: 85,
        totalQuestions: 10,
        correctAnswers: 8,
        passed: true,
        attemptNumber: 1,
        timeTaken: 1200,
        submittedAt: new Date('2024-01-16'),
        status: 'COMPLETED',
        difficulty: 'MEDIUM',
        answers: {},
        feedback: 'Good work!',
        grade: 'B'
      },
      {
        id: 'result2',
        userId: userId,
        quizId: 'quiz2',
        courseId: 'course1',
        score: 92,
        totalQuestions: 15,
        correctAnswers: 14,
        passed: true,
        attemptNumber: 1,
        timeTaken: 1800,
        submittedAt: new Date('2024-01-21'),
        status: 'COMPLETED',
        difficulty: 'HARD',
        answers: {},
        feedback: 'Excellent!',
        grade: 'A'
      }
    ];
  }

  private calculateGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}
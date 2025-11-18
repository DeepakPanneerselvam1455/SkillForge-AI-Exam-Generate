import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constants';

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructorName: string;
  progress: number;
  enrolledAt: Date;
  lastAccessed: Date;
  isCompleted: boolean;
}

export interface StudentStats {
  enrolledCourses: number;
  completedCourses: number;
  completedQuizzes: number;
  averageScore: number;
  studyStreak: number;
  weeklyProgress: number[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly baseUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // Course Management
  getAvailableCourses(): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BASE}`);
  }

  getMyCourses(studentId: string): Observable<StudentCourse[]> {
    return this.http.get<StudentCourse[]>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BY_STUDENT(studentId)}`);
  }

  enrollInCourse(courseId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.ENROLL(courseId)}`, {});
  }

  unenrollFromCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.UNENROLL(courseId)}`);
  }

  // Analytics
  getStudentStats(studentId: string): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.STUDENT_STATS(studentId)}`);
  }

  // Mock data methods
  getMockAvailableCourses(): Observable<StudentCourse[]> {
    const mockCourses: StudentCourse[] = [
      {
        id: '1',
        title: 'Introduction to Programming',
        description: 'Learn the fundamentals of programming with hands-on examples',
        difficulty: 'BEGINNER',
        instructorName: 'Prof. Smith',
        progress: 0,
        enrolledAt: new Date(),
        lastAccessed: new Date(),
        isCompleted: false
      },
      {
        id: '2',
        title: 'Web Development Bootcamp',
        description: 'Complete web development course covering HTML, CSS, and JavaScript',
        difficulty: 'INTERMEDIATE',
        instructorName: 'Dr. Johnson',
        progress: 0,
        enrolledAt: new Date(),
        lastAccessed: new Date(),
        isCompleted: false
      },
      {
        id: '3',
        title: 'Data Science with Python',
        description: 'Advanced data analysis and machine learning with Python',
        difficulty: 'ADVANCED',
        instructorName: 'Prof. Davis',
        progress: 0,
        enrolledAt: new Date(),
        lastAccessed: new Date(),
        isCompleted: false
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockCourses);
        observer.complete();
      }, 500);
    });
  }

  getMockMyCourses(): Observable<StudentCourse[]> {
    const mockCourses: StudentCourse[] = [
      {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'Master the basics of JavaScript programming',
        difficulty: 'BEGINNER',
        instructorName: 'Prof. Smith',
        progress: 75,
        enrolledAt: new Date('2024-02-01'),
        lastAccessed: new Date('2024-03-19'),
        isCompleted: false
      },
      {
        id: '2',
        title: 'React Development',
        description: 'Build modern web applications with React',
        difficulty: 'INTERMEDIATE',
        instructorName: 'Dr. Johnson',
        progress: 100,
        enrolledAt: new Date('2024-01-15'),
        lastAccessed: new Date('2024-03-10'),
        isCompleted: true
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockCourses);
        observer.complete();
      }, 500);
    });
  }

  getMockStudentStats(): Observable<StudentStats> {
    const mockStats: StudentStats = {
      enrolledCourses: 8,
      completedCourses: 5,
      completedQuizzes: 23,
      averageScore: 87.5,
      studyStreak: 12,
      weeklyProgress: [2, 4, 3, 5, 6, 4, 7]
    };
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockStats);
        observer.complete();
      }, 500);
    });
  }
}
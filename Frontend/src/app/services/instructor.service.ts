import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constants';

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'PENDING' | 'APPROVED';
  enrolledStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledCourses: string[];
  progress: { [courseId: string]: number };
  lastActivity: Date;
}

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalQuizzes: number;
  averageRating: number;
  monthlyEnrollments: number[];
  coursesStatus: { [status: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private readonly baseUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // Course Management
  getMyCourses(instructorId: string): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BY_INSTRUCTOR(instructorId)}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BASE}`, course);
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BY_ID(id)}`, course);
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BY_ID(id)}`);
  }

  // Student Management
  getMyStudents(instructorId: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/api/instructor/${instructorId}/students`);
  }

  // Analytics
  getInstructorStats(instructorId: string): Observable<InstructorStats> {
    return this.http.get<InstructorStats>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.INSTRUCTOR_STATS(instructorId)}`);
  }

  // Mock data methods
  getMockCourses(): Observable<Course[]> {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        difficulty: 'BEGINNER',
        status: 'PUBLISHED',
        enrolledStudents: 45,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-10')
      },
      {
        id: '2',
        title: 'Advanced React Patterns',
        description: 'Master advanced React development techniques',
        difficulty: 'ADVANCED',
        status: 'PUBLISHED',
        enrolledStudents: 23,
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: '3',
        title: 'Node.js Backend Development',
        description: 'Build scalable backend applications with Node.js',
        difficulty: 'INTERMEDIATE',
        status: 'DRAFT',
        enrolledStudents: 0,
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-20')
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockCourses);
        observer.complete();
      }, 500);
    });
  }

  getMockStudents(): Observable<Student[]> {
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        enrolledCourses: ['1', '2'],
        progress: { '1': 85, '2': 42 },
        lastActivity: new Date('2024-03-18')
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        enrolledCourses: ['1'],
        progress: { '1': 67 },
        lastActivity: new Date('2024-03-19')
      },
      {
        id: '3',
        name: 'Carol Brown',
        email: 'carol@example.com',
        enrolledCourses: ['2'],
        progress: { '2': 91 },
        lastActivity: new Date('2024-03-20')
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockStudents);
        observer.complete();
      }, 500);
    });
  }

  getMockInstructorStats(): Observable<InstructorStats> {
    const mockStats: InstructorStats = {
      totalCourses: 5,
      totalStudents: 87,
      totalQuizzes: 12,
      averageRating: 4.6,
      monthlyEnrollments: [5, 8, 12, 15, 18, 22, 25, 30, 28, 35, 40, 45],
      coursesStatus: { 'PUBLISHED': 3, 'DRAFT': 1, 'PENDING': 1 }
    };
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockStats);
        observer.complete();
      }, 500);
    });
  }
}
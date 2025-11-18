import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../constants/api.constants';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  createdAt: Date;
  isActive: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  enrolledCount: number;
  createdAt: Date;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalQuizzes: number;
  monthlyUserGrowth: number[];
  coursesByDifficulty: { [key: string]: number };
  usersByRole: { [key: string]: number };
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = API_CONFIG.BASE_URL;

  constructor(private http: HttpClient) {}

  // User Management
  getAllUsers(page: number = 0, size: number = 10, search?: string, role?: string): Observable<PaginatedResponse<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    
    return this.http.get<PaginatedResponse<User>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BASE}`, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BASE}`, user);
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.BY_ROLE(role)}`);
  }

  // Course Management
  getAllCourses(page: number = 0, size: number = 10): Observable<PaginatedResponse<Course>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PaginatedResponse<Course>>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BASE}`, { params });
  }

  approveCourse(id: string): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.APPROVE(id)}`, {});
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.COURSES.BY_ID(id)}`);
  }

  // Analytics
  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.ADMIN_STATS}`);
  }

  getPlatformUsage(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYTICS.PLATFORM_USAGE}`);
  }

  // Mock data methods (fallback when backend is not ready)
  getMockAdminStats(): Observable<AdminStats> {
    const mockStats: AdminStats = {
      totalUsers: 152,
      totalStudents: 98,
      totalInstructors: 12,
      totalCourses: 24,
      totalQuizzes: 48,
      monthlyUserGrowth: [10, 15, 8, 25, 18, 30, 22, 35, 28, 40, 33, 45],
      coursesByDifficulty: { 'BEGINNER': 10, 'INTERMEDIATE': 8, 'ADVANCED': 6 },
      usersByRole: { 'STUDENT': 98, 'INSTRUCTOR': 12, 'ADMIN': 3 }
    };
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockStats);
        observer.complete();
      }, 500);
    });
  }

  getMockUsers(): Observable<PaginatedResponse<User>> {
    const mockUsers: User[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'STUDENT', createdAt: new Date(), isActive: true },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'INSTRUCTOR', createdAt: new Date(), isActive: true },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'ADMIN', createdAt: new Date(), isActive: true }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          content: mockUsers,
          totalElements: mockUsers.length,
          totalPages: 1,
          size: 10,
          number: 0
        });
        observer.complete();
      }, 500);
    });
  }
}
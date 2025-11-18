import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth.service';

interface DashboardData {
  user: User;
  totalCourses: number;
  totalQuizzes: number;
  totalStudents: number;
  courseUploadTools: string[];
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instructor-dashboard.html',
  styleUrls: ['./instructor-dashboard.css']
})
export class InstructorDashboardComponent implements OnInit {
  user: User | null = null;
  dashboardData: DashboardData | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if user has instructor role
    if (!this.authService.isInstructor()) {
      console.warn('User is not an instructor, logging out');
      this.authService.logout();
      return;
    }

    this.user = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>('http://localhost:8080/api/dashboard/instructor', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        // Only logout on authentication errors, not on other API errors
        if (error.status === 401) {
          console.warn('Authentication failed, logging out');
          this.authService.logout();
        } else {
          // For other errors (like 404, 500), just show the error but keep user logged in
          console.warn('API error but keeping user logged in:', error.status);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
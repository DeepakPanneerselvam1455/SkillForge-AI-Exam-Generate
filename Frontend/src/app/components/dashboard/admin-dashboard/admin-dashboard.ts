import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../services/auth.service';

interface DashboardData {
  user: User;
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  totalCourses: number;
  totalQuizzes: number;
  managementTools: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
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

    // Check if user has admin role
    if (!this.authService.isAdmin()) {
      console.warn('User is not an admin, logging out');
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

    this.http.get<any>('http://localhost:8080/api/dashboard/admin', {
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
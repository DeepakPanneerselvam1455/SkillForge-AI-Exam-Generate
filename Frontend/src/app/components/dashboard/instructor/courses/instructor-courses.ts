import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>My Courses</h1>
          <div class="user-info">
            <span>Welcome, {{ user?.name }}!</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav class="dashboard-nav">
        <div class="nav-content">
          <a routerLink="/dashboard/instructor" class="nav-item">
            <i class="icon">📊</i>Overview
          </a>
          <a routerLink="/dashboard/instructor/courses" routerLinkActive="active" class="nav-item">
            <i class="icon">📚</i>My Courses
          </a>
          <a routerLink="/dashboard/instructor/upload" class="nav-item">
            <i class="icon">⬆️</i>Upload Content
          </a>
          <a routerLink="/dashboard/instructor/students" class="nav-item">
            <i class="icon">👥</i>Students
          </a>
          <a routerLink="/dashboard/instructor/profile" class="nav-item">
            <i class="icon">👤</i>Profile
          </a>
        </div>
      </nav>

      <main class="dashboard-main">
        <div class="page-header">
          <h2>Course Management</h2>
          <button class="btn-primary">Create New Course</button>
        </div>

        <div class="courses-grid" *ngIf="!isLoading">
          <div *ngFor="let course of courses" class="course-card">
            <div class="course-header">
              <h3>{{ course.title }}</h3>
              <div class="course-status" [class]="course.status">{{ course.status }}</div>
            </div>
            <p>{{ course.description }}</p>
            <div class="course-stats">
              <span>👥 {{ course.enrolledStudents }} students</span>
              <span>📝 {{ course.lessons }} lessons</span>
              <span>⭐ {{ course.rating }}/5</span>
            </div>
            <div class="course-actions">
              <button class="btn-primary">Edit Course</button>
              <button class="btn-secondary">View Analytics</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container { min-height: 100vh; background: #f8f9fa; }
    .dashboard-header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px 0; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
    .header-content h1 { margin: 0; font-size: 2rem; font-weight: 700; }
    .user-info { display: flex; align-items: center; gap: 15px; }
    .logout-btn { background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; }
    .dashboard-nav { background: white; border-bottom: 1px solid #e1e5e9; }
    .nav-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 15px 20px; text-decoration: none; color: #666; font-weight: 500; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
    .nav-item:hover, .nav-item.active { color: #28a745; border-bottom-color: #28a745; background: #f8f9fa; }
    .dashboard-main { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .page-header h2 { color: #333; font-size: 1.8rem; margin: 0; }
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; }
    .course-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .course-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .course-header h3 { color: #333; font-size: 1.2rem; margin: 0; }
    .course-status { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .course-status.published { background: #d4edda; color: #155724; }
    .course-status.draft { background: #fff3cd; color: #856404; }
    .course-stats { display: flex; gap: 15px; margin: 15px 0; color: #666; font-size: 0.9rem; }
    .course-actions { display: flex; gap: 10px; }
    .btn-primary { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .btn-secondary { background: #f8f9fa; color: #333; border: 2px solid #e1e5e9; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
  `]
})
export class InstructorCoursesComponent implements OnInit {
  courses: any[] = [];
  isLoading = true;
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.authService.isAuthenticated() || !this.authService.isInstructor()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCourses();
  }

  loadCourses(): void {
    setTimeout(() => {
      this.courses = [
        { id: '1', title: 'JavaScript Advanced', description: 'Advanced JavaScript concepts', status: 'published', enrolledStudents: 45, lessons: 12, rating: 4.8 },
        { id: '2', title: 'React Hooks Deep Dive', description: 'Master React Hooks', status: 'draft', enrolledStudents: 0, lessons: 8, rating: 0 },
        { id: '3', title: 'Node.js Backend', description: 'Build scalable backends', status: 'published', enrolledStudents: 32, lessons: 16, rating: 4.6 }
      ];
      this.isLoading = false;
    }, 1000);
  }

  logout(): void {
    this.authService.logout();
  }
}
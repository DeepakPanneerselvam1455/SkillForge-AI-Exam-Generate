import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { THEME_COLORS } from '../../../constants/api.constants';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="student-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Student Dashboard</h1>
          <div class="user-info">
            <span>Welcome, {{currentUser?.name}}</span>
            <button class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="dashboard-nav">
        <div class="nav-container">
          <a routerLink="/dashboard/student/learning" 
             routerLinkActive="active" 
             class="nav-item">
            <i class="icon">📚</i>
            <span>Learning Modules</span>
          </a>
          <a routerLink="/dashboard/student/courses" 
             routerLinkActive="active" 
             class="nav-item">
            <i class="icon">🎓</i>
            <span>My Courses</span>
          </a>
          <a routerLink="/dashboard/student/progress" 
             routerLinkActive="active" 
             class="nav-item">
            <i class="icon">📈</i>
            <span>Progress</span>
          </a>
          <a routerLink="/dashboard/student/profile" 
             routerLinkActive="active" 
             class="nav-item">
            <i class="icon">👤</i>
            <span>Profile</span>
          </a>
        </div>
      </nav>

      <!-- Content Area -->
      <main class="dashboard-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .student-dashboard {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .dashboard-header {
      background: linear-gradient(135deg, ${THEME_COLORS.STUDENT}, #8e44ad);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }

    .header-content h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .dashboard-nav {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 0;
      box-shadow: 0 1px 5px rgba(0,0,0,0.05);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      padding: 0 1rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      text-decoration: none;
      color: #6c757d;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }

    .nav-item:hover {
      color: ${THEME_COLORS.STUDENT};
      background-color: #f8f9fa;
    }

    .nav-item.active {
      color: ${THEME_COLORS.STUDENT};
      border-bottom-color: ${THEME_COLORS.STUDENT};
      background-color: #f8f0ff;
    }

    .nav-item .icon {
      font-size: 1.2rem;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
      
      .nav-container {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .nav-item {
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.authService.logout();
      return;
    }
    
    this.currentUser = this.authService.getCurrentUser();
    
    // Only redirect if user is authenticated and on the base dashboard route
    if (this.authService.isAuthenticated() && this.router.url === '/dashboard/student') {
      this.router.navigate(['/dashboard/student/learning']);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
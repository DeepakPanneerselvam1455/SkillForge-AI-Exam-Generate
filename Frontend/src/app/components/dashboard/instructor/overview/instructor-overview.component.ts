import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstructorService, InstructorStats } from '../../../../services/instructor.service';
import { AuthService } from '../../../../services/auth.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-instructor-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="instructor-overview">
      <div class="page-header">
        <h2>Instructor Overview</h2>
        <p>Welcome to your teaching dashboard. Here's your course summary.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Stats Cards -->
      <div *ngIf="!isLoading && stats" class="stats-grid">
        <div class="stat-card courses">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>{{stats.totalCourses}}</h3>
            <p>My Courses</p>
          </div>
        </div>
        
        <div class="stat-card students">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{stats.totalStudents}}</h3>
            <p>Total Students</p>
          </div>
        </div>
        
        <div class="stat-card quizzes">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{stats.totalQuizzes}}</h3>
            <p>Quizzes Created</p>
          </div>
        </div>
        
        <div class="stat-card rating">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <h3>{{stats.averageRating}}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div *ngIf="!isLoading && stats" class="charts-section">
        <div class="chart-container">
          <h3>Monthly Enrollments</h3>
          <div class="simple-chart">
            <div class="chart-bars">
              <div *ngFor="let value of stats.monthlyEnrollments; let i = index" 
                   class="chart-bar" 
                   [style.height.px]="value * 4">
                <span class="bar-value">{{value}}</span>
              </div>
            </div>
            <div class="chart-labels">
              <span *ngFor="let month of monthLabels">{{month}}</span>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <h3>Course Status Distribution</h3>
          <div class="status-distribution">
            <div class="status-item" *ngFor="let status of getStatusData()">
              <div class="status-circle" [style.width.px]="status.count * 30" [style.height.px]="status.count * 30">
                <span>{{status.count}}</span>
              </div>
              <p>{{status.name}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn" routerLink="/dashboard/instructor/courses">
            <i class="icon">📚</i>
            <span>Manage Courses</span>
          </button>
          <button class="action-btn" routerLink="/dashboard/instructor/upload">
            <i class="icon">📤</i>
            <span>Upload Content</span>
          </button>
          <button class="action-btn" routerLink="/dashboard/instructor/students">
            <i class="icon">👥</i>
            <span>View Students</span>
          </button>
          <button class="action-btn" routerLink="/dashboard/instructor/profile">
            <i class="icon">👤</i>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .instructor-overview {
      padding: 2rem 0;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h2 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2rem;
      font-weight: 600;
    }

    .page-header p {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #28a745;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }

    .stat-card.courses .stat-icon { background: #e8f5e8; }
    .stat-card.students .stat-icon { background: #e3f2fd; }
    .stat-card.quizzes .stat-icon { background: #fff3e0; }
    .stat-card.rating .stat-icon { background: #fce4ec; }

    .stat-content h3 {
      margin: 0 0 0.25rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }

    .stat-content p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .chart-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .chart-container h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .simple-chart {
      height: 200px;
    }

    .chart-bars {
      display: flex;
      align-items: end;
      height: 150px;
      gap: 5px;
      margin-bottom: 1rem;
    }

    .chart-bar {
      flex: 1;
      background: linear-gradient(to top, #28a745, #4caf50);
      border-radius: 4px 4px 0 0;
      min-height: 10px;
      position: relative;
      display: flex;
      align-items: end;
      justify-content: center;
    }

    .bar-value {
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #666;
    }

    .status-distribution {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .status-item {
      text-align: center;
    }

    .status-circle {
      background: linear-gradient(135deg, #28a745, #4caf50);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      margin: 0 auto 0.5rem;
      min-width: 60px;
      min-height: 60px;
    }

    .quick-actions {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .quick-actions h3 {
      margin: 0 0 1.5rem 0;
      color: #333;
      font-size: 1.2rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #28a745, #4caf50);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      font-size: 1rem;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
    }

    .action-btn .icon {
      font-size: 1.5rem;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .status-distribution {
        justify-content: center;
      }
    }
  `]
})
export class InstructorOverviewComponent implements OnInit {
  stats: InstructorStats | null = null;
  isLoading = true;
  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private instructorService: InstructorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.instructorService.getInstructorStats(user.id)
        .pipe(
          catchError(error => {
            console.warn('Backend not available, using mock data');
            return this.instructorService.getMockInstructorStats();
          })
        )
        .subscribe({
          next: (stats) => {
            this.stats = stats;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading stats:', error);
            this.isLoading = false;
          }
        });
    }
  }

  getStatusData() {
    if (!this.stats) return [];
    
    return Object.entries(this.stats.coursesStatus).map(([name, count]) => ({
      name: name.toLowerCase(),
      count
    }));
  }
}
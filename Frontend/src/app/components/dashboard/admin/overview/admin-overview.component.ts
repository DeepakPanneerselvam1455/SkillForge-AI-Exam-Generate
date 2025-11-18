import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStats } from '../../../../services/admin.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-overview">
      <div class="page-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome to the SkillForge Admin Panel. Here's your platform summary.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Stats Cards -->
      <div *ngIf="!isLoading && stats" class="stats-grid">
        <div class="stat-card users">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>{{stats.totalUsers}}</h3>
            <p>Total Users</p>
          </div>
        </div>
        
        <div class="stat-card students">
          <div class="stat-icon">🎓</div>
          <div class="stat-content">
            <h3>{{stats.totalStudents}}</h3>
            <p>Students</p>
          </div>
        </div>
        
        <div class="stat-card instructors">
          <div class="stat-icon">🏫</div>
          <div class="stat-content">
            <h3>{{stats.totalInstructors}}</h3>
            <p>Instructors</p>
          </div>
        </div>
        
        <div class="stat-card courses">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <h3>{{stats.totalCourses}}</h3>
            <p>Total Courses</p>
          </div>
        </div>
        
        <div class="stat-card quizzes">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>{{stats.totalQuizzes}}</h3>
            <p>Total Quizzes</p>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div *ngIf="!isLoading && stats" class="charts-section">
        <div class="chart-container">
          <h3>Monthly User Growth</h3>
          <div class="simple-chart">
            <div class="chart-bars">
              <div *ngFor="let value of stats.monthlyUserGrowth; let i = index" 
                   class="chart-bar" 
                   [style.height.px]="value * 3">
                <span class="bar-value">{{value}}</span>
              </div>
            </div>
            <div class="chart-labels">
              <span *ngFor="let month of monthLabels">{{month}}</span>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <h3>Users by Role</h3>
          <div class="role-distribution">
            <div class="role-item" *ngFor="let role of getRoleData()">
              <div class="role-bar">
                <div class="role-fill" [style.width.%]="role.percentage"></div>
              </div>
              <div class="role-info">
                <span class="role-name">{{role.name}}</span>
                <span class="role-count">{{role.count}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <h3>Courses by Difficulty</h3>
          <div class="difficulty-chart">
            <div class="difficulty-item" *ngFor="let diff of getDifficultyData()">
              <div class="difficulty-circle" [style.width.px]="diff.count * 20" [style.height.px]="diff.count * 20">
                <span>{{diff.count}}</span>
              </div>
              <p>{{diff.name}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn" routerLink="/dashboard/admin/users">
            <i class="icon">👤</i>
            <span>Manage Users</span>
          </button>
          <button class="action-btn" routerLink="/dashboard/admin/courses">
            <i class="icon">📚</i>
            <span>Review Courses</span>
          </button>
          <button class="action-btn" routerLink="/dashboard/admin/analytics">
            <i class="icon">📈</i>
            <span>View Analytics</span>
          </button>
          <button class="action-btn" routerLink="/dashboard/admin/settings">
            <i class="icon">⚙️</i>
            <span>System Settings</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-overview {
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
      border-top: 4px solid #ff6b35;
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

    .stat-card.users .stat-icon { background: #e3f2fd; }
    .stat-card.students .stat-icon { background: #f3e5f5; }
    .stat-card.instructors .stat-icon { background: #e8f5e8; }
    .stat-card.courses .stat-icon { background: #fff3e0; }
    .stat-card.quizzes .stat-icon { background: #fce4ec; }

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
      background: linear-gradient(to top, #ff6b35, #ff8c5a);
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

    .role-distribution {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .role-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .role-bar {
      flex: 1;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .role-fill {
      height: 100%;
      background: linear-gradient(to right, #ff6b35, #ff8c5a);
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .role-info {
      display: flex;
      flex-direction: column;
      min-width: 80px;
    }

    .role-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .role-count {
      color: #666;
      font-size: 0.8rem;
    }

    .difficulty-chart {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .difficulty-item {
      text-align: center;
    }

    .difficulty-circle {
      background: linear-gradient(135deg, #ff6b35, #ff8c5a);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      margin: 0 auto 0.5rem;
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
      background: linear-gradient(135deg, #ff6b35, #ff8c5a);
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
      box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
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
    }
  `]
})
export class AdminOverviewComponent implements OnInit {
  stats: AdminStats | null = null;
  isLoading = true;
  monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getAdminStats()
      .pipe(
        catchError(error => {
          console.warn('Backend not available, using mock data');
          return this.adminService.getMockAdminStats();
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

  getRoleData() {
    if (!this.stats) return [];
    
    const total = this.stats.totalUsers;
    return Object.entries(this.stats.usersByRole).map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100
    }));
  }

  getDifficultyData() {
    if (!this.stats) return [];
    
    return Object.entries(this.stats.coursesByDifficulty).map(([name, count]) => ({
      name: name.toLowerCase(),
      count
    }));
  }
}
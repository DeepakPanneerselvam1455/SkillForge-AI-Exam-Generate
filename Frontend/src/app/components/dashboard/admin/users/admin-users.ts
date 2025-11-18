import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>User Management</h1>
          <div class="user-info">
            <span>Welcome, {{ user?.name }}!</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <nav class="dashboard-nav">
        <div class="nav-content">
          <a routerLink="/dashboard/admin" class="nav-item">
            <i class="icon">📊</i>Overview
          </a>
          <a routerLink="/dashboard/admin/users" routerLinkActive="active" class="nav-item">
            <i class="icon">👥</i>User Management
          </a>
          <a routerLink="/dashboard/admin/courses" class="nav-item">
            <i class="icon">📚</i>Course Management
          </a>
          <a routerLink="/dashboard/admin/analytics" class="nav-item">
            <i class="icon">📈</i>Analytics
          </a>
          <a routerLink="/dashboard/admin/settings" class="nav-item">
            <i class="icon">⚙️</i>Settings
          </a>
        </div>
      </nav>

      <main class="dashboard-main">
        <div class="page-header">
          <h2>User Management</h2>
          <button class="btn-primary">Add New User</button>
        </div>

        <div class="filters-section">
          <div class="filter-buttons">
            <button class="filter-btn active">All Users</button>
            <button class="filter-btn">Students</button>
            <button class="filter-btn">Instructors</button>
            <button class="filter-btn">Admins</button>
          </div>
        </div>

        <div class="users-table" *ngIf="!isLoading">
          <div class="table-header">
            <div class="col-user">User</div>
            <div class="col-role">Role</div>
            <div class="col-status">Status</div>
            <div class="col-joined">Joined</div>
            <div class="col-actions">Actions</div>
          </div>
          <div *ngFor="let user of users" class="table-row">
            <div class="col-user">
              <div class="user-avatar">{{ user.name.charAt(0) }}</div>
              <div class="user-info-cell">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div class="col-role">
              <div class="role-badge" [class]="user.role.toLowerCase()">{{ user.role }}</div>
            </div>
            <div class="col-status">
              <div class="status-badge" [class]="user.status.toLowerCase()">{{ user.status }}</div>
            </div>
            <div class="col-joined">{{ formatDate(user.joinedDate) }}</div>
            <div class="col-actions">
              <button class="action-btn">Edit</button>
              <button class="action-btn danger" *ngIf="user.status === 'Active'">Suspend</button>
              <button class="action-btn" *ngIf="user.status === 'Suspended'">Activate</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container { min-height: 100vh; background: #f8f9fa; }
    .dashboard-header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; padding: 20px 0; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }
    .header-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
    .header-content h1 { margin: 0; font-size: 2rem; font-weight: 700; }
    .user-info { display: flex; align-items: center; gap: 15px; }
    .logout-btn { background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.3); padding: 8px 16px; border-radius: 6px; cursor: pointer; }
    .dashboard-nav { background: white; border-bottom: 1px solid #e1e5e9; }
    .nav-content { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; }
    .nav-item { display: flex; align-items: center; gap: 8px; padding: 15px 20px; text-decoration: none; color: #666; font-weight: 500; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
    .nav-item:hover, .nav-item.active { color: #dc3545; border-bottom-color: #dc3545; background: #f8f9fa; }
    .dashboard-main { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .page-header h2 { color: #333; font-size: 1.8rem; margin: 0; }
    .filters-section { margin-bottom: 30px; text-align: center; }
    .filter-buttons { display: inline-flex; background: white; border-radius: 8px; padding: 4px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    .filter-btn { background: transparent; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; color: #666; }
    .filter-btn.active { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; }
    .users-table { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .table-header, .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr; padding: 15px 20px; align-items: center; }
    .table-header { background: #f8f9fa; font-weight: 600; color: #333; border-bottom: 1px solid #e1e5e9; }
    .table-row { border-bottom: 1px solid #f1f3f4; }
    .col-user { display: flex; align-items: center; gap: 15px; }
    .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
    .user-name { font-weight: 500; color: #333; }
    .user-email { font-size: 0.9rem; color: #666; }
    .role-badge, .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
    .role-badge.student { background: #d4edda; color: #155724; }
    .role-badge.instructor { background: #cff4fc; color: #087990; }
    .role-badge.admin { background: #f8d7da; color: #721c24; }
    .status-badge.active { background: #d4edda; color: #155724; }
    .status-badge.suspended { background: #f8d7da; color: #721c24; }
    .col-actions { display: flex; gap: 8px; }
    .action-btn { padding: 6px 12px; border: 1px solid #e1e5e9; background: white; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .action-btn.danger { border-color: #dc3545; color: #dc3545; }
    .btn-primary { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500; }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  isLoading = true;
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    setTimeout(() => {
      this.users = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'STUDENT', status: 'Active', joinedDate: '2024-01-15' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'INSTRUCTOR', status: 'Active', joinedDate: '2024-01-10' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'STUDENT', status: 'Suspended', joinedDate: '2024-02-01' },
        { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'ADMIN', status: 'Active', joinedDate: '2024-01-05' }
      ];
      this.isLoading = false;
    }, 1000);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  logout(): void {
    this.authService.logout();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User, PaginatedResponse } from '../../../../services/admin.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-management">
      <div class="page-header">
        <h2>User Management</h2>
        <p>Manage all users in the SkillForge platform</p>
      </div>

      <!-- Controls -->
      <div class="controls-section">
        <div class="search-filters">
          <div class="search-box">
            <input type="text" 
                   [(ngModel)]="searchTerm" 
                   (input)="onSearch()"
                   placeholder="Search users by name or email..."
                   class="search-input">
            <button class="search-btn" (click)="onSearch()">🔍</button>
          </div>
          
          <select [(ngModel)]="selectedRole" 
                  (change)="onFilterChange()" 
                  class="role-filter">
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>

        <button class="add-user-btn" (click)="openAddUserModal()">
          <i class="icon">➕</i>
          Add New User
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <div *ngIf="!isLoading" class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users" class="user-row">
              <td class="user-name">
                <div class="user-avatar">{{user.name.charAt(0).toUpperCase()}}</div>
                <span>{{user.name}}</span>
              </td>
              <td>{{user.email}}</td>
              <td>
                <span class="role-badge" [class]="user.role.toLowerCase()">
                  {{user.role}}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="user.isActive ? 'active' : 'inactive'">
                  {{user.isActive ? 'Active' : 'Inactive'}}
                </span>
              </td>
              <td>{{formatDate(user.createdAt)}}</td>
              <td class="actions-cell">
                <button class="action-btn edit" (click)="editUser(user)" title="Edit">
                  ✏️
                </button>
                <button class="action-btn delete" (click)="deleteUser(user)" title="Delete">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div *ngIf="users.length === 0" class="empty-state">
          <div class="empty-icon">👤</div>
          <h3>No users found</h3>
          <p>No users match your current filters.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div *ngIf="!isLoading && totalElements > 0" class="pagination">
        <button class="page-btn" 
                [disabled]="currentPage === 0" 
                (click)="previousPage()">
          Previous
        </button>
        
        <span class="page-info">
          Page {{currentPage + 1}} of {{totalPages}} ({{totalElements}} total)
        </span>
        
        <button class="page-btn" 
                [disabled]="currentPage >= totalPages - 1" 
                (click)="nextPage()">
          Next
        </button>
      </div>

      <!-- Add/Edit User Modal -->
      <div *ngIf="showModal" class="modal-overlay" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{editingUser ? 'Edit User' : 'Add New User'}}</h3>
            <button class="close-btn" (click)="closeModal()">✕</button>
          </div>
          
          <form (ngSubmit)="saveUser()" #userForm="ngForm" class="user-form">
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input type="text" 
                     id="name" 
                     [(ngModel)]="currentUser.name" 
                     name="name" 
                     required 
                     class="form-input">
            </div>
            
            <div class="form-group">
              <label for="email">Email Address *</label>
              <input type="email" 
                     id="email" 
                     [(ngModel)]="currentUser.email" 
                     name="email" 
                     required 
                     class="form-input">
            </div>
            
            <div class="form-group">
              <label for="role">Role *</label>
              <select id="role" 
                      [(ngModel)]="currentUser.role" 
                      name="role" 
                      required 
                      class="form-select">
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" 
                       [(ngModel)]="currentUser.isActive" 
                       name="isActive">
                <span>Active User</span>
              </label>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">
                Cancel
              </button>
              <button type="submit" 
                      class="btn-primary" 
                      [disabled]="!userForm.valid || isSaving">
                {{isSaving ? 'Saving...' : (editingUser ? 'Update' : 'Create')}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management {
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

    .controls-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-filters {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      border: 1px solid #ddd;
      overflow: hidden;
    }

    .search-input {
      border: none;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      outline: none;
      min-width: 300px;
    }

    .search-btn {
      background: #ff6b35;
      color: white;
      border: none;
      padding: 0.75rem 1rem;
      cursor: pointer;
      font-size: 1.2rem;
    }

    .role-filter {
      padding: 0.75rem 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: white;
      font-size: 1rem;
      outline: none;
    }

    .add-user-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #ff6b35;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .add-user-btn:hover {
      background: #ff5722;
      transform: translateY(-2px);
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

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th,
    .users-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #f0f0f0;
    }

    .users-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
    }

    .user-row:hover {
      background: #f8f9fa;
    }

    .user-name {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #ff6b35;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .role-badge.admin { background: #ffebee; color: #c62828; }
    .role-badge.instructor { background: #e8f5e8; color: #2e7d32; }
    .role-badge.student { background: #f3e5f5; color: #7b1fa2; }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .status-badge.active { background: #e8f5e8; color: #2e7d32; }
    .status-badge.inactive { background: #ffebee; color: #c62828; }

    .actions-cell {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.5rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f0f0f0;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .page-btn {
      background: #ff6b35;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .page-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .page-btn:not(:disabled):hover {
      background: #ff5722;
    }

    .page-info {
      color: #666;
      font-size: 0.9rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
    }

    .user-form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
    }

    .form-input,
    .form-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-select:focus {
      border-color: #ff6b35;
    }

    .checkbox-label {
      display: flex !important;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-secondary,
    .btn-primary {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-primary {
      background: #ff6b35;
      color: white;
      border: none;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .controls-section {
        flex-direction: column;
        align-items: stretch;
      }
      
      .search-filters {
        justify-content: center;
      }
      
      .search-input {
        min-width: 200px;
      }
      
      .modal-content {
        margin: 1rem;
        width: auto;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = true;
  searchTerm = '';
  selectedRole = '';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // Modal state
  showModal = false;
  editingUser = false;
  isSaving = false;
  currentUser: Partial<User> = {};

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers(this.currentPage, this.pageSize, this.searchTerm, this.selectedRole)
      .pipe(
        catchError(error => {
          console.warn('Backend not available, using mock data');
          return this.adminService.getMockUsers();
        })
      )
      .subscribe({
        next: (response: PaginatedResponse<User>) => {
          this.users = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  openAddUserModal(): void {
    this.editingUser = false;
    this.currentUser = {
      name: '',
      email: '',
      role: 'STUDENT',
      isActive: true
    };
    this.showModal = true;
  }

  editUser(user: User): void {
    this.editingUser = true;
    this.currentUser = { ...user };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentUser = {};
    this.editingUser = false;
    this.isSaving = false;
  }

  saveUser(): void {
    this.isSaving = true;
    
    const saveOperation = this.editingUser 
      ? this.adminService.updateUser(this.currentUser.id!, this.currentUser)
      : this.adminService.createUser(this.currentUser);

    saveOperation.subscribe({
      next: (user) => {
        console.log('User saved successfully:', user);
        this.closeModal();
        this.loadUsers(); // Reload the users list
      },
      error: (error) => {
        console.error('Error saving user:', error);
        this.isSaving = false;
        // In real app, show error toast
        alert('Error saving user. Please try again.');
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.loadUsers(); // Reload the users list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user. Please try again.');
        }
      });
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
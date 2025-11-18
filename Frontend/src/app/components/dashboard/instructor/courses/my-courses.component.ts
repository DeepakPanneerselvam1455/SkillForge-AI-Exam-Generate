import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstructorService, Course } from '../../../../services/instructor.service';
import { AuthService } from '../../../../services/auth.service';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="my-courses">
      <div class="page-header">
        <h2>My Courses</h2>
        <p>Manage all your courses and track student engagement</p>
        <button class="create-course-btn" (click)="createNewCourse()">
          <i class="icon">➕</i>
          Create New Course
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading your courses...</p>
      </div>

      <!-- Courses Grid -->
      <div *ngIf="!isLoading" class="courses-grid">
        <div *ngFor="let course of courses" class="course-card">
          <div class="course-header">
            <h3>{{course.title}}</h3>
            <div class="course-status" [class]="course.status.toLowerCase()">
              {{course.status}}
            </div>
          </div>
          
          <p class="course-description">{{course.description}}</p>
          
          <div class="course-meta">
            <div class="meta-item">
              <span class="meta-label">Difficulty:</span>
              <span class="difficulty-badge" [class]="course.difficulty.toLowerCase()">
                {{course.difficulty}}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Students:</span>
              <span class="meta-value">{{course.enrolledStudents}}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Created:</span>
              <span class="meta-value">{{formatDate(course.createdAt)}}</span>
            </div>
          </div>
          
          <div class="course-actions">
            <button class="action-btn edit" (click)="editCourse(course)">
              ✏️ Edit
            </button>
            <button class="action-btn resources" (click)="manageResources(course)">
              📎 Resources
            </button>
            <button class="action-btn view" (click)="viewStudents(course)">
              👥 Students
            </button>
            <button class="action-btn delete" (click)="deleteCourse(course)">
              🗑️ Delete
            </button>
          </div>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="courses.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>No courses yet</h3>
          <p>Start by creating your first course to engage with students.</p>
          <button class="create-course-btn" (click)="createNewCourse()">
            Create Your First Course
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-courses {
      padding: 2rem 0;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header div {
      flex: 1;
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

    .create-course-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #28a745;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .create-course-btn:hover {
      background: #218838;
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
      border-top: 4px solid #28a745;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .course-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: all 0.2s;
    }

    .course-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0,0,0,0.15);
    }

    .course-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .course-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.3rem;
      flex: 1;
    }

    .course-status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .course-status.published { background: #d4edda; color: #155724; }
    .course-status.draft { background: #fff3cd; color: #856404; }
    .course-status.pending { background: #cce7ff; color: #004085; }

    .course-description {
      color: #666;
      line-height: 1.5;
      margin-bottom: 1.5rem;
    }

    .course-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-label {
      color: #666;
      font-size: 0.9rem;
    }

    .meta-value {
      color: #333;
      font-weight: 500;
    }

    .difficulty-badge {
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .difficulty-badge.beginner { background: #d4edda; color: #155724; }
    .difficulty-badge.intermediate { background: #fff3cd; color: #856404; }
    .difficulty-badge.advanced { background: #f8d7da; color: #721c24; }

    .course-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .action-btn.edit {
      background: #28a745;
      color: white;
    }
    
    .action-btn.resources {
      background: #6f42c1;
      color: white;
    }

    .action-btn.view {
      background: #17a2b8;
      color: white;
    }

    .action-btn.delete {
      background: #dc3545;
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      grid-column: 1 / -1;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .courses-grid {
        grid-template-columns: 1fr;
      }
      
      .course-header {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }
    }
  `]
})
export class MyCoursesComponent implements OnInit {
  courses: Course[] = [];
  isLoading = true;

  constructor(
    private instructorService: InstructorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.instructorService.getMyCourses(user.id)
        .pipe(
          catchError(error => {
            console.warn('Backend not available, using mock data');
            return this.instructorService.getMockCourses();
          })
        )
        .subscribe({
          next: (courses) => {
            this.courses = courses;
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading courses:', error);
            this.isLoading = false;
          }
        });
    }
  }

  createNewCourse(): void {
    // TODO: Open course creation modal
    console.log('Create new course');
  }

  editCourse(course: Course): void {
    // TODO: Open course editing modal
    console.log('Edit course:', course.title);
  }

  manageResources(course: Course): void {
    // TODO: Navigate to course resources management
    console.log('Manage resources for course:', course.title);
  }

  viewStudents(course: Course): void {
    // TODO: Navigate to course students view
    console.log('View students for course:', course.title);
  }

  deleteCourse(course: Course): void {
    if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
      // TODO: Implement delete functionality
      console.log('Delete course:', course.title);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
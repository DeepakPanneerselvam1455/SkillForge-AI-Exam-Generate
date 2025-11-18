import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../../../../constants/api.constants';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-learning-modules',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="learning-modules">
      <div class="page-header">
        <h2>Course Resources</h2>
        <p>Access learning materials and resources from your courses</p>
      </div>

      <!-- Course Selection -->
      <div class="section">
        <h3>Select Course</h3>
        <div class="form-group">
          <select [(ngModel)]="selectedCourseId" class="form-control" (change)="onCourseSelected()">
            <option value="">Select a course...</option>
            <option *ngFor="let course of courses" [value]="course.id">{{course.title}}</option>
          </select>
        </div>
      </div>

      <!-- Course Resources -->
      <div class="section" *ngIf="selectedCourseId && courseResources.length > 0">
        <h3>{{selectedCourseTitle}} Resources</h3>
        <div class="resources-grid">
          <div *ngFor="let resource of courseResources" class="resource-card">
            <div class="resource-header">
              <h4>{{resource.title}}</h4>
              <span class="resource-type">{{resource.type}}</span>
            </div>
            <p *ngIf="resource.description">{{resource.description}}</p>
            <div class="resource-meta">
              <span *ngIf="resource.size" class="resource-size">{{formatFileSize(resource.size)}}</span>
              <span class="upload-date">{{formatDate(resource.uploadedAt)}}</span>
            </div>
            <div class="resource-actions">
              <a [href]="resource.url" target="_blank" class="btn btn-primary">View</a>
              <a [href]="resource.url + '/download'" class="btn btn-outline-primary">Download</a>
            </div>
          </div>
        </div>
      </div>

      <!-- No Resources Message -->
      <div class="section" *ngIf="selectedCourseId && courseResources.length === 0 && !loading">
        <div class="empty-state">
          <div class="empty-icon">📁</div>
          <h3>No Resources Available</h3>
          <p>This course doesn't have any resources yet. Check back later or contact your instructor.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div class="section" *ngIf="loading">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading course resources...</p>
        </div>
      </div>

      <!-- Default State -->
      <div class="content-placeholder" *ngIf="!selectedCourseId">
        <div class="placeholder-icon">📚</div>
        <h3>Course Resources</h3>
        <p>Select a course above to view its learning materials and resources.</p>
        <div class="feature-list">
          <ul>
            <li>📝 Access course documents and PDFs</li>
            <li>🔗 View external resource links</li>
            <li>📊 Download course materials</li>
            <li>📹 Access video lectures (coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .learning-modules {
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

    .section {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .section h3 {
      color: #333;
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #2196F3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    }

    .resources-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .resource-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 1.5rem;
      background: #fafafa;
      transition: all 0.2s;
    }

    .resource-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .resource-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .resource-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.2rem;
    }

    .resource-type {
      background: #2196F3;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .resource-card p {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .resource-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #888;
    }

    .resource-size, .upload-date {
      background: #f0f0f0;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .resource-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #2196F3;
      color: white;
    }

    .btn-primary:hover {
      background: #1976D2;
    }

    .btn-outline-primary {
      background: transparent;
      color: #2196F3;
      border: 1px solid #2196F3;
    }

    .btn-outline-primary:hover {
      background: #2196F3;
      color: white;
    }

    .empty-state, .loading-state {
      text-align: center;
      padding: 2rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #2196F3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .content-placeholder {
      background: white;
      padding: 3rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      text-align: center;
    }

    .placeholder-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    .content-placeholder h3 {
      color: #333;
      margin-bottom: 1rem;
    }

    .content-placeholder p {
      color: #666;
      margin-bottom: 2rem;
    }

    .feature-list {
      max-width: 600px;
      margin: 0 auto;
    }

    .feature-list ul {
      list-style: none;
      padding: 0;
      text-align: left;
    }

    .feature-list li {
      padding: 0.5rem 0;
      color: #555;
    }
  `]
})
export class LearningModulesComponent implements OnInit {
  private readonly API_URL = API_CONFIG.BASE_URL;
  
  courses: any[] = [];
  selectedCourseId: string = '';
  selectedCourseTitle: string = '';
  courseResources: any[] = [];
  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAvailableCourses();
  }

  loadAvailableCourses(): void {
    const headers = this.getAuthHeaders();
    this.http.get<any>(`${this.API_URL}/courses`, { headers }).subscribe({
      next: (response) => {
        this.courses = response.courses || response || [];
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.toastService.showError('Failed to load courses');
      }
    });
  }

  onCourseSelected(): void {
    if (this.selectedCourseId) {
      const selectedCourse = this.courses.find(c => c.id === this.selectedCourseId);
      this.selectedCourseTitle = selectedCourse?.title || '';
      this.loadCourseResources();
    } else {
      this.courseResources = [];
      this.selectedCourseTitle = '';
    }
  }

  loadCourseResources(): void {
    this.loading = true;
    const headers = this.getAuthHeaders();
    this.http.get<any>(`${this.API_URL}/student/course/${this.selectedCourseId}/resources`, { headers })
      .subscribe({
        next: (response) => {
          this.courseResources = response.resources || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading course resources:', error);
          this.toastService.showError('Failed to load course resources');
          this.loading = false;
        }
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}

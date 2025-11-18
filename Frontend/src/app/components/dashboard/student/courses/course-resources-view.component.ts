import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../../services/toast.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CourseResource {
  id: string;
  title: string;
  type: string;
  url: string;
  description: string;
  size: number;
  order: number;
  uploadedAt: string;
}

@Component({
  selector: 'app-course-resources-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="course-resources-view">
      <div class="resources-header">
        <h3>Course Resources</h3>
        <p class="resources-subtitle">Access all materials shared by your instructor</p>
      </div>

      <!-- Resources List -->
      <div class="resources-list" *ngIf="!isLoading">
        <div *ngFor="let resource of resources; trackBy: trackByResourceId" class="resource-item">
          <div class="resource-info">
            <div class="resource-header">
              <div class="resource-icon">
                {{ getResourceTypeIcon(resource.type) }}
              </div>
              <div class="resource-details">
                <h4>{{ resource.title }}</h4>
                <span class="resource-type" [class]="resource.type.toLowerCase()">
                  {{ resource.type }}
                </span>
              </div>
            </div>
            <p class="resource-description" *ngIf="resource.description">
              {{ resource.description }}
            </p>
            <div class="resource-meta">
              <span class="meta-item">
                <i class="icon">📅</i>
                {{ formatDate(resource.uploadedAt) }}
              </span>
              <span class="meta-item" *ngIf="resource.size > 0">
                <i class="icon">📏</i>
                {{ formatFileSize(resource.size) }}
              </span>
            </div>
          </div>
          <div class="resource-actions">
            <button class="action-btn primary" (click)="openResource(resource)">
              <i class="icon">{{ getActionIcon(resource.type) }}</i>
              {{ getActionText(resource.type) }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="resources.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <h4>No resources available</h4>
          <p>Your instructor hasn't shared any resources for this course yet.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading course resources...</p>
      </div>
    </div>
  `,
  styles: [`
    .course-resources-view {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .resources-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .resources-header h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.6rem;
      font-weight: 600;
    }

    .resources-subtitle {
      color: #666;
      font-size: 1rem;
      margin: 0;
    }

    .resources-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .resource-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      background: #fff;
      transition: all 0.2s;
    }

    .resource-item:hover {
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
      transform: translateY(-2px);
    }

    .resource-info {
      flex: 1;
    }

    .resource-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .resource-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .resource-details h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .resource-type {
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .resource-type.document {
      background: #d4edda;
      color: #155724;
    }

    .resource-type.link {
      background: #cce7ff;
      color: #004085;
    }

    .resource-type.video {
      background: #fff3cd;
      color: #856404;
    }

    .resource-description {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    .resource-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.9rem;
      color: #666;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .resource-actions {
      margin-left: 1rem;
      display: flex;
      align-items: center;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;
    }

    .action-btn.primary {
      background: #007bff;
      color: white;
    }

    .action-btn.primary:hover {
      background: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,123,255,0.3);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h4 {
      margin-bottom: 1rem;
      color: #333;
      font-size: 1.3rem;
    }

    .empty-state p {
      font-size: 1rem;
      line-height: 1.5;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .resource-item {
        flex-direction: column;
        gap: 1rem;
      }

      .resource-actions {
        margin-left: 0;
        align-self: flex-start;
      }

      .resource-meta {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class CourseResourcesViewComponent implements OnInit {
  @Input() courseId: string = '';

  resources: CourseResource[] = [];
  isLoading = true;

  private readonly API_URL = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.courseId) {
      this.loadResources();
    }
  }

  loadResources(): void {
    this.isLoading = true;
    this.getCourseResources(this.courseId).subscribe({
      next: (resources) => {
        this.resources = resources;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading resources:', error);
        this.toastService.showError('Failed to load course resources');
        this.isLoading = false;
      }
    });
  }

  openResource(resource: CourseResource): void {
    // Open resource in new tab
    window.open(resource.url, '_blank');
    
    // Show success message
    this.toastService.showInfo(`Opening ${resource.title}...`);
  }

  trackByResourceId(index: number, resource: CourseResource): string {
    return resource.id;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getResourceTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'document': return '📄';
      case 'link': return '🔗';
      case 'video': return '🎥';
      default: return '📎';
    }
  }

  getActionIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'document': return '📥';
      case 'link': return '🔗';
      case 'video': return '▶️';
      default: return '👁️';
    }
  }

  getActionText(type: string): string {
    switch (type.toLowerCase()) {
      case 'document': return 'Download';
      case 'link': return 'Visit';
      case 'video': return 'Watch';
      default: return 'View';
    }
  }

  // HTTP methods
  private getCourseResources(courseId: string): Observable<CourseResource[]> {
    return this.http.get<any>(`${this.API_URL}/instructor/course/${courseId}/resources`)
      .pipe(
        catchError(error => {
          console.error('Failed to get course resources:', error);
          return of([]);
        })
      ).pipe(
        // Transform backend response to match frontend interface
        map(response => {
          if (response && response.resources) {
            return response.resources.map((resource: any, index: number) => ({
              id: index.toString(),
              title: resource.title,
              type: resource.type,
              url: resource.url,
              description: resource.description || '',
              size: resource.fileSize || 0,
              order: index,
              uploadedAt: resource.uploadedAt
            }));
          }
          return [];
        })
      );
  }
}
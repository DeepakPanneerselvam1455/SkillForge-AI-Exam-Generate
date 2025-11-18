import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

export interface ResourceRequest {
  title: string;
  type: string;
  url: string;
  description: string;
  size: number;
  order: number;
}

@Component({
  selector: 'app-course-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="course-resources">
      <div class="resources-header">
        <h3>Course Resources</h3>
        <button class="add-resource-btn" (click)="toggleAddForm()">
          <i class="icon">➕</i>
          Add Resource
        </button>
      </div>

      <!-- Add Resource Form -->
      <div class="add-form" *ngIf="showAddForm">
        <form [formGroup]="resourceForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label for="title">Resource Title *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="Enter resource title"
                class="form-input"
                [class.error]="resourceForm.get('title')?.invalid && resourceForm.get('title')?.touched"
              />
              <span class="error-message" *ngIf="resourceForm.get('title')?.invalid && resourceForm.get('title')?.touched">
                Title is required
              </span>
            </div>

            <div class="form-group">
              <label for="type">Type *</label>
              <select
                id="type"
                formControlName="type"
                class="form-select"
                [class.error]="resourceForm.get('type')?.invalid && resourceForm.get('type')?.touched"
              >
                <option value="">Select type</option>
                <option value="DOCUMENT">Document (PDF, DOC, PPT)</option>
                <option value="LINK">External Link</option>
                <option value="VIDEO">Video</option>
              </select>
              <span class="error-message" *ngIf="resourceForm.get('type')?.invalid && resourceForm.get('type')?.touched">
                Type is required
              </span>
            </div>

            <div class="form-group full-width">
              <label for="url">URL *</label>
              <input
                id="url"
                type="url"
                formControlName="url"
                placeholder="Enter URL (e.g., https://drive.google.com/file/...)"
                class="form-input"
                [class.error]="resourceForm.get('url')?.invalid && resourceForm.get('url')?.touched"
              />
              <span class="error-message" *ngIf="resourceForm.get('url')?.invalid && resourceForm.get('url')?.touched">
                Valid URL is required
              </span>
            </div>

            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                placeholder="Enter resource description (optional)"
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="order">Display Order</label>
              <input
                id="order"
                type="number"
                formControlName="order"
                placeholder="0"
                class="form-input"
                min="0"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="cancelAdd()">
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              [disabled]="resourceForm.invalid || isSubmitting"
            >
              <span *ngIf="isSubmitting">Adding...</span>
              <span *ngIf="!isSubmitting">Add Resource</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Resources List -->
      <div class="resources-list" *ngIf="!isLoading">
        <div *ngFor="let resource of resources; trackBy: trackByResourceId" class="resource-item">
          <div class="resource-info">
            <div class="resource-header">
              <h4>{{ resource.title }}</h4>
              <span class="resource-type" [class]="resource.type.toLowerCase()">
                {{ getResourceTypeIcon(resource.type) }} {{ resource.type }}
              </span>
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
            <button class="action-btn view" (click)="viewResource(resource)">
              <i class="icon">👁️</i> View
            </button>
            <button class="action-btn delete" (click)="deleteResource(resource)">
              <i class="icon">🗑️</i> Delete
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="resources.length === 0" class="empty-state">
          <div class="empty-icon">📎</div>
          <h4>No resources yet</h4>
          <p>Add documents, links, or videos to share with your students.</p>
          <button class="add-resource-btn" (click)="toggleAddForm()">
            Add First Resource
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading resources...</p>
      </div>
    </div>
  `,
  styles: [`
    .course-resources {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }

    .resources-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .resources-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.4rem;
    }

    .add-resource-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #28a745;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .add-resource-btn:hover {
      background: #218838;
      transform: translateY(-1px);
    }

    .add-form {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e9ecef;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .form-input,
    .form-select,
    .form-textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      outline: none;
      border-color: #28a745;
    }

    .form-input.error,
    .form-select.error {
      border-color: #dc3545;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
      justify-content: flex-end;
    }

    .cancel-btn {
      padding: 0.75rem 1.5rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .cancel-btn:hover {
      background: #5a6268;
    }

    .submit-btn {
      padding: 0.75rem 1.5rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .submit-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .submit-btn:not(:disabled):hover {
      background: #218838;
    }

    .resources-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .resource-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1rem;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      background: #fff;
      transition: border-color 0.2s;
    }

    .resource-item:hover {
      border-color: #28a745;
    }

    .resource-info {
      flex: 1;
    }

    .resource-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .resource-header h4 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .resource-type {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
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
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .resource-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
      color: #666;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .resource-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 1rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
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
      color: #666;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h4 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .empty-state p {
      margin-bottom: 1.5rem;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }

    .loading-spinner {
      width: 30px;
      height: 30px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #28a745;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .resource-item {
        flex-direction: column;
        gap: 1rem;
      }

      .resource-actions {
        margin-left: 0;
        align-self: flex-start;
      }
    }
  `]
})
export class CourseResourcesComponent implements OnInit {
  @Input() courseId: string = '';

  resources: CourseResource[] = [];
  showAddForm = false;
  isLoading = true;
  isSubmitting = false;
  resourceForm: FormGroup;

  private readonly API_URL = 'http://localhost:8080/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.resourceForm = this.fb.group({
      title: ['', [Validators.required]],
      type: ['', [Validators.required]],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.*$/)]],
      description: [''],
      order: [0, [Validators.min(0)]]
    });
  }

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

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resourceForm.reset();
    }
  }

  onSubmit(): void {
    if (this.resourceForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.resourceForm.value;
      
      const resourceRequest: ResourceRequest = {
        title: formValue.title,
        type: formValue.type,
        url: formValue.url,
        description: formValue.description || '',
        size: 0,
        order: formValue.order || 0
      };

      this.addResourceToCourse(this.courseId, resourceRequest).subscribe({
        next: (resource) => {
          this.resources.push(resource);
          this.resources.sort((a, b) => a.order - b.order);
          this.resourceForm.reset();
          this.showAddForm = false;
          this.isSubmitting = false;
          this.toastService.showSuccess('Resource added successfully');
        },
        error: (error) => {
          console.error('Error adding resource:', error);
          this.toastService.showError('Failed to add resource');
          this.isSubmitting = false;
        }
      });
    }
  }

  cancelAdd(): void {
    this.resourceForm.reset();
    this.showAddForm = false;
  }

  viewResource(resource: CourseResource): void {
    window.open(resource.url, '_blank');
  }

  deleteResource(resource: CourseResource): void {
    if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      const resourceIndex = this.resources.findIndex(r => r.id === resource.id);
      
      this.removeResourceFromCourse(this.courseId, resourceIndex.toString()).subscribe({
        next: () => {
          this.resources = this.resources.filter(r => r.id !== resource.id);
          this.toastService.showSuccess('Resource deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting resource:', error);
          this.toastService.showError('Failed to delete resource');
        }
      });
    }
  }

  trackByResourceId(index: number, resource: CourseResource): string {
    return resource.id;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
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

  private addResourceToCourse(courseId: string, resource: ResourceRequest): Observable<CourseResource> {
    // Transform frontend request to match backend ResourceItem format
    const backendResource = {
      title: resource.title,
      type: resource.type,
      url: resource.url,
      description: resource.description
    };
    
    return this.http.post<any>(`${this.API_URL}/instructor/course/${courseId}/resources`, backendResource)
      .pipe(
        map(response => ({
          id: Math.random().toString(36).substr(2, 9), // Temporary ID
          title: backendResource.title,
          type: backendResource.type,
          url: backendResource.url,
          description: backendResource.description,
          size: 0,
          order: resource.order,
          uploadedAt: new Date().toISOString()
        }))
      );
  }

  private removeResourceFromCourse(courseId: string, resourceIndex: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/instructor/course/${courseId}/resources/${resourceIndex}`);
  }
}
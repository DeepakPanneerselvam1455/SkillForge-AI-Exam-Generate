import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="upload-content">
      <div class="page-header">
        <h2>Upload Course Resources</h2>
        <p>Add and manage course materials for your students</p>
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

      <!-- File Upload Section -->
      <div class="section" *ngIf="selectedCourseId">
        <h3>Upload File</h3>
        <div class="upload-area" [class.drag-over]="isDragOver" 
             (dragover)="onDragOver($event)" 
             (dragleave)="onDragLeave($event)" 
             (drop)="onDrop($event)" 
             (click)="fileInput.click()">
          <input #fileInput type="file" (change)="onFileSelected($event)" style="display: none" 
                 accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png">
          <div class="upload-icon">📁</div>
          <p>Click to select files or drag and drop</p>
          <p class="file-types">Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, Images</p>
        </div>

        <!-- Selected File Info -->
        <div *ngIf="selectedFile" class="file-info">
          <h4>Selected File:</h4>
          <p><strong>Name:</strong> {{selectedFile.name}}</p>
          <p><strong>Size:</strong> {{formatFileSize(selectedFile.size)}}</p>
          <p><strong>Type:</strong> {{selectedFile.type}}</p>
        </div>

        <!-- Upload Progress -->
        <div *ngIf="uploadProgress > 0" class="progress">
          <div class="progress-bar" [style.width.%]="uploadProgress"></div>
        </div>

        <!-- Resource Details Form -->
        <div class="form-section" *ngIf="selectedFile">
          <h4>Resource Details</h4>
          <div class="form-group">
            <label>Title</label>
            <input type="text" [(ngModel)]="resourceTitle" class="form-control" 
                   placeholder="Enter resource title">
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="resourceDescription" class="form-control" 
                      placeholder="Enter resource description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Resource Type</label>
            <select [(ngModel)]="resourceType" class="form-control">
              <option value="DOCUMENT">Document</option>
              <option value="PDF">PDF</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="IMAGE">Image</option>
            </select>
          </div>

          <button (click)="uploadResource()" class="btn btn-primary" 
                  [disabled]="isUploading || !resourceTitle">
            {{isUploading ? 'Uploading...' : 'Upload Resource'}}
          </button>
        </div>
      </div>

      <!-- Add Link Resource -->
      <div class="section" *ngIf="selectedCourseId">
        <h3>Add Link Resource</h3>
        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="linkTitle" class="form-control" placeholder="Enter link title">
        </div>
        <div class="form-group">
          <label>URL</label>
          <input type="url" [(ngModel)]="linkUrl" class="form-control" placeholder="https://...">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="linkDescription" class="form-control" placeholder="Enter link description" rows="2"></textarea>
        </div>
        <button (click)="addLinkResource()" class="btn btn-secondary" [disabled]="!linkTitle || !linkUrl">
          Add Link
        </button>
      </div>

      <!-- Course Resources List -->
      <div class="section" *ngIf="selectedCourseId && courseResources.length > 0">
        <h3>Current Course Resources</h3>
        <div class="resources-list">
          <div *ngFor="let resource of courseResources; let i = index" class="resource-item">
            <div class="resource-info">
              <h4>{{resource.title}}</h4>
              <p>{{resource.description}}</p>
              <span class="resource-type">{{resource.type}}</span>
              <span class="resource-size" *ngIf="resource.size">{{formatFileSize(resource.size)}}</span>
            </div>
            <div class="resource-actions">
              <a [href]="resource.url" target="_blank" class="btn btn-sm btn-outline-primary">View</a>
              <button (click)="removeResource(i)" class="btn btn-sm btn-outline-danger">Remove</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-content {
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

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
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
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }

    .upload-area {
      border: 2px dashed #ddd;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .upload-area:hover, .upload-area.drag-over {
      border-color: #4CAF50;
      background: #f0fff0;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.7;
    }

    .file-types {
      font-size: 0.9rem;
      color: #888;
      margin-top: 0.5rem;
    }

    .file-info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .file-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .file-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #666;
    }

    .progress {
      background: #f0f0f0;
      border-radius: 10px;
      height: 20px;
      margin: 1rem 0;
      overflow: hidden;
    }

    .progress-bar {
      background: #4CAF50;
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .form-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }

    .form-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary {
      background: #4CAF50;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #45a049;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .resources-list {
      gap: 1rem;
    }

    .resource-item {
      display: flex;
      justify-content: space-between;
      align-items: start;
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .resource-info h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    .resource-info p {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.9rem;
    }

    .resource-type, .resource-size {
      display: inline-block;
      background: #f0f0f0;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #666;
      margin-right: 0.5rem;
    }

    .resource-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .btn-outline-primary {
      background: transparent;
      color: #4CAF50;
      border: 1px solid #4CAF50;
    }

    .btn-outline-primary:hover {
      background: #4CAF50;
      color: white;
    }

    .btn-outline-danger {
      background: transparent;
      color: #dc3545;
      border: 1px solid #dc3545;
    }

    .btn-outline-danger:hover {
      background: #dc3545;
      color: white;
    }
  `]
})
export class UploadContentComponent implements OnInit {
  private readonly API_URL = 'http://localhost:8080/api';
  
  courses: any[] = [];
  selectedCourseId: string = '';
  courseResources: any[] = [];
  
  selectedFile: File | null = null;
  isDragOver: boolean = false;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  
  resourceTitle: string = '';
  resourceDescription: string = '';
  resourceType: string = 'DOCUMENT';
  
  linkTitle: string = '';
  linkUrl: string = '';
  linkDescription: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadInstructorCourses();
  }

  loadInstructorCourses(): void {
    const headers = this.getAuthHeaders();
    this.http.get<any>(`${this.API_URL}/instructor/courses`, { headers }).subscribe({
      next: (response) => {
        this.courses = response.courses || [];
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.toastService.showError('Failed to load courses');
      }
    });
  }

  onCourseSelected(): void {
    if (this.selectedCourseId) {
      this.loadCourseResources();
    }
  }

  loadCourseResources(): void {
    const headers = this.getAuthHeaders();
    this.http.get<any>(`${this.API_URL}/instructor/course/${this.selectedCourseId}/resources`, { headers })
      .subscribe({
        next: (response) => {
          this.courseResources = response.resources || [];
        },
        error: (error) => {
          console.error('Error loading course resources:', error);
        }
      });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFileSelection(file);
    }
  }

  handleFileSelection(file: File): void {
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      this.toastService.showError('File size too large. Maximum 50MB allowed.');
      return;
    }
    
    this.selectedFile = file;
    this.resourceTitle = file.name.split('.')[0]; // Default title from filename
  }

  uploadResource(): void {
    if (!this.selectedFile || !this.resourceTitle || !this.selectedCourseId) {
      this.toastService.showError('Please select a file and enter a title');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // First upload the file
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const headers = this.getAuthHeaders();
    this.http.post<any>(`${this.API_URL}/instructor/files/upload`, formData, { headers })
      .subscribe({
        next: (uploadResponse) => {
          // File uploaded successfully, now add it as a course resource
          const resourceData = {
            title: this.resourceTitle,
            type: this.resourceType,
            url: uploadResponse.file.fileDownloadUri,
            description: this.resourceDescription,
            size: this.selectedFile!.size,
            order: this.courseResources.length
          };

          this.http.post<any>(`${this.API_URL}/instructor/course/${this.selectedCourseId}/resources`, resourceData, { headers })
            .subscribe({
              next: (resourceResponse) => {
                this.toastService.showSuccess('Resource uploaded successfully!');
                this.clearForm();
                this.loadCourseResources();
              },
              error: (error) => {
                console.error('Error adding resource:', error);
                this.toastService.showError('Failed to add resource to course');
              },
              complete: () => {
                this.isUploading = false;
                this.uploadProgress = 0;
              }
            });
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          this.toastService.showError('Failed to upload file');
          this.isUploading = false;
          this.uploadProgress = 0;
        }
      });
  }

  addLinkResource(): void {
    if (!this.linkTitle || !this.linkUrl || !this.selectedCourseId) {
      this.toastService.showError('Please enter both title and URL');
      return;
    }

    const resourceData = {
      title: this.linkTitle,
      type: 'LINK',
      url: this.linkUrl,
      description: this.linkDescription,
      size: 0,
      order: this.courseResources.length
    };

    const headers = this.getAuthHeaders();
    this.http.post<any>(`${this.API_URL}/instructor/course/${this.selectedCourseId}/resources`, resourceData, { headers })
      .subscribe({
        next: (response) => {
          this.toastService.showSuccess('Link resource added successfully!');
          this.linkTitle = '';
          this.linkUrl = '';
          this.linkDescription = '';
          this.loadCourseResources();
        },
        error: (error) => {
          console.error('Error adding link resource:', error);
          this.toastService.showError('Failed to add link resource');
        }
      });
  }

  removeResource(index: number): void {
    if (confirm('Are you sure you want to remove this resource?')) {
      const headers = this.getAuthHeaders();
      this.http.delete<any>(`${this.API_URL}/instructor/course/${this.selectedCourseId}/resources/${index}`, { headers })
        .subscribe({
          next: (response) => {
            this.toastService.showSuccess('Resource removed successfully');
            this.loadCourseResources();
          },
          error: (error) => {
            console.error('Error removing resource:', error);
            this.toastService.showError('Failed to remove resource');
          }
        });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private clearForm(): void {
    this.selectedFile = null;
    this.resourceTitle = '';
    this.resourceDescription = '';
    this.resourceType = 'DOCUMENT';
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}

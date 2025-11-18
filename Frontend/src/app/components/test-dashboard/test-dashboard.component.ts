import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestService, ConnectionTest, TestResult } from '../../services/test.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-test-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-dashboard">
      <div class="test-header">
        <h1>🔧 SkillForge System Test Dashboard</h1>
        <p>Verify authentication, MongoDB connection, and demo credentials</p>
      </div>

      <div class="test-actions">
        <button (click)="runAllTests()" class="btn btn-primary" [disabled]="isLoading">
          {{ isLoading ? 'Running Tests...' : 'Run All Tests' }}
        </button>
        <button (click)="createDemoUsers()" class="btn btn-secondary" [disabled]="isLoading">
          Create Demo Users
        </button>
        <button (click)="clearResults()" class="btn btn-outline">
          Clear Results
        </button>
      </div>

      <div class="test-results" *ngIf="testResults">
        <!-- Backend Connection Test -->
        <div class="test-section">
          <h2>🔗 Backend Connection</h2>
          <div class="test-item" [ngClass]="getStatusClass(testResults.backend.status)">
            <div class="status-icon">{{ getStatusIcon(testResults.backend.status) }}</div>
            <div class="test-details">
              <h3>{{ testResults.backend.test }}</h3>
              <p>{{ testResults.backend.message }}</p>
            </div>
          </div>
        </div>

        <!-- MongoDB Connection Test -->
        <div class="test-section">
          <h2>🍃 MongoDB Connection</h2>
          <div class="test-item" [ngClass]="getStatusClass(testResults.mongodb.status)">
            <div class="status-icon">{{ getStatusIcon(testResults.mongodb.status) }}</div>
            <div class="test-details">
              <h3>{{ testResults.mongodb.test }}</h3>
              <p>{{ testResults.mongodb.message }}</p>
            </div>
          </div>
        </div>

        <!-- Demo Credentials Tests -->
        <div class="test-section">
          <h2>👥 Demo Credentials</h2>
          <div class="demo-credentials">
            <div *ngFor="let credTest of testResults.demoCredentials" 
                 class="test-item" [ngClass]="getStatusClass(credTest.status)">
              <div class="status-icon">{{ getStatusIcon(credTest.status) }}</div>
              <div class="test-details">
                <h3>{{ credTest.test }}</h3>
                <p>{{ credTest.message }}</p>
                <div *ngIf="credTest.data" class="test-data">
                  <small>Email: {{ credTest.data.email }}</small>
                </div>
              </div>
              <button *ngIf="credTest.status === 'PASS'" 
                      (click)="loginWithDemo(credTest.data)" 
                      class="btn btn-small">
                Test Login
              </button>
            </div>
          </div>
        </div>

        <!-- Demo User Creation Results -->
        <div class="test-section" *ngIf="demoUserResults && demoUserResults.length > 0">
          <h2>➕ Demo User Creation</h2>
          <div *ngFor="let result of demoUserResults" 
               class="test-item" [ngClass]="getStatusClass(result.status)">
            <div class="status-icon">{{ getStatusIcon(result.status) }}</div>
            <div class="test-details">
              <h3>{{ result.test }}</h3>
              <p>{{ result.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Demo Credentials Display -->
      <div class="demo-info">
        <h2>🎯 Demo Credentials for Testing</h2>
        <div class="credentials-grid">
          <div *ngFor="let cred of demoCredentials" class="credential-card">
            <h3>{{ cred.role }}</h3>
            <p><strong>Email:</strong> {{ cred.email }}</p>
            <p><strong>Password:</strong> {{ cred.password }}</p>
            <button (click)="copyCredentials(cred)" class="btn btn-outline btn-small">
              Copy Credentials
            </button>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="system-info" *ngIf="testResults">
        <h2>ℹ️ System Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Backend URL:</strong> {{ backendUrl }}
          </div>
          <div class="info-item">
            <strong>Test Status:</strong> 
            <span [ngClass]="getOverallStatusClass()">{{ getOverallStatus() }}</span>
          </div>
          <div class="info-item">
            <strong>Last Test Run:</strong> {{ lastTestRun | date:'medium' }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .test-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .test-header h1 {
      color: #333;
      margin-bottom: 10px;
    }

    .test-header p {
      color: #666;
      font-size: 1.1rem;
    }

    .test-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-bottom: 30px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-outline {
      background: transparent;
      border: 2px solid #667eea;
      color: #667eea;
    }

    .btn-small {
      padding: 8px 16px;
      font-size: 0.9rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .test-results {
      display: grid;
      gap: 20px;
    }

    .test-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .test-section h2 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 1.3rem;
    }

    .test-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 10px;
      transition: all 0.3s ease;
    }

    .test-item.pass {
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .test-item.fail {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .test-item.pending {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
    }

    .status-icon {
      font-size: 1.5rem;
      min-width: 30px;
      text-align: center;
    }

    .test-details {
      flex: 1;
    }

    .test-details h3 {
      margin: 0 0 5px 0;
      font-size: 1.1rem;
    }

    .test-details p {
      margin: 0;
      color: #666;
    }

    .test-data {
      margin-top: 8px;
    }

    .test-data small {
      color: #888;
      font-size: 0.85rem;
    }

    .demo-info, .system-info {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
    }

    .credentials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .credential-card {
      background: white;
      border-radius: 8px;
      padding: 15px;
      border: 1px solid #e9ecef;
    }

    .credential-card h3 {
      margin: 0 0 10px 0;
      color: #495057;
    }

    .credential-card p {
      margin: 5px 0;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .info-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .status-pass { color: #28a745; font-weight: bold; }
    .status-fail { color: #dc3545; font-weight: bold; }
    .status-pending { color: #ffc107; font-weight: bold; }

    @media (max-width: 768px) {
      .test-actions {
        flex-direction: column;
        align-items: center;
      }

      .credentials-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TestDashboardComponent implements OnInit {
  testResults: ConnectionTest | null = null;
  demoUserResults: TestResult[] = [];
  isLoading = false;
  lastTestRun: Date | null = null;
  backendUrl = 'http://localhost:8080/api';
  demoCredentials: any[] = [];

  constructor(
    private testService: TestService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.demoCredentials = this.testService.getDemoCredentials();
  }

  runAllTests(): void {
    this.isLoading = true;
    this.lastTestRun = new Date();
    
    this.testService.runAllTests().subscribe({
      next: (results) => {
        this.testResults = results;
        this.isLoading = false;
        
        const overallStatus = this.getOverallStatus();
        if (overallStatus === 'ALL TESTS PASSED') {
          this.toastService.showSuccess('All tests passed successfully! 🎉');
        } else {
          this.toastService.showWarning('Some tests failed. Check the results below.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.showError('Failed to run tests: ' + error.message);
      }
    });
  }

  createDemoUsers(): void {
    this.isLoading = true;
    
    this.testService.createDemoUsers().subscribe({
      next: (results) => {
        this.demoUserResults = results;
        this.isLoading = false;
        
        const successCount = results.filter(r => r.status === 'PASS').length;
        this.toastService.showInfo(`Demo user creation completed: ${successCount}/${results.length} successful`);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.showError('Failed to create demo users: ' + error.message);
      }
    });
  }

  loginWithDemo(credData: any): void {
    if (credData && credData.email) {
      const password = this.demoCredentials.find(c => c.email === credData.email)?.password;
      if (password) {
        this.authService.login({ email: credData.email, password }).subscribe({
          next: () => {
            this.toastService.showSuccess(`Successfully logged in as ${credData.role}`);
          },
          error: (error) => {
            this.toastService.showError(`Login failed: ${error.message}`);
          }
        });
      }
    }
  }

  copyCredentials(cred: any): void {
    const text = `Email: ${cred.email}\nPassword: ${cred.password}`;
    navigator.clipboard.writeText(text).then(() => {
      this.toastService.showSuccess(`${cred.role} credentials copied to clipboard`);
    }).catch(() => {
      this.toastService.showError('Failed to copy to clipboard');
    });
  }

  clearResults(): void {
    this.testResults = null;
    this.demoUserResults = [];
    this.lastTestRun = null;
    this.toastService.showInfo('Test results cleared');
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'PENDING': return '⏳';
      default: return '❓';
    }
  }

  getOverallStatus(): string {
    if (!this.testResults) return 'NOT TESTED';
    
    const allTests = [
      this.testResults.backend,
      this.testResults.mongodb,
      ...this.testResults.demoCredentials
    ];
    
    const passedTests = allTests.filter(t => t.status === 'PASS').length;
    const totalTests = allTests.length;
    
    if (passedTests === totalTests) return 'ALL TESTS PASSED';
    if (passedTests === 0) return 'ALL TESTS FAILED';
    return `${passedTests}/${totalTests} TESTS PASSED`;
  }

  getOverallStatusClass(): string {
    const status = this.getOverallStatus();
    if (status === 'ALL TESTS PASSED') return 'status-pass';
    if (status === 'ALL TESTS FAILED') return 'status-fail';
    return 'status-pending';
  }
}
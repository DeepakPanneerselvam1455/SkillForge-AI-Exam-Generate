import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-settings">
      <div class="page-header">
        <h2>System Settings</h2>
        <p>Configure platform settings and admin profile</p>
      </div>

      <div class="content-placeholder">
        <div class="placeholder-icon">⚙️</div>
        <h3>Admin Settings</h3>
        <p>System configuration and admin profile management.</p>
        <div class="feature-list">
          <ul>
            <li>👤 Update admin profile and password</li>
            <li>🔧 Platform configuration settings</li>
            <li>📧 Email notification preferences</li>
            <li>🔒 Security and authentication settings</li>
            <li>🎨 Platform branding and customization</li>
            <li>📊 System backup and maintenance</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-settings {
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
export class AdminSettingsComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="dashboard-container"><header class="dashboard-header"><div class="header-content"><h1>Analytics</h1><div class="user-info"><span>Welcome, {{ user?.name }}!</span><button (click)="logout()" class="logout-btn">Logout</button></div></div></header><nav class="dashboard-nav"><div class="nav-content"><a routerLink="/dashboard/admin" class="nav-item">📊 Overview</a><a routerLink="/dashboard/admin/users" class="nav-item">👥 User Management</a><a routerLink="/dashboard/admin/courses" class="nav-item">📚 Course Management</a><a routerLink="/dashboard/admin/analytics" routerLinkActive="active" class="nav-item">📈 Analytics</a><a routerLink="/dashboard/admin/settings" class="nav-item">⚙️ Settings</a></div></nav><main class="dashboard-main"><h2>Analytics Dashboard - Coming Soon</h2></main></div>`,
  styles: [`.dashboard-container{min-height:100vh;background:#f8f9fa}.dashboard-header{background:linear-gradient(135deg,#dc3545 0%,#fd7e14 100%);color:white;padding:20px 0}.header-content{max-width:1200px;margin:0 auto;padding:0 20px;display:flex;justify-content:space-between;align-items:center}.logout-btn{background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);padding:8px 16px;border-radius:6px;cursor:pointer}.dashboard-nav{background:white;border-bottom:1px solid #e1e5e9}.nav-content{max-width:1200px;margin:0 auto;padding:0 20px;display:flex}.nav-item{padding:15px 20px;text-decoration:none;color:#666;border-bottom:3px solid transparent}.nav-item.active{color:#dc3545;border-bottom-color:#dc3545;background:#f8f9fa}.dashboard-main{max-width:1200px;margin:0 auto;padding:30px 20px}`]
})
export class AdminAnalyticsComponent implements OnInit {
  user: User | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }
  
  logout() { 
    this.authService.logout(); 
  }
}

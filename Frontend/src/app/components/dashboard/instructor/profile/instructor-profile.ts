import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../../../services/auth.service';

@Component({
  selector: 'app-instructor-profile',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="dashboard-container"><header class="dashboard-header"><div class="header-content"><h1>My Profile</h1><div class="user-info"><span>Welcome, {{ user?.name }}!</span><button (click)="logout()" class="logout-btn">Logout</button></div></div></header><nav class="dashboard-nav"><div class="nav-content"><a routerLink="/dashboard/instructor" class="nav-item">📊 Overview</a><a routerLink="/dashboard/instructor/courses" class="nav-item">📚 My Courses</a><a routerLink="/dashboard/instructor/upload" class="nav-item">⬆️ Upload Content</a><a routerLink="/dashboard/instructor/students" class="nav-item">👥 Students</a><a routerLink="/dashboard/instructor/profile" routerLinkActive="active" class="nav-item">👤 Profile</a></div></nav><main class="dashboard-main"><h2>Instructor Profile - Coming Soon</h2></main></div>`,
  styles: [`.dashboard-container{min-height:100vh;background:#f8f9fa}.dashboard-header{background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:white;padding:20px 0}.header-content{max-width:1200px;margin:0 auto;padding:0 20px;display:flex;justify-content:space-between;align-items:center}.logout-btn{background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);padding:8px 16px;border-radius:6px;cursor:pointer}.dashboard-nav{background:white;border-bottom:1px solid #e1e5e9}.nav-content{max-width:1200px;margin:0 auto;padding:0 20px;display:flex}.nav-item{padding:15px 20px;text-decoration:none;color:#666;border-bottom:3px solid transparent}.nav-item.active{color:#28a745;border-bottom-color:#28a745;background:#f8f9fa}.dashboard-main{max-width:1200px;margin:0 auto;padding:30px 20px}`]
})
export class InstructorProfileComponent implements OnInit {
  user: User | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }
  
  logout() { 
    this.authService.logout(); 
  }
}

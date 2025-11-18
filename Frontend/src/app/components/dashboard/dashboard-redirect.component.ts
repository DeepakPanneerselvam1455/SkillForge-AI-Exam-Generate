import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: '<div>Redirecting...</div>'
})
export class DashboardRedirectComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirect based on user role to their default pages
    const role = (user.role || '').toString().toUpperCase();
    switch (role) {
      case 'STUDENT':
        this.router.navigate(['/dashboard/student/learning']);
        break;
      case 'INSTRUCTOR':
        this.router.navigate(['/dashboard/instructor/overview']);
        break;
      case 'ADMIN':
        this.router.navigate(['/dashboard/admin/overview']);
        break;
      default:
        console.warn('Unknown role:', user.role);
        this.router.navigate(['/login']);
        break;
    }
  }
}
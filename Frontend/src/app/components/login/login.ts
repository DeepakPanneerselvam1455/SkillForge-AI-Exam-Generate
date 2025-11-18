import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // Only redirect if already authenticated and currently on login page
    if (this.authService.isAuthenticated() && this.router.url === '/login') {
      const user = this.authService.getCurrentUser();
      if (user) {
        console.log('User already authenticated, redirecting to dashboard');
        this.redirectBasedOnRole(user.role);
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      console.log('Attempting login with:', loginRequest.email);
      
      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          console.log('Login success:', response);
          this.isLoading = false;
          // Navigation is handled in the auth service
        },
        error: (error) => {
          console.error('Login failed:', error);
          console.error('Error details:', error.error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  private redirectBasedOnRole(role: string): void {
    console.log('LoginComponent redirecting user with role:', role);
    switch (role.toUpperCase()) {
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
        console.warn('Unknown role:', role, '- redirecting to login');
        this.router.navigate(['/login']);
        break;
    }
  }

}
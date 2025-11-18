import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, ToastComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Allow viewing register even if authenticated (no auto-redirect)
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerRequest: RegisterRequest = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: this.registerForm.value.role
      };

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastService.showSuccess('Registration successful! Please log in.');
          // Navigation is handled in the auth service
        },
        error: (error) => {
          this.isLoading = false;
          const errorMsg = error.error?.message || 'Registration failed. Please try again.';
          this.errorMessage = errorMsg;
          this.toastService.showError(errorMsg);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  private redirectBasedOnRole(role: string): void {
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
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  // Custom validator for password match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  // Helper method to check if passwords match
  get passwordMismatch(): boolean {
    return this.registerForm?.errors?.['passwordMismatch'] &&
           this.registerForm?.get('confirmPassword')?.touched;
  }
}

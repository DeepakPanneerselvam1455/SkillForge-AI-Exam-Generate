import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styles: ``,
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  submit() {
    if (!this.username || !this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => {
        const role = this.auth.getRole();
        if (role === 'ADMIN') this.router.navigateByUrl('/dashboard/admin');
        else if (role === 'INSTRUCTOR') this.router.navigateByUrl('/dashboard/instructor');
        else this.router.navigateByUrl('/dashboard/student');
      },
      error: () => {
        this.error = 'Registration failed';
        this.loading = false;
      }
    });
  }
}

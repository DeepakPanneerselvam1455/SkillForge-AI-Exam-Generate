import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error = '';

  submit() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        const role = this.auth.getRole();
        if (role === 'ADMIN') this.router.navigateByUrl('/dashboard/admin');
        else if (role === 'INSTRUCTOR') this.router.navigateByUrl('/dashboard/instructor');
        else this.router.navigateByUrl('/dashboard/student');
      },
      error: (e) => {
        this.error = 'Login failed';
        this.loading = false;
      }
    });
  }
}

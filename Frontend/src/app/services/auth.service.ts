import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { MockAuthService } from './mock-auth.service';
import { ToastService } from './toast.service';
import { ConfigService } from './config.service';
import { API_CONFIG } from '../constants/api.constants';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  role: string;
  message: string;
  userId: string;
  name: string;
  redirectUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = API_CONFIG.BASE_URL;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isMockMode = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private mockAuthService: MockAuthService,
    private toastService: ToastService,
    private configService: ConfigService
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('AuthService: Attempting login for:', credentials.email);
    console.log('AuthService: API URL:', `${this.API_URL}/auth/login`);

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response: any) => {
          // Support multiple backend response shapes
          const token = response?.token || response?.accessToken || response?.jwt || response?.id_token;
          const role = response?.role || response?.user?.role || (Array.isArray(response?.roles) ? response.roles[0] : undefined);
          const userId = response?.userId || response?.user?.id || response?.id;
          const name = response?.name || response?.user?.name || response?.username || '';
          const redirectUrl = response?.redirectUrl;

          if (token) {
            const normalizedResponse: AuthResponse = {
              token,
              role: (role || '').toString(),
              userId: (userId || '').toString(),
              name: name?.toString() || '',
              message: response?.message || 'Login successful',
              redirectUrl
            };
            this.handleSuccessfulAuth(normalizedResponse, credentials.email);
          } else {
            console.warn('AuthService: No token found in login response');
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(() => {
          this.router.navigate(['/login']);
        })
      );
  }

  logout(): void {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isMockMode = false;

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return (user?.role || '').toUpperCase() === role.toUpperCase();
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isInstructor(): boolean {
    return this.hasRole('INSTRUCTOR');
  }

  isStudent(): boolean {
    return this.hasRole('STUDENT');
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      // Check if token is still valid
      if (!this.isTokenExpired(token)) {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } else {
        // Token is expired, clear everything
        this.logout();
      }
    }
  }

  private redirectBasedOnRole(role: string, customRedirectUrl?: string): void {
    console.log('Redirecting user with role:', role, 'redirectUrl:', customRedirectUrl);

    // If a custom redirect URL is provided, use it
    if (customRedirectUrl) {
      this.router.navigate([customRedirectUrl]);
      return;
    }

    // Otherwise use default role-based redirects
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

  /**
   * Handle successful authentication (shared between real and mock)
   */
  private handleSuccessfulAuth(response: AuthResponse, email: string): void {
    // Normalize role to uppercase for consistent routing/guards
    const normalizedRole = (response.role || '').toString().toUpperCase();

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify({
      id: response.userId,
      name: response.name,
      email: email,
      role: normalizedRole
    }));
    this.currentUserSubject.next({
      id: response.userId,
      name: response.name,
      email: email,
      role: normalizedRole
    });
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      this.redirectBasedOnRole(normalizedRole, response.redirectUrl);
    }, 100);
  }

  /**
   * Check if currently using mock mode
   */
  isUsingMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Force enable mock mode (for testing)
   */
  enableMockMode(): void {
    this.isMockMode = true;
    this.toastService.showInfo('Mock mode enabled');
  }

  /**
   * Force disable mock mode (for testing)
   */
  disableMockMode(): void {
    this.isMockMode = false;
    this.toastService.showInfo('Mock mode disabled');
  }

  /**
   * Test backend connectivity
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.API_URL}/health`).pipe(
      catchError(error => {
        console.log('Backend connection test failed:', error);
        throw error;
      })
    );
  }

  /**
   * Check if JWT token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        // Not a JWT; assume backend will validate token server-side
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      if (!payload?.exp) {
        // No exp claim; treat as non-expiring on client
        return false;
      }
      const exp = Number(payload.exp) * 1000;
      if (Number.isNaN(exp)) {
        return false;
      }
      return Date.now() > exp;
    } catch {
      // If we can't parse the token, do not block the user on the client
      return false;
    }
  }

  /**
   * Clear all storage for testing purposes
   */
  clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isMockMode = false;
  }
}

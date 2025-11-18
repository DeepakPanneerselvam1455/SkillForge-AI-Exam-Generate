import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse, User } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private mockUsers: any[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@skillforge.com',
      password: 'Admin@123',
      role: 'ADMIN'
    },
    {
      id: '2',
      name: 'Instructor User',
      email: 'instructor@skillforge.com',
      password: 'Instr@123',
      role: 'INSTRUCTOR'
    },
    {
      id: '3',
      name: 'Student User',
      email: 'student@skillforge.com',
      password: 'Stud@123',
      role: 'STUDENT'
    }
  ];

  private generateToken(user: any): string {
    return 'mock_token_' + user.id + '_' + Date.now();
  }

  /**
   * Mock login that simulates backend authentication
   */
  mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      // Simulate network delay
      setTimeout(() => {
        const user = this.mockUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          const response: AuthResponse = {
            token: this.generateToken(user),
            role: user.role,
            message: 'Login successful',
            userId: user.id,
            name: user.name
          };
          observer.next(response);
          observer.complete();
        } else {
          observer.error({
            error: { 
              message: 'Invalid email or password',
              status: 401 
            }
          });
        }
      }, 1000); // 1 second delay to simulate API call
    });
  }

  /**
   * Mock registration that simulates backend user creation
   */
  mockRegister(userData: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          observer.error({
            error: {
              message: 'Email already registered',
              status: 400
            }
          });
          return;
        }

        // Create new user
        const newUser = {
          id: (this.mockUsers.length + 1).toString(),
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role
        };

        this.mockUsers.push(newUser);

        const response: AuthResponse = {
          token: this.generateToken(newUser),
          role: newUser.role,
          message: 'Registration successful',
          userId: newUser.id,
          name: newUser.name
        };

        observer.next(response);
        observer.complete();
      }, 1500);
    });
  }

  /**
   * Test backend connectivity (always fails in mock mode)
   */
  testBackendConnection(): Observable<any> {
    return throwError({
      message: 'Backend not available - using mock service',
      status: 0
    }).pipe(delay(1000));
  }

  /**
   * Test MongoDB connectivity (always fails in mock mode)
   */
  testMongoDBConnection(): Observable<any> {
    return throwError({
      message: 'MongoDB not available - using mock service',
      status: 0
    }).pipe(delay(1000));
  }

  /**
   * Get all mock users (for testing purposes)
   */
  getMockUsers(): any[] {
    return this.mockUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
      // Don't expose password
    }));
  }

  /**
   * Check if we're in mock mode (always true for this service)
   */
  isMockMode(): boolean {
    return true;
  }

  /**
   * Reset mock users to default state
   */
  resetMockUsers(): void {
    this.mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@skillforge.com',
        password: 'Admin@123',
        role: 'ADMIN'
      },
      {
        id: '2',
        name: 'Instructor User',
        email: 'instructor@skillforge.com',
        password: 'Instr@123',
        role: 'INSTRUCTOR'
      },
      {
        id: '3',
        name: 'Student User',
        email: 'student@skillforge.com',
        password: 'Stud@123',
        role: 'STUDENT'
      }
    ];
  }
}
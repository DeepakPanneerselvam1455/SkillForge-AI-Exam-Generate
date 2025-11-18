import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  message: string;
  data?: any;
}

export interface ConnectionTest {
  mongodb: TestResult;
  backend: TestResult;
  demoCredentials: TestResult[];
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly API_URL = 'http://localhost:8080/api';
  
  // Demo test credentials
  private demoCredentials = [
    { email: 'admin@skillforge.com', password: 'Admin@123', role: 'ADMIN', name: 'Admin User' },
    { email: 'instructor@skillforge.com', password: 'Instr@123', role: 'INSTRUCTOR', name: 'Instructor User' },
    { email: 'student@skillforge.com', password: 'Stud@123', role: 'STUDENT', name: 'Student User' }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Test backend connectivity
   */
  testBackendConnection(): Observable<TestResult> {
    return this.http.get(`${this.API_URL}/health`).pipe(
      map(response => ({
        test: 'Backend Connection',
        status: 'PASS' as const,
        message: 'Backend server is responding',
        data: response
      })),
      catchError(error => of({
        test: 'Backend Connection',
        status: 'FAIL' as const,
        message: `Backend connection failed: ${error.message}`,
        data: error
      }))
    );
  }

  /**
   * Test MongoDB connection via backend
   */
  testMongoDBConnection(): Observable<TestResult> {
    return this.http.get(`${this.API_URL}/test/mongodb`).pipe(
      map(response => ({
        test: 'MongoDB Connection',
        status: 'PASS' as const,
        message: 'MongoDB is connected and accessible',
        data: response
      })),
      catchError(error => of({
        test: 'MongoDB Connection',
        status: 'FAIL' as const,
        message: `MongoDB connection failed: ${error.message}`,
        data: error
      }))
    );
  }

  /**
   * Test demo user credentials
   */
  testDemoCredentials(): Observable<TestResult[]> {
    const tests = this.demoCredentials.map(cred => 
      this.http.post(`${this.API_URL}/auth/login`, {
        email: cred.email,
        password: cred.password
      }).pipe(
        map(response => ({
          test: `Demo ${cred.role} Login`,
          status: 'PASS' as const,
          message: `${cred.role} demo credentials work`,
          data: { email: cred.email, role: cred.role }
        })),
        catchError(error => of({
          test: `Demo ${cred.role} Login`,
          status: 'FAIL' as const,
          message: `${cred.role} demo login failed: ${error.message}`,
          data: { email: cred.email, role: cred.role, error: error.message }
        }))
      )
    );

    // Return all test results as a single observable array
    return new Observable(observer => {
      const results: TestResult[] = [];
      let completed = 0;

      tests.forEach((test, index) => {
        test.subscribe({
          next: result => {
            results[index] = result;
            completed++;
            if (completed === tests.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: error => {
            results[index] = {
              test: `Demo ${this.demoCredentials[index].role} Login`,
              status: 'FAIL',
              message: `Test failed: ${error.message}`,
              data: { error }
            };
            completed++;
            if (completed === tests.length) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Test user registration flow
   */
  testRegistration(testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123',
    role: 'STUDENT'
  }): Observable<TestResult> {
    return this.http.post(`${this.API_URL}/auth/register`, testUser).pipe(
      map(response => ({
        test: 'User Registration',
        status: 'PASS' as const,
        message: 'User registration successful',
        data: response
      })),
      catchError(error => of({
        test: 'User Registration',
        status: 'FAIL' as const,
        message: `Registration failed: ${error.error?.message || error.message}`,
        data: error
      }))
    );
  }

  /**
   * Run all authentication tests
   */
  runAllTests(): Observable<ConnectionTest> {
    return new Observable(observer => {
      const results: ConnectionTest = {
        mongodb: { test: 'MongoDB Connection', status: 'PENDING', message: 'Testing...' },
        backend: { test: 'Backend Connection', status: 'PENDING', message: 'Testing...' },
        demoCredentials: []
      };

      let testsCompleted = 0;
      const totalTests = 3;

      // Test backend connection
      this.testBackendConnection().subscribe(result => {
        results.backend = result;
        testsCompleted++;
        if (testsCompleted === totalTests) {
          observer.next(results);
          observer.complete();
        }
      });

      // Test MongoDB connection
      this.testMongoDBConnection().subscribe(result => {
        results.mongodb = result;
        testsCompleted++;
        if (testsCompleted === totalTests) {
          observer.next(results);
          observer.complete();
        }
      });

      // Test demo credentials
      this.testDemoCredentials().subscribe(credResults => {
        results.demoCredentials = credResults;
        testsCompleted++;
        if (testsCompleted === totalTests) {
          observer.next(results);
          observer.complete();
        }
      });
    });
  }

  /**
   * Create demo users if they don't exist
   */
  createDemoUsers(): Observable<TestResult[]> {
    const createUserTests = this.demoCredentials.map(cred =>
      this.http.post(`${this.API_URL}/auth/register`, cred).pipe(
        map(response => ({
          test: `Create Demo ${cred.role}`,
          status: 'PASS' as const,
          message: `Demo ${cred.role} user created successfully`,
          data: response
        })),
        catchError(error => {
          if (error.error?.message?.includes('already registered')) {
            return of({
              test: `Create Demo ${cred.role}`,
              status: 'PASS' as const,
              message: `Demo ${cred.role} user already exists`,
              data: { email: cred.email, role: cred.role }
            });
          }
          return of({
            test: `Create Demo ${cred.role}`,
            status: 'FAIL' as const,
            message: `Failed to create demo ${cred.role}: ${error.error?.message || error.message}`,
            data: error
          });
        })
      )
    );

    return new Observable(observer => {
      const results: TestResult[] = [];
      let completed = 0;

      createUserTests.forEach((test, index) => {
        test.subscribe({
          next: result => {
            results[index] = result;
            completed++;
            if (completed === createUserTests.length) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  /**
   * Get demo credentials for UI display
   */
  getDemoCredentials() {
    return this.demoCredentials.map(cred => ({
      role: cred.role,
      email: cred.email,
      password: cred.password,
      name: cred.name
    }));
  }
}
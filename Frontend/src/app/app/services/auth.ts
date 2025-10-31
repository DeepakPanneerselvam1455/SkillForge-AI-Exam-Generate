import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import jwtDecode from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private http = inject(HttpClient);

  private readonly tokenKey = 'sf_token';
  private readonly usernameKey = 'sf_username';
  private readonly roleKey = 'sf_role';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  login(payload: { username: string; password: string }): Observable<void> {
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/login`, payload).pipe(
      tap((res) => this.persistAuth(res)),
      map(() => void 0)
    );
  }

  register(payload: { username: string; email: string; password: string }): Observable<void> {
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/register`, payload).pipe(
      tap((res) => this.persistAuth(res)),
      map(() => void 0)
    );
  }

  refresh(token: string): Observable<void> {
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken: token }).pipe(
      tap((res) => this.persistAuth(res)),
      map(() => void 0)
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.usernameKey);
    localStorage.removeItem(this.roleKey);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  private persistAuth(res: any): void {
    const token = res?.token || res?.accessToken;
    const username = res?.username || res?.user?.username;
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      try {
        const decoded: any = jwtDecode(token);
        const role = decoded?.role || decoded?.roles?.[0] || decoded?.authorities?.[0]?.authority;
        if (role) localStorage.setItem(this.roleKey, role);
      } catch {}
      if (username) localStorage.setItem(this.usernameKey, username);
      this.isAuthenticatedSubject.next(true);
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}

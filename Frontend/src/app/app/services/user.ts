import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class User {
  private http = inject(HttpClient);

  me(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/users/me`);
  }

  updateProfile(payload: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/me`, payload);
  }

  listUsers(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/users`);
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/users/${userId}/role`, { role });
  }
}

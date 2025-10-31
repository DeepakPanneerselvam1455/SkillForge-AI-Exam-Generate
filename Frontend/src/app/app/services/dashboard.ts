import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Dashboard {
  private http = inject(HttpClient);

  getStudentSummary(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/dashboard/student`);
  }

  getInstructorSummary(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/dashboard/instructor`);
  }

  getAdminSummary(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/dashboard/admin`);
  }
}

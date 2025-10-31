import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Course {
  private http = inject(HttpClient);

  list(params?: any): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/courses`, { params });
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/courses/${id}`);
  }

  create(payload: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/courses`, payload);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/courses/${id}`, payload);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/courses/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Ai {
  private http = inject(HttpClient);

  analyzeText(prompt: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/ai/analyze`, { prompt });
  }

  analyzeFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiBaseUrl}/ai/upload`, formData);
  }
}

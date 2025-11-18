import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  difficulty: string;
  category: string;
  enrollmentDate: string;
  thumbnail: string;
}

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-courses.html',
  styleUrls: ['./student-courses.css']
})
export class StudentCoursesComponent implements OnInit {
  courses: Course[] = [];
  isLoading = true;
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (!this.authService.isAuthenticated() || !this.authService.isStudent()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCourses();
  }

  loadCourses(): void {
    const token = this.authService.getToken();
    if (!token) return;

    // Mock data for now - replace with actual API call
    setTimeout(() => {
      this.courses = [
        {
          id: '1',
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming language',
          instructor: 'Dr. Sarah Wilson',
          progress: 75,
          totalLessons: 12,
          completedLessons: 9,
          difficulty: 'Beginner',
          category: 'Programming',
          enrollmentDate: '2024-01-15',
          thumbnail: '🟨'
        },
        {
          id: '2',
          title: 'React Development',
          description: 'Build modern web applications with React',
          instructor: 'Prof. John Smith',
          progress: 45,
          totalLessons: 16,
          completedLessons: 7,
          difficulty: 'Intermediate',
          category: 'Web Development',
          enrollmentDate: '2024-02-01',
          thumbnail: '⚛️'
        },
        {
          id: '3',
          title: 'Database Design',
          description: 'Learn database design principles and SQL',
          instructor: 'Dr. Mike Johnson',
          progress: 20,
          totalLessons: 10,
          completedLessons: 2,
          difficulty: 'Intermediate',
          category: 'Database',
          enrollmentDate: '2024-02-15',
          thumbnail: '🗃️'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  continueCourse(courseId: string): void {
    console.log('Continue course:', courseId);
    // Navigate to course content
  }

  viewCourseDetails(courseId: string): void {
    console.log('View course details:', courseId);
    // Navigate to course details
  }

  logout(): void {
    this.authService.logout();
  }
}
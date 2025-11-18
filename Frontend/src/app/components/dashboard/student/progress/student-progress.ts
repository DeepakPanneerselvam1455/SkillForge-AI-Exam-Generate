import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

interface ProgressData {
  overallProgress: number;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  studyStreak: number;
  totalStudyHours: number;
  achievements: Achievement[];
  recentActivity: Activity[];
  courseProgress: CourseProgress[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dateEarned: string;
  category: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  icon: string;
  course?: string;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  category: string;
}

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-progress.html',
  styleUrls: ['./student-progress.css']
})
export class StudentProgressComponent implements OnInit {
  progressData: ProgressData | null = null;
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
    this.loadProgressData();
  }

  loadProgressData(): void {
    const token = this.authService.getToken();
    if (!token) return;

    // Mock data for now - replace with actual API call
    setTimeout(() => {
      this.progressData = {
        overallProgress: 68,
        totalCourses: 5,
        completedCourses: 2,
        inProgressCourses: 3,
        totalQuizzes: 15,
        completedQuizzes: 12,
        averageScore: 87,
        studyStreak: 7,
        totalStudyHours: 42,
        achievements: [
          {
            id: '1',
            title: 'First Course Complete',
            description: 'Completed your first course successfully',
            icon: '🎓',
            dateEarned: '2024-01-20',
            category: 'milestone'
          },
          {
            id: '2',
            title: 'Quiz Master',
            description: 'Scored 90% or higher on 5 quizzes',
            icon: '🏆',
            dateEarned: '2024-02-01',
            category: 'performance'
          },
          {
            id: '3',
            title: 'Week Warrior',
            description: 'Maintained a 7-day study streak',
            icon: '🔥',
            dateEarned: '2024-02-10',
            category: 'streak'
          }
        ],
        recentActivity: [
          {
            id: '1',
            type: 'lesson_completed',
            title: 'Completed "Advanced JavaScript Functions"',
            timestamp: '2024-02-15T10:30:00Z',
            icon: '✅',
            course: 'JavaScript Fundamentals'
          },
          {
            id: '2',
            type: 'quiz_completed',
            title: 'Scored 95% on React Basics Quiz',
            timestamp: '2024-02-14T16:45:00Z',
            icon: '📝',
            course: 'React Development'
          },
          {
            id: '3',
            type: 'course_enrolled',
            title: 'Enrolled in "Database Design"',
            timestamp: '2024-02-13T09:15:00Z',
            icon: '📚',
            course: 'Database Design'
          }
        ],
        courseProgress: [
          {
            courseId: '1',
            courseName: 'JavaScript Fundamentals',
            progress: 75,
            totalLessons: 12,
            completedLessons: 9,
            lastAccessed: '2024-02-15',
            category: 'Programming'
          },
          {
            courseId: '2',
            courseName: 'React Development',
            progress: 45,
            totalLessons: 16,
            completedLessons: 7,
            lastAccessed: '2024-02-14',
            category: 'Web Development'
          },
          {
            courseId: '3',
            courseName: 'Database Design',
            progress: 20,
            totalLessons: 10,
            completedLessons: 2,
            lastAccessed: '2024-02-13',
            category: 'Database'
          }
        ]
      };
      this.isLoading = false;
    }, 1000);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    
    return this.formatDate(timestamp);
  }

  logout(): void {
    this.authService.logout();
  }
}
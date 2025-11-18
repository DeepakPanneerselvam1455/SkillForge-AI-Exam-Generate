import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent) },
  { path: 'test', loadComponent: () => import('./components/test-dashboard/test-dashboard.component').then(m => m.TestDashboardComponent) },

  // Dashboard routes (protected)
  { path: 'dashboard', canActivate: [AuthGuard], loadComponent: () => import('./components/dashboard/dashboard-redirect.component').then(m => m.DashboardRedirectComponent) },

  // Admin Dashboard Routes (nested)
  { path: 'dashboard/admin', canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'ADMIN' }, loadComponent: () => import('./components/dashboard/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./components/dashboard/admin/overview/admin-overview.component').then(m => m.AdminOverviewComponent) },
      { path: 'users', loadComponent: () => import('./components/dashboard/admin/users/user-management.component').then(m => m.UserManagementComponent) },
      { path: 'courses', loadComponent: () => import('./components/dashboard/admin/courses/course-management.component').then(m => m.CourseManagementComponent) },
      { path: 'analytics', loadComponent: () => import('./components/dashboard/admin/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'settings', loadComponent: () => import('./components/dashboard/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) }
    ]
  },

  // Instructor Dashboard Routes (nested)
  { path: 'dashboard/instructor', canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'INSTRUCTOR' }, loadComponent: () => import('./components/dashboard/instructor/instructor-dashboard.component').then(m => m.InstructorDashboardComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./components/dashboard/instructor/overview/instructor-overview.component').then(m => m.InstructorOverviewComponent) },
      { path: 'courses', loadComponent: () => import('./components/dashboard/instructor/courses/my-courses.component').then(m => m.MyCoursesComponent) },
      { path: 'upload', loadComponent: () => import('./components/dashboard/instructor/upload/upload-content.component').then(m => m.UploadContentComponent) },
      { path: 'students', loadComponent: () => import('./components/dashboard/instructor/students/instructor-students.component').then(m => m.InstructorStudentsComponent) },
      { path: 'profile', loadComponent: () => import('./components/dashboard/instructor/profile/instructor-profile.component').then(m => m.InstructorProfileComponent) }
    ]
  },

  // Student Dashboard Routes (nested)
  { path: 'dashboard/student', canActivate: [AuthGuard, RoleGuard], data: { expectedRole: 'STUDENT' }, loadComponent: () => import('./components/dashboard/student/student-dashboard.component').then(m => m.StudentDashboardComponent),
    children: [
      { path: '', redirectTo: 'learning', pathMatch: 'full' },
      { path: 'learning', loadComponent: () => import('./components/dashboard/student/learning/learning-modules.component').then(m => m.LearningModulesComponent) },
      { path: 'courses', loadComponent: () => import('./components/dashboard/student/courses/student-courses.component').then(m => m.StudentCoursesComponent) },
      { path: 'progress', loadComponent: () => import('./components/dashboard/student/progress/progress.component').then(m => m.ProgressComponent) },
      { path: 'profile', loadComponent: () => import('./components/dashboard/student/profile/student-profile.component').then(m => m.StudentProfileComponent) }
    ]
  },

  // Fallback route
  { path: '**', redirectTo: '/login' }
];

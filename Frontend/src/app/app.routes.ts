import { Routes } from '@angular/router';
import { authGuard } from './app/guards/auth-guard';
import { roleGuard } from './app/guards/role-guard';
import { Login } from './app/pages/auth/login/login';
import { Register } from './app/pages/auth/register/register';
import { Student } from './app/pages/dashboard/student/student';
import { Instructor } from './app/pages/dashboard/instructor/instructor';
import { Admin } from './app/pages/dashboard/admin/admin';
import { AiAssistant } from './app/pages/ai-assistant/ai-assistant';
import { Profile } from './app/pages/profile/profile';
import { Users } from './app/pages/admin/users/users';
import { CourseList } from './app/pages/courses/course-list/course-list';
import { CourseDetail } from './app/pages/courses/course-detail/course-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'dashboard/student', component: Student, canActivate: [authGuard, roleGuard], data: { roles: ['STUDENT'] } },
  { path: 'dashboard/instructor', component: Instructor, canActivate: [authGuard, roleGuard], data: { roles: ['INSTRUCTOR'] } },
  { path: 'dashboard/admin', component: Admin, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },

  { path: 'ai-assistant', component: AiAssistant, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },

  { path: 'admin/users', component: Users, canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] } },

  { path: 'courses', component: CourseList, canActivate: [authGuard] },
  { path: 'courses/:id', component: CourseDetail, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }
];

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VALIDATE: '/auth/validate'
    },
    
    // User endpoints
    USERS: {
      BASE: '/users',
      BY_ID: (id: string) => `/users/${id}`,
      BY_ROLE: (role: string) => `/users/role/${role}`,
      SEARCH: '/users/search'
    },
    
    // Course endpoints
    COURSES: {
      BASE: '/courses',
      BY_ID: (id: string) => `/courses/${id}`,
      BY_INSTRUCTOR: (instructorId: string) => `/courses/instructor/${instructorId}`,
      BY_STUDENT: (studentId: string) => `/student/${studentId}/courses`,
      ENROLL: (courseId: string) => `/student/enroll/${courseId}`,
      UNENROLL: (courseId: string) => `/student/unenroll/${courseId}`,
      APPROVE: (id: string) => `/courses/${id}/approve`,
      STUDENTS: (courseId: string) => `/courses/${courseId}/students`
    },
    
    // Analytics endpoints
    ANALYTICS: {
      ADMIN_STATS: '/analytics/admin',
      INSTRUCTOR_STATS: (instructorId: string) => `/analytics/instructor/${instructorId}`,
      STUDENT_STATS: (studentId: string) => `/analytics/student/${studentId}`,
      PLATFORM_USAGE: '/analytics/platform-usage'
    },
    
    // Dashboard endpoints
    DASHBOARD: {
      ADMIN: '/dashboard/admin',
      INSTRUCTOR: '/dashboard/instructor',
      STUDENT: '/dashboard/student'
    }
  }
};

export const ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR', 
  STUDENT: 'STUDENT'
} as const;

export const THEME_COLORS = {
  ADMIN: '#ff6b35',
  INSTRUCTOR: '#28a745', 
  STUDENT: '#6f42c1'
} as const;
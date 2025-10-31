import { User, Course, Quiz, Question, QuizAttempt, QuizAssignment, CourseMaterial } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { logActivity } from './activityLog';

// --- MOCK DATABASE (LocalStorage) ---
const DB = {
    users: 'skillforge_users',
    courses: 'skillforge_courses',
    quizzes: 'skillforge_quizzes',
    attempts: 'skillforge_attempts',
    assignments: 'skillforge_assignments',
    viewedMaterials: 'skillforge_viewed_materials',
};

const FAKE_DELAY = 500;

// Helper to simulate network delay
const delay = <T,>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), FAKE_DELAY));

// --- GEMINI API SETUP ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- DATA INITIALIZATION ---
export const initMockData = () => {
    if (localStorage.getItem(DB.users)) return;

    const now = new Date().toISOString();
    const adminId = 'user-admin-01';
    const mentorId = 'user-mentor-01'; // Keep as mentorId internally
    const studentId = 'user-student-01';
    
    const users: User[] = [
        { id: adminId, email: 'admin@skillforge.com', name: 'System Administrator', role: 'admin', createdAt: now },
        { id: mentorId, email: 'instructor@skillforge.com', name: 'Instructor Smith', role: 'mentor', createdAt: now },
        { id: studentId, email: 'student@skillforge.com', name: 'Demo Student', role: 'student', createdAt: now },
    ];

    const courseId1 = 'course-js-01';
    const courseId2 = 'course-react-02';
    const courses: Course[] = [
        { 
            id: courseId1, 
            title: 'JavaScript Fundamentals', 
            description: 'Master the basics of JavaScript.', 
            difficulty: 'Beginner', 
            mentorId, 
            instructorName: 'Instructor Smith',
            institutionName: 'SkillForge Academy',
            publishDate: now.split('T')[0],
            courseType: 'Youtube',
            language: 'English',
            topics: ['Variables', 'Functions', 'Arrays', 'Objects'], 
            materials: [
                { id: 'mat-js-1', type: 'video', title: 'JavaScript Crash Course', url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c' },
                { id: 'mat-js-2', type: 'pdf', title: 'MDN JavaScript Guide (PDF)', url: 'mock-mdn-guide.pdf' },
            ], 
            createdAt: now 
        },
        { 
            id: courseId2, 
            title: 'React Advanced Patterns', 
            description: 'Learn advanced patterns for building scalable React apps.', 
            difficulty: 'Advanced', 
            mentorId, 
            instructorName: 'Instructor Smith',
            institutionName: 'SkillForge Academy',
            publishDate: now.split('T')[0],
            courseType: 'Youtube',
            language: 'English',
            topics: ['Hooks', 'Context API', 'Performance', 'Render Props'], 
            materials: [], 
            createdAt: now 
        },
    ];

    const quizId1 = 'quiz-js-vars-01';
    const quizzes: Quiz[] = [
        {
            id: quizId1,
            courseId: courseId1,
            title: 'JavaScript Variables Quiz',
            difficulty: 'Beginner',
            createdBy: mentorId,
            createdAt: now,
            questions: [
                { id: 'q1', type: 'multiple-choice', question: 'Which keyword is used to declare a variable that cannot be reassigned?', options: ['let', 'var', 'const', 'static'], correctAnswer: 'const', points: 10 },
                { id: 'q2', type: 'short-answer', question: 'What is the data type of `null` in JavaScript?', correctAnswer: 'object', points: 10 },
            ],
        },
    ];
    
    const assignments: QuizAssignment[] = [
        { id: 'assign-initial-01', quizId: quizId1, studentId: studentId, assignedAt: now }
    ];

    localStorage.setItem(DB.users, JSON.stringify(users));
    localStorage.setItem(DB.courses, JSON.stringify(courses));
    localStorage.setItem(DB.quizzes, JSON.stringify(quizzes));
    localStorage.setItem(DB.attempts, JSON.stringify([]));
    localStorage.setItem(DB.assignments, JSON.stringify(assignments));
    localStorage.setItem(DB.viewedMaterials, JSON.stringify({})); // Changed to object for student-specific tracking


    // Mock passwords (in a real app, this would be hashed and stored securely)
    localStorage.setItem('user_passwords', JSON.stringify({
        'admin@skillforge.com': 'admin123',
        'instructor@skillforge.com': 'instructor123',
        'student@skillforge.com': 'student123',
    }));
};

// --- AUTHENTICATION ---
export const login = async (email: string, pass: string) => {
    const passwords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
    if (passwords[email] !== pass) {
        await delay(null);
        throw new Error('Invalid credentials');
    }
    const users: User[] = JSON.parse(localStorage.getItem(DB.users) || '[]');
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('User not found');

    logActivity('user_login', `${user.name} signed in.`, { userId: user.id, role: user.role });

    // "JWT" is the user object itself for this mock API
    const token = btoa(JSON.stringify(user));
    return delay({ token, user });
};

export const register = async (userData: Omit<User, 'id' | 'createdAt'>, pass: string) => {
    // Reusing createUser logic for public registration
    return createUser(userData, pass);
};

export const getProfile = async (): Promise<User> => {
    const token = localStorage.getItem('skillforge_token');
    if (!token) throw new Error('Not authenticated');
    try {
        const user: User = JSON.parse(atob(token));
        return delay(user);
    } catch (e) {
        throw new Error('Invalid token');
    }
};

// --- GENERIC CRUD ---
const getAll = async <T,>(key: string): Promise<T[]> => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return delay(data as T[]);
};
const getById = async <T extends { id: string },>(key: string, id: string): Promise<T | null> => {
    const items = await getAll<T>(key);
    return delay(items.find(item => item.id === id) || null);
};
const create = async <T extends { id: string },>(key: string, item: T): Promise<T> => {
    const items = await getAll<T>(key);
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
    return delay(item);
};
const update = async <T extends { id: string },>(key: string, updatedItem: T): Promise<T> => {
    let items = await getAll<T>(key);
    items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    localStorage.setItem(key, JSON.stringify(items));
    return delay(updatedItem);
};
const remove = async <T extends { id: string },>(key: string, id: string): Promise<null> => {
    let items = await getAll<T>(key);
    items = items.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
    return delay(null);
}

// --- Progress Tracking (Student Specific) ---
export const getAllViewedMaterials = async (): Promise<{ [studentId: string]: string[] }> => {
    const data = JSON.parse(localStorage.getItem(DB.viewedMaterials) || '{}');
    return delay(data);
};

export const getViewedMaterialsForStudent = async (studentId: string): Promise<string[]> => {
    const allViewed = await getAllViewedMaterials();
    return delay(allViewed[studentId] || []);
};

export const markMaterialAsViewed = async (studentId: string, materialId: string): Promise<void> => {
    const allViewed = await getAllViewedMaterials();
    const studentViewed = allViewed[studentId] || [];
    if (!studentViewed.includes(materialId)) {
        allViewed[studentId] = [...studentViewed, materialId];
        localStorage.setItem(DB.viewedMaterials, JSON.stringify(allViewed));
    }
    return delay(undefined);
};

// --- DOMAIN-SPECIFIC API ---

// Users
export const getUsers = () => getAll<User>(DB.users);

export const createUser = async (userData: Omit<User, 'id' | 'createdAt'>, pass: string) => {
    const users = await getAll<User>(DB.users);
    if (users.some(u => u.email === userData.email)) {
        throw new Error('User with this email already exists.');
    }

    const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };

    await create<User>(DB.users, newUser);

    const passwords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
    passwords[newUser.email] = pass;
    localStorage.setItem('user_passwords', JSON.stringify(passwords));

    logActivity('user_create', `New user created: ${newUser.name} (${newUser.role})`, { userId: newUser.id, role: newUser.role });

    return delay(newUser);
};

export const updateUser = (updatedUser: User) => update<User>(DB.users, updatedUser);

export const deleteUser = async (userId: string) => {
    let users = await getAll<User>(DB.users);
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) throw new Error('User not found');

    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(DB.users, JSON.stringify(updatedUsers));

    const passwords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
    delete passwords[userToDelete.email];
    localStorage.setItem('user_passwords', JSON.stringify(passwords));
    
    logActivity('user_delete', `User account for ${userToDelete.name} was deleted.`, { userId: userToDelete.id });

    return delay(null);
};

export const resetPassword = async (userId: string, newPassword: string) => {
    const users = await getAll<User>(DB.users);
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) {
        throw new Error('User not found.');
    }

    const passwords = JSON.parse(localStorage.getItem('user_passwords') || '{}');
    passwords[userToUpdate.email] = newPassword;
    localStorage.setItem('user_passwords', JSON.stringify(passwords));

    return delay({ success: true });
};


// Courses
export const getCourses = () => getAll<Course>(DB.courses);
export const getCourseById = (courseId: string) => getById<Course>(DB.courses, courseId);
export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'materials' | 'topics'> & { videoID: string }) => {
    const { videoID, ...restOfData } = courseData;
    
    const newMaterials: CourseMaterial[] = [];
    if (videoID && restOfData.courseType === 'Youtube') {
        newMaterials.push({
            id: `mat-${Date.now()}`,
            type: 'video',
            title: `${restOfData.title} Video`,
            url: `https://www.youtube.com/watch?v=${videoID}`
        });
    }

    const newCourse: Course = {
        ...restOfData,
        id: `course-${Date.now()}`,
        createdAt: new Date().toISOString(),
        topics: [], // Topics are not added at creation from this form
        materials: newMaterials,
    };

    logActivity('course_create', `Course "${newCourse.title}" published by ${newCourse.instructorName}.`, { courseId: newCourse.id, mentorId: newCourse.mentorId });
    return create(DB.courses, newCourse);
};
export const updateCourse = (updatedCourse: Course) => update<Course>(DB.courses, updatedCourse);
export const deleteCourse = async (courseId: string) => {
    const course = await getCourseById(courseId);
    if(course) {
        logActivity('course_delete', `Course "${course.title}" was deleted.`, { courseId });
    }
    return remove(DB.courses, courseId)
};

// Quizzes
export const getQuizzes = () => getAll<Quiz>(DB.quizzes);
export const getQuizzesByCourse = async (courseId: string) => {
    const allQuizzes = await getAll<Quiz>(DB.quizzes);
    return delay(allQuizzes.filter(q => q.courseId === courseId));
};
export const getQuizById = (quizId: string) => getById<Quiz>(DB.quizzes, quizId);
export const createQuiz = async (quizData: Omit<Quiz, 'id' | 'createdAt'>) => {
    const newQuiz: Quiz = {
        ...quizData,
        id: `quiz-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    const course = await getCourseById(quizData.courseId);
    if(course) {
        logActivity('quiz_create', `A new quiz "${newQuiz.title}" was created for the course "${course.title}".`, { quizId: newQuiz.id, courseId: course.id });
    }
    return create(DB.quizzes, newQuiz);
};
export const updateQuiz = (updatedQuiz: Quiz) => update<Quiz>(DB.quizzes, updatedQuiz);

// Quiz Attempts
export const submitQuizAttempt = async (attemptData: Omit<QuizAttempt, 'id' | 'submittedAt'>) => {
    const newAttempt: QuizAttempt = {
        ...attemptData,
        id: `attempt-${Date.now()}`,
        submittedAt: new Date().toISOString(),
    };
    
    // Fix: Corrected array destructuring from a promise that returns two elements.
    const [user, data] = await Promise.all([
        getById<User>(DB.users, newAttempt.studentId),
        getQuizById(newAttempt.quizId).then(q => q ? getById<Course>(DB.courses, q.courseId).then(c => ({ quiz: q, course: c })) : { quiz: null, course: null })
    ]);
    
    const { quiz, course } = data;
    
    if (user && quiz && course) {
         logActivity('quiz_submit', `${user.name} submitted the quiz "${quiz.title}" for the course "${course.title}".`, {
            studentId: newAttempt.studentId,
            quizId: newAttempt.quizId,
            score: newAttempt.score,
            totalPoints: newAttempt.totalPoints
        });
    }

    return create(DB.attempts, newAttempt);
};
export const getStudentProgress = async (studentId: string) => {
    const allAttempts = await getAll<QuizAttempt>(DB.attempts);
    return delay(allAttempts.filter(a => a.studentId === studentId));
};
export const getAllAttempts = () => getAll<QuizAttempt>(DB.attempts);
export const updateQuizAttempt = (updatedAttempt: QuizAttempt) => update<QuizAttempt>(DB.attempts, updatedAttempt);

// --- Quiz Assignments ---
export const createQuizAssignments = async (quizId: string, studentIds: string[]): Promise<QuizAssignment[]> => {
    const allAssignments = await getAll<QuizAssignment>(DB.assignments);
    const newAssignments: QuizAssignment[] = [];

    studentIds.forEach(studentId => {
        // Prevent duplicate assignments
        const exists = allAssignments.some(a => a.quizId === quizId && a.studentId === studentId);
        if (!exists) {
            const newAssignment: QuizAssignment = {
                id: `assign-${Date.now()}-${studentId.slice(-4)}`,
                quizId,
                studentId,
                assignedAt: new Date().toISOString(),
            };
            newAssignments.push(newAssignment);
        }
    });

    if (newAssignments.length > 0) {
        const updatedAssignments = [...allAssignments, ...newAssignments];
        localStorage.setItem(DB.assignments, JSON.stringify(updatedAssignments));
    }
    
    return delay(newAssignments);
};

export const getAssignedQuizzesForStudent = async (studentId: string) => {
    const allAssignments = await getAll<QuizAssignment>(DB.assignments);
    const studentAssignments = allAssignments.filter(a => a.studentId === studentId);
    const assignedQuizIds = new Set(studentAssignments.map(a => a.quizId));

    const allQuizzes = await getQuizzes();
    const studentQuizzes = allQuizzes.filter(q => assignedQuizIds.has(q.id));

    const courses = await getCourses();
    const coursesMap = courses.reduce((acc, course) => {
        acc[course.id] = course.title;
        return acc;
    }, {} as { [id: string]: string });

    return delay(studentQuizzes.map(quiz => ({
        ...quiz,
        courseTitle: coursesMap[quiz.courseId] || 'Unknown Course',
    })));
};

export const getAssignedCoursesForStudent = async (studentId: string): Promise<Course[]> => {
    const assignedQuizzes = await getAssignedQuizzesForStudent(studentId);
    const courseIds = [...new Set(assignedQuizzes.map(quiz => quiz.courseId))];
    const allCourses = await getCourses();
    const assignedCourses = allCourses.filter(course => courseIds.includes(course.id));
    return delay(assignedCourses);
};


// --- AI QUIZ GENERATION ---
export const generateQuizQuestions = async (topic: string, difficulty: string, numQuestions: number): Promise<Question[]> => {
    const prompt = `Generate ${numQuestions} quiz questions about "${topic}" for a learning platform. The difficulty level should be "${difficulty}". 
    Include a mix of multiple-choice and short-answer questions. For multiple-choice, provide 4 options. 
    Ensure the response strictly follows the provided JSON schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer'], description: 'The type of question.' },
                                    question: { type: Type.STRING, description: 'The question text.' },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: 'An array of 4 possible answers for multiple-choice questions. Omit for short-answer.'
                                    },
                                    correctAnswer: { type: Type.STRING, description: 'The correct answer.' },
                                    points: { type: Type.INTEGER, description: 'Points awarded for a correct answer, typically 10.' },
                                },
                                required: ['type', 'question', 'correctAnswer', 'points'],
                            }
                        }
                    }
                },
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Add IDs to the questions
        return result.questions.map((q: Omit<Question, 'id'>, index: number) => ({
            ...q,
            id: `gen-q-${Date.now()}-${index}`,
        }));

    } catch (error) {
        console.error("Error generating quiz questions with Gemini:", error);
        throw new Error("Failed to generate quiz questions. Please check your API key and try again.");
    }
};

// --- AI ADAPTIVE LEARNING ---
export const getLearningSuggestion = async (courseTitle: string, quizTitle: string, score: number, totalPoints: number): Promise<string> => {
    const percentage = Math.round((score / totalPoints) * 100);
    const performance = percentage >= 80 ? 'well' : (percentage >= 50 ? 'okay' : 'poorly');

    const prompt = `A student performed ${performance} on the "${quizTitle}" quiz for the course "${courseTitle}", scoring ${percentage}%. 
    Based on this, provide a short, encouraging learning suggestion.
    - If they did poorly, suggest they review the course materials and retry the quiz.
    - If they did okay, praise their effort and suggest a quick review of missed topics before moving on.
    - If they did well, congratulate them and recommend they start the next topic or a more challenging quiz.
    Keep the response to 2-3 sentences.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating learning suggestion:", error);
        return "We're having trouble generating a suggestion right now. Keep up the great work!";
    }
};
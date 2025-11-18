import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Course, Quiz, Question, User } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Dialog from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface MentorQuizManagementProps {
    isTabView?: boolean;
    course?: Course;
}

const MentorQuizManagement: React.FC<MentorQuizManagementProps> = ({ isTabView = false, course: courseProp }) => {
    const { courseId: paramCourseId } = useParams<{ courseId: string }>();
    const [course, setCourse] = useState<Course | null>(courseProp || null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(!courseProp);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

    const courseId = courseProp?.id || paramCourseId;

    const fetchQuizzes = () => {
        if(courseId) {
            setIsLoading(true);
            api.getQuizzesByCourse(courseId)
               .then(setQuizzes)
               .finally(() => setIsLoading(false));
        }
    }

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            setIsLoading(true);
            try {
                const courseData = courseProp || await api.getCourseById(courseId);
                setCourse(courseData);
                if (courseData) {
                    const courseQuizzes = await api.getQuizzesByCourse(courseData.id);
                    setQuizzes(courseQuizzes);
                }
            } catch (error) {
                console.error("Failed to fetch course and quizzes", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId, courseProp]);


    const handleAssignClick = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsAssignModalOpen(true);
    };

    const handleEditClick = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setIsEditModalOpen(true);
    };

    if (isLoading) {
        return <div className="text-center p-8">Loading quizzes...</div>;
    }
    
    if (!course) {
        return <div className="text-center p-8">Course not found.</div>;
    }

    return (
        <div className="space-y-6">
            {!isTabView ? (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Link to="/mentor/courses" className="text-sm text-indigo-600 hover:underline">← Back to Courses</Link>
                        <h1 className="text-3xl font-bold tracking-tight">{course.title} Quizzes</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage and assign quizzes for this course.</p>
                    </div>
                     <Link to="/mentor/generate-quiz"><Button>Generate AI Quiz</Button></Link>
                </div>
            ) : (
                <div className="flex justify-end">
                    <Link to="/mentor/generate-quiz"><Button>Generate AI Quiz</Button></Link>
                </div>
            )}
            
            {quizzes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {quizzes.map(quiz => (
                       <Card key={quiz.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{quiz.title}</CardTitle>
                                <CardDescription>{quiz.questions.length} Questions</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <Badge variant="secondary">{quiz.difficulty}</Badge>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2">
                                 <Button variant="outline" size="sm" onClick={() => handleEditClick(quiz)}>
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button size="sm" onClick={() => handleAssignClick(quiz)}>
                                    <UsersIcon className="w-4 h-4 mr-2" />
                                    Assign
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <p className="text-lg font-semibold">No quizzes for this course yet.</p>
                    <p className="text-slate-500 dark:text-slate-400">Use the AI Generator to create the first one!</p>
                </div>
            )}

            {selectedQuiz && (
                <>
                    <AssignQuizDialog
                        isOpen={isAssignModalOpen}
                        onClose={() => setIsAssignModalOpen(false)}
                        onQuizAssigned={() => setIsAssignModalOpen(false)}
                        quiz={selectedQuiz}
                    />
                    <EditQuizDialog
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onQuizUpdated={fetchQuizzes}
                        quiz={selectedQuiz}
                    />
                </>
            )}
        </div>
    );
};


// --- Assign Quiz Dialog ---
interface AssignQuizDialogProps {
    isOpen: boolean; onClose: () => void; onQuizAssigned: () => void; quiz: Quiz;
}
const AssignQuizDialog: React.FC<AssignQuizDialogProps> = ({ isOpen, onClose, onQuizAssigned, quiz }) => {
    const [students, setStudents] = useState<User[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchStudents = async () => {
                setIsLoading(true);
                try {
                    const allUsers = await api.getUsers();
                    setStudents(allUsers.filter(u => u.role === 'student'));
                } catch (err) {
                    setError('Failed to load students.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStudents();
            setSelectedStudentIds(new Set()); // Reset on open
        }
    }, [isOpen]);

    const handleSelectStudent = (studentId: string) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (selectedStudentIds.size === 0) {
            setError('Please select at least one student.');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.createQuizAssignments(quiz.id, Array.from(selectedStudentIds));
            onQuizAssigned();
        } catch(err) {
            setError('An error occurred while assigning the quiz.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={`Assign "${quiz.title}"`}>
            <form onSubmit={handleAssign}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Select students to assign this quiz to.</p>
                    {isLoading ? (
                        <p>Loading students...</p>
                    ) : error ? (
                         <p className="text-sm text-red-500">{error}</p>
                    ) : (
                        <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                            {students.length > 0 ? students.map(student => (
                                <label key={student.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudentIds.has(student.id)}
                                        onChange={() => handleSelectStudent(student.id)}
                                        className="w-4 h-4"
                                    />
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        <p className="text-xs text-slate-500">{student.email}</p>
                                    </div>
                                </label>
                            )) : <p className="text-sm text-slate-500 text-center p-4">No students found.</p>}
                        </div>
                    )}
                    {error && !isLoading && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-6">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting || isLoading || students.length === 0}>
                        {isSubmitting ? 'Assigning...' : `Assign to ${selectedStudentIds.size} Student(s)`}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}


// --- Edit Quiz Dialog ---
interface EditQuizDialogProps {
    isOpen: boolean; onClose: () => void; onQuizUpdated: () => void; quiz: Quiz;
}
const EditQuizDialog: React.FC<EditQuizDialogProps> = ({ isOpen, onClose, onQuizUpdated, quiz }) => {
    const [editableQuiz, setEditableQuiz] = useState<Quiz | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        if(quiz) {
            setEditableQuiz(JSON.parse(JSON.stringify(quiz)));
        }
    }, [quiz, isOpen])

    const handleQuizDataChange = (field: keyof Quiz, value: any) => {
        if(!editableQuiz) return;
        setEditableQuiz(prev => prev ? ({ ...prev, [field]: value }) : null);
    }

    const handleQuestionChange = (qIndex: number, field: keyof Question, value: any) => {
        if(!editableQuiz) return;
        const newQuestions = [...editableQuiz.questions];
        (newQuestions[qIndex] as any)[field] = value;
        setEditableQuiz(prev => prev ? ({ ...prev, questions: newQuestions }) : null);
    }

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        if(!editableQuiz) return;
        const newQuestions = [...editableQuiz.questions];
        if (newQuestions[qIndex].options) {
            newQuestions[qIndex].options![oIndex] = value;
        }
        setEditableQuiz(prev => prev ? ({ ...prev, questions: newQuestions }) : null);
    }
    
    const handleRemoveQuestion = (qIndex: number) => {
        if(!editableQuiz) return;
        const newQuestions = editableQuiz.questions.filter((_, index) => index !== qIndex);
        setEditableQuiz(prev => prev ? ({ ...prev, questions: newQuestions }) : null);
    }

    const handleAddQuestion = (type: 'multiple-choice' | 'short-answer') => {
        if (!editableQuiz) return;
        const newQuestion: Question = {
            id: `new-q-${Date.now()}`,
            type,
            question: 'New Question',
            correctAnswer: '',
            points: 10,
            ...(type === 'multiple-choice' && { options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] })
        };
        setEditableQuiz(prev => prev ? ({ ...prev, questions: [...prev.questions, newQuestion] }) : null);
    }
    
    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null || !editableQuiz) return;
        const newQuestions = [...editableQuiz.questions];
        const draggedItemContent = newQuestions.splice(dragItem.current, 1)[0];
        newQuestions.splice(dragOverItem.current, 0, draggedItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setEditableQuiz(prev => prev ? ({ ...prev, questions: newQuestions }) : null);
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editableQuiz) return;
        setIsSubmitting(true);
        setError('');
        try {
            await api.updateQuiz(editableQuiz);
            onQuizUpdated();
            onClose();
        } catch (err) {
            setError("Failed to save changes.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!editableQuiz) return null;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Quiz">
            <form onSubmit={handleSaveChanges} className="space-y-4">
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-4 -mr-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Quiz Title</label>
                        <Input value={editableQuiz.title} onChange={e => handleQuizDataChange('title', e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Difficulty</label>
                        <Select value={editableQuiz.difficulty} onChange={e => handleQuizDataChange('difficulty', e.target.value as any)} required>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </Select>
                    </div>

                    <h3 className="text-lg font-semibold pt-4 border-t dark:border-slate-700">Questions</h3>
                    <div className="space-y-4">
                        {editableQuiz.questions.map((q, qIndex) => (
                            <div 
                                key={q.id}
                                draggable
                                onDragStart={() => dragItem.current = qIndex}
                                onDragEnter={() => dragOverItem.current = qIndex}
                                onDragEnd={handleDragSort}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <Card className="bg-slate-50 dark:bg-slate-900 cursor-grab active:cursor-grabbing">
                                    <CardHeader className="flex flex-row justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <GripVerticalIcon className="w-5 h-5 text-slate-400" />
                                            <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleRemoveQuestion(qIndex)}>Remove</Button>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium">Question Text</label>
                                            <Input value={q.question} onChange={e => handleQuestionChange(qIndex, 'question', e.target.value)} />
                                        </div>
                                        {q.type === 'multiple-choice' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options?.map((opt, oIndex) => (
                                                    <div key={oIndex}>
                                                        <label className="text-xs font-medium">Option {oIndex + 1}</label>
                                                        <Input value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs font-medium">Correct Answer</label>
                                                {q.type === 'multiple-choice' ? (
                                                    <Select value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}>
                                                        {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </Select>
                                                ) : (
                                                    <Input value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} />
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium">Points</label>
                                                <Input type="number" value={q.points} onChange={e => handleQuestionChange(qIndex, 'points', parseInt(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-between gap-2 pt-4 border-t dark:border-slate-800">
                    <div className="flex gap-2">
                         <Button type="button" variant="secondary" onClick={() => handleAddQuestion('multiple-choice')}>Add Multiple Choice</Button>
                         <Button type="button" variant="secondary" onClick={() => handleAddQuestion('short-answer')}>Add Short Answer</Button>
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </div>
            </form>
        </Dialog>
    )
}


// Icons
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="22" y1="2" y2="6"/><path d="M7.5 20.5 19 9l-4-4L3.5 16.5 2 22z"/></svg>;
const GripVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>


export default MentorQuizManagement;
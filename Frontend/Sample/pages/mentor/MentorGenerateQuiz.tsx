import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import * as api from '../../lib/api';
import { Course, Question } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate, Link } from 'react-router-dom';

const MentorGenerateQuiz: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
    const [numQuestions, setNumQuestions] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            setIsLoadingCourses(true);
            try {
                const allCourses = await api.getCourses();
                const mentorCourses = allCourses.filter(c => c.mentorId === user.id);
                setCourses(mentorCourses);
                if (mentorCourses.length > 0) {
                    // Pre-select the first course
                    handleCourseChange(mentorCourses[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
                setError("Could not load your courses.");
            } finally {
                setIsLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [user]);

    const handleCourseChange = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (course) {
            setSelectedCourse(course);
            setDifficulty(course.difficulty);
            setTopic(course.topics[0] || '');
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedCourse) {
            setError("Please select a course.");
            return;
        }
        setIsGenerating(true);
        setError('');
        try {
            const generatedQuestions: Question[] = await api.generateQuizQuestions(topic, difficulty, numQuestions);
            
            const newQuiz = await api.createQuiz({
                courseId: selectedCourse.id,
                title: `${topic} Quiz (${difficulty})`,
                questions: generatedQuestions,
                difficulty,
                createdBy: user.id
            });
            // Navigate to the course detail page to see the new quiz
            navigate(`/mentor/course/${selectedCourse.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to generate quiz. Please check your API key or try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoadingCourses) {
        return <p>Loading your courses...</p>;
    }

    if (courses.length === 0) {
        return (
            <Card className="text-center max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle>No Courses Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You need to create a course before you can generate a quiz for it.</p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link to="/mentor/add-course"><Button>Create a Course</Button></Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Quiz Generator</CardTitle>
                        <CardDescription>Generate a new quiz for one of your courses using AI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label htmlFor="course" className="block text-sm font-medium mb-1">Select Course</label>
                            <Select id="course" value={selectedCourse?.id || ''} onChange={e => handleCourseChange(e.target.value)} required>
                                <option value="" disabled>-- Select a course --</option>
                                {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                            </Select>
                        </div>
                        {selectedCourse && (
                            <>
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-medium mb-1">Quiz Topic</label>
                                    <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., JavaScript Functions" required />
                                    <p className="text-xs text-slate-500 mt-1">Suggestions: {selectedCourse.topics.join(', ')}</p>
                                </div>
                                <div>
                                    <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Difficulty</label>
                                    <Select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as any)} required>
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </Select>
                                </div>
                                <div>
                                    <label htmlFor="numQuestions" className="block text-sm font-medium mb-1">Number of Questions</label>
                                    <Input id="numQuestions" type="number" min="1" max="10" value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value))} required />
                                </div>
                            </>
                        )}
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={isGenerating || !selectedCourse}>
                            {isGenerating ? 'Generating...' : 'Generate Quiz'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default MentorGenerateQuiz;

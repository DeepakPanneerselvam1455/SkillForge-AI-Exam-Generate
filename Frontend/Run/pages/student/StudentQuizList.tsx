import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../lib/api';
import { Quiz } from '../../types';
import { useAuth } from '../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { buttonVariants } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils';

interface QuizWithCourse extends Quiz {
    courseTitle: string;
}

const StudentQuizList: React.FC = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState<QuizWithCourse[]>([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState<QuizWithCourse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedQuizzes = async () => {
            if (!user) return;
            try {
                const assignedQuizzes = await api.getAssignedQuizzesForStudent(user.id);
                setQuizzes(assignedQuizzes);
                setFilteredQuizzes(assignedQuizzes);
            } catch (error) {
                console.error("Failed to fetch assigned quizzes", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssignedQuizzes();
    }, [user]);

    useEffect(() => {
        let result = quizzes;
        if (searchTerm) {
            result = result.filter(q =>
                q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (difficultyFilter !== 'All') {
            result = result.filter(q => q.difficulty === difficultyFilter);
        }
        setFilteredQuizzes(result);
    }, [searchTerm, difficultyFilter, quizzes]);
    
    if (isLoading) {
        return <div className="text-center p-8">Loading quizzes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Assigned Quizzes</h1>
                    <p className="text-slate-500 dark:text-slate-400">Quizzes assigned to you by your instructors.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Input 
                        placeholder="Search quizzes..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-48"
                    />
                    <Select 
                        value={difficultyFilter}
                        onChange={e => setDifficultyFilter(e.target.value)}
                        className="w-full md:w-40"
                    >
                        <option>All</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </Select>
                </div>
            </div>

            {filteredQuizzes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredQuizzes.map(quiz => (
                        <Card key={quiz.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{quiz.title}</CardTitle>
                                <CardDescription>{quiz.courseTitle}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{quiz.difficulty}</Badge>
                                    <span className="text-sm text-slate-500">{quiz.questions.length} Questions</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Link to={`/student/quiz/${quiz.id}`} className={cn(buttonVariants(), 'w-full')}>Take Quiz</Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <PartyPopperIcon className="w-16 h-16 mx-auto text-indigo-500" />
                    <p className="mt-4 text-lg font-semibold">Woohoo! No quizzes assigned.</p>
                    <p className="text-slate-500 dark:text-slate-400">Enjoy the break or get ready for the next challenge!</p>
                </div>
            )}
        </div>
    );
};

const PartyPopperIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6z"/><path d="M12 5v.01"/><path d="M16 13v-3"/><path d="M8 13v-3"/><path d="M10 21v-3.47a2 2 0 0 1 1-1.73l2-1.15a2 2 0 0 0 1-1.73V13"/><path d="m19 13-2-2.5"/><path d="m5 13 2-2.5"/><path d="m12 5-1.5-1.5"/><path d="m14.5 3.5 1-1"/><path d="m9.5 3.5-1-1"/></svg>;

export default StudentQuizList;
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Quiz, CourseMaterial, Course, QuizAttempt } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button, buttonVariants } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

const QUIZ_DURATION_SECONDS = 300; // 5 minutes
type QuizState = 'landing' | 'active' | 'finished';

interface NextQuizSuggestion {
    text: string;
    quiz?: Quiz;
}

const StudentQuizView: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
    const [quizState, setQuizState] = useState<QuizState>('landing');
    const [score, setScore] = useState(0);
    const [finishedAttempt, setFinishedAttempt] = useState<QuizAttempt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(QUIZ_DURATION_SECONDS);
    const [nextQuizSuggestion, setNextQuizSuggestion] = useState<NextQuizSuggestion | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchQuizAndCourse = async () => {
            if (!quizId) return;
            setIsLoading(true);
            try {
                const quizData = await api.getQuizById(quizId);
                if (!quizData) {
                    throw new Error("The quiz you are looking for could not be found. It may have been removed by the instructor.");
                }
                setQuiz(quizData);

                const courseData = await api.getCourseById(quizData.courseId);
                if (!courseData) {
                    throw new Error("Could not load the course details associated with this quiz.");
                }
                setCourse(courseData);

            } catch (err: any) {
                console.error("Failed to fetch quiz and course", err);
                setError(err.message || "An unexpected error occurred while loading the quiz.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizAndCourse();
    }, [quizId]);

    // Timer logic
    useEffect(() => {
        if (quizState === 'active') {
            timerRef.current = window.setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizState]);

    useEffect(() => {
        if (timeRemaining <= 0 && quizState === 'active') {
            handleSubmit(true); // Auto-submit when timer runs out
        }
    }, [timeRemaining, quizState]);
    
    useEffect(() => {
        const fetchLatestAttempt = async () => {
            if (quizState === 'finished' && user && quizId) {
                // To display feedback, we need to get the latest version of the attempt
                const allAttempts = await api.getStudentProgress(user.id);
                const latestForThisQuiz = allAttempts
                    .filter(a => a.quizId === quizId)
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
                
                if (latestForThisQuiz) {
                    setFinishedAttempt(latestForThisQuiz);
                }
            }
        };
        fetchLatestAttempt();
    }, [quizState, quizId, user]);


    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleNext = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async (isAutoSubmit = false) => {
        if (!quiz || !user || isSubmitting) return;
        setIsSubmitting(true);
        if(timerRef.current) clearInterval(timerRef.current);
        
        try {
            let calculatedScore = 0;
            quiz.questions.forEach(q => {
                if (answers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                    calculatedScore += q.points;
                }
            });
            
            setScore(calculatedScore); // Keep local score for immediate display
            const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    
            const submittedAttempt = await api.submitQuizAttempt({
                quizId: quiz.id,
                studentId: user.id,
                answers,
                score: calculatedScore,
                totalPoints,
            });
            setFinishedAttempt(submittedAttempt); // Show the submitted version immediately
            setQuizState('finished');
    
            if (isAutoSubmit) {
                alert("Time's up! Your quiz has been submitted automatically.");
            }
    
            // Adaptive learning suggestion logic
            const percentage = totalPoints > 0 ? Math.round((calculatedScore / totalPoints) * 100) : 0;
            const allCourseQuizzes = await api.getQuizzesByCourse(quiz.courseId);
            
            let suggestion: NextQuizSuggestion | null = null;
    
            if (percentage >= 80) {
                let nextDifficulty: 'Intermediate' | 'Advanced' | null = null;
                if (quiz.difficulty === 'Beginner') nextDifficulty = 'Intermediate';
                if (quiz.difficulty === 'Intermediate') nextDifficulty = 'Advanced';
    
                if (nextDifficulty) {
                    const nextQuiz = allCourseQuizzes.find(q => q.difficulty === nextDifficulty && q.id !== quiz.id);
                    if (nextQuiz) {
                        suggestion = { text: "Great job! You're ready for a bigger challenge.", quiz: nextQuiz };
                    } else {
                        suggestion = { text: "Excellent work! You've mastered this topic." };
                    }
                } else {
                     suggestion = { text: "Excellent work! You've mastered this topic." };
                }
            } else if (percentage < 50) {
                suggestion = { text: "It looks like this topic was a bit tricky. We recommend reviewing the course materials and trying again." };
            } else {
                suggestion = { text: "Good effort! A quick review of the material will help solidify your knowledge." };
            }
            setNextQuizSuggestion(suggestion);
        } catch(err) {
            console.error("Error submitting quiz", err);
            setError("Failed to submit quiz. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleRetakeQuiz = () => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setScore(0);
        setFinishedAttempt(null);
        setTimeRemaining(QUIZ_DURATION_SECONDS);
        setQuizState('landing');
        setNextQuizSuggestion(null);
    };

    if (isLoading) return <div className="text-center p-8">Loading quiz...</div>;
    if (error) return <div className="text-center p-8 text-red-600 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">{error}</div>;
    if (!quiz || !course) return <div className="text-center p-8">Quiz data could not be fully loaded. Please try again later.</div>;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    if (quizState === 'landing') {
        return (
            <div className="max-w-3xl mx-auto space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">{quiz.title}</CardTitle>
                        <CardDescription>From course: {course.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2"><Badge variant="secondary">{quiz.difficulty}</Badge></div>
                            <div className="flex items-center gap-2"><FileQuestionIcon className="w-4 h-4 text-slate-500" /> {quiz.questions.length} Questions</div>
                            <div className="flex items-center gap-2"><TimerIcon className="w-4 h-4 text-slate-500" /> {QUIZ_DURATION_SECONDS / 60} Minutes</div>
                        </div>
                        <p>This quiz will test your knowledge on topics from the "{course.title}" course. Review the materials below before you begin.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={() => setQuizState('active')}>
                            Start Quiz
                        </Button>
                    </CardFooter>
                </Card>
                {course.materials.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course Materials</CardTitle>
                        <CardDescription>Reference these materials to help you with the quiz.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {course.materials.map(material => (
                                <li key={material.id}>
                                    <a 
                                        href={material.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-3 p-3 rounded-md border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {getMaterialIcon(material.type)}
                                        <div>
                                            <p className="font-semibold">{material.title}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-sm">
                                                {material.type === 'link' ? material.url : `Type: ${material.type.toUpperCase()}`}
                                            </p>
                                        </div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
            </div>
        )
    }

    if (quizState === 'finished') {
        const finalScore = finishedAttempt?.overriddenScore ?? finishedAttempt?.score ?? score;
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const percentage = totalPoints > 0 ? Math.round((finalScore / totalPoints) * 100) : 0;

        const getResultIcon = () => {
            if (percentage >= 80) return <TrophyIcon className="w-16 h-16 text-yellow-500" />;
            if (percentage < 50) return <RepeatIcon className="w-16 h-16 text-red-500" />;
            return <ThumbsUpIcon className="w-16 h-16 text-blue-500" />;
        };
        const getResultTitle = () => {
            if (percentage >= 80) return "Excellent Work!";
            if (percentage < 50) return "Keep Practicing!";
            return "Good Effort!";
        };


        return (
            <div className="max-w-3xl mx-auto space-y-6">
                <Card>
                    <CardHeader className="text-center items-center">
                        {getResultIcon()}
                        <CardTitle className="text-3xl">{getResultTitle()}</CardTitle>
                        <CardDescription>You've finished the "{quiz.title}" quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                        <p className="text-lg font-medium">Your Score:</p>
                        <p className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
                            {finalScore} / {totalPoints}
                        </p>
                        <p className="text-2xl text-slate-600 dark:text-slate-300">
                           That's {percentage}%!
                        </p>
                    </CardContent>
                </Card>
                
                {finishedAttempt?.overallFeedback && (
                    <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquareIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                Instructor Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 dark:text-slate-300 italic">"{finishedAttempt.overallFeedback}"</p>
                        </CardContent>
                    </Card>
                )}


                {nextQuizSuggestion && !finishedAttempt?.overallFeedback && (
                    <Card>
                        <CardHeader>
                            <CardTitle>What's Next?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>{nextQuizSuggestion.text}</p>
                            {nextQuizSuggestion.quiz && (
                                <Link to={`/student/quiz/${nextQuizSuggestion.quiz.id}`} onClick={handleRetakeQuiz} className={cn(buttonVariants(), 'w-full')}>
                                    Take: {nextQuizSuggestion.quiz.title} ({nextQuizSuggestion.quiz.difficulty})
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}


                <h2 className="text-2xl font-bold">Question Breakdown</h2>

                <div className="space-y-4">
                    {quiz.questions.map((question, index) => {
                        const userAnswer = finishedAttempt?.answers[question.id] || "Not Answered";
                        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                        
                        return (
                            <Card 
                                key={question.id}
                                className={cn(isCorrect 
                                    ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-900/20' 
                                    : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-900/20'
                                )}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 flex-1">{index + 1}. {question.question}</p>
                                        {isCorrect ? (
                                            <Badge variant="success" className="whitespace-nowrap">
                                                <CheckIcon className="w-3.5 h-3.5 mr-1.5" />
                                                Correct
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive" className="whitespace-nowrap">
                                                <XIcon className="w-3.5 h-3.5 mr-1.5" />
                                                Incorrect
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm pt-4">
                                    <div className="flex items-start gap-2">
                                        <span className="font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">Your Answer:</span>
                                        <span className={`flex-1 font-semibold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {userAnswer}
                                        </span>
                                    </div>
                                    {!isCorrect && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">Correct Answer:</span>
                                            <span className="flex-1 font-semibold text-green-700 dark:text-green-400">
                                                {question.correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                                {finishedAttempt?.feedback?.[question.id] && (
                                    <CardFooter className="bg-amber-50/50 dark:bg-amber-900/10 border-t dark:border-slate-800 py-3 px-6">
                                        <div className="flex items-start gap-2 text-sm">
                                            <MessageSquareIcon className="w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-slate-600 dark:text-slate-300"><strong className="font-medium">Feedback:</strong> {finishedAttempt.feedback[question.id]}</p>
                                        </div>
                                    </CardFooter>
                                )}
                            </Card>
                        );
                    })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {percentage < 80 && (
                        <Button onClick={handleRetakeQuiz} variant="outline" className="w-full">
                            Retake Quiz
                        </Button>
                    )}
                    <Button onClick={() => navigate('/student/quizzes')} className="w-full">
                        Back to Quizzes
                    </Button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>{quiz.title}</CardTitle>
                        <Badge
                            variant={timeRemaining < 60 ? 'destructive' : 'secondary'}
                            className={cn(
                                'tabular-nums text-sm px-3 py-1.5 transition-all duration-500', // Make it larger and use monospaced numbers
                                timeRemaining < 60 && 'animate-pulse font-bold' // Add pulse animation and bold text when time is low
                            )}
                        >
                            <TimerIcon className="w-4 h-4 mr-1.5" />
                            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                        <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                            role="progressbar"
                            aria-valuenow={Math.round(progress)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Quiz progress"
                        ></div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
                        <div className="space-y-3">
                        {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map(option => (
                            <label key={option} className="flex items-center p-3 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-500 dark:has-[:checked]:bg-indigo-900/50">
                                <input
                                    type="radio"
                                    name={currentQuestion.id}
                                    value={option}
                                    checked={answers[currentQuestion.id] === option}
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    className="w-4 h-4 mr-3"
                                />
                                {option}
                            </label>
                        ))}
                        {currentQuestion.type === 'short-answer' && (
                            <Input
                                type="text"
                                placeholder="Your answer..."
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            />
                        )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>Previous</Button>
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>Next</Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

const getMaterialIcon = (type: CourseMaterial['type']) => {
    switch(type) {
        case 'link': return <LinkIcon className="w-6 h-6 text-blue-500 shrink-0" />;
        case 'pdf': return <FileTextIcon className="w-6 h-6 text-red-500 shrink-0" />;
        case 'video': return <VideoIcon className="w-6 h-6 text-purple-500 shrink-0" />;
        default: return null;
    }
}

// Icons
const MessageSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
    </svg>
);
const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m22 8-6 4 6 4V8Z"></path>
        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect>
    </svg>
);
const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const TimerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const FileQuestionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2"/><path d="M12 17h.01"/></svg>
);
const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const RepeatIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.6A9 9 0 0 1 12 3a9 9 0 0 1 9 9"/><path d="M7 21.9l-4-4 4-4"/><path d="M21 11.4A9 9 0 0 1 12 21a9 9 0 0 1-9-9"/></svg>;
const ThumbsUpIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3 3 0 0 1 3 3z"/></svg>;


export default StudentQuizView;
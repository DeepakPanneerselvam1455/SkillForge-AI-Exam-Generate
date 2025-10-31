import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Course, Quiz, QuizAttempt, User, Question } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Dialog from '../../components/ui/Dialog';
import { cn } from '../../lib/utils';
import { Input } from '../../components/ui/Input';

interface SubmissionData {
    attempt: QuizAttempt;
    studentName: string;
    quizTitle: string;
    quiz: Quiz | undefined;
}

const MentorGradingView: React.FC<{ course: Course }> = ({ course }) => {
    const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const [quizzes, allAttempts, users] = await Promise.all([
                api.getQuizzesByCourse(course.id),
                api.getAllAttempts(),
                api.getUsers(),
            ]);

            const quizMap = quizzes.reduce((acc, q) => { acc[q.id] = q; return acc; }, {} as { [id: string]: Quiz });
            const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {} as { [id: string]: User });
            const quizIdsInCourse = new Set(quizzes.map(q => q.id));

            const courseAttempts = allAttempts.filter(a => quizIdsInCourse.has(a.quizId));

            const formattedSubmissions: SubmissionData[] = courseAttempts.map(attempt => ({
                attempt,
                studentName: userMap[attempt.studentId]?.name || 'Unknown Student',
                quizTitle: quizMap[attempt.quizId]?.title || 'Unknown Quiz',
                quiz: quizMap[attempt.quizId],
            })).sort((a,b) => new Date(b.attempt.submittedAt).getTime() - new Date(a.attempt.submittedAt).getTime());

            setSubmissions(formattedSubmissions);
        } catch (error) {
            console.error("Failed to fetch submissions for grading", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSubmissions();
    }, [course]);

    const handleReviewClick = (submission: SubmissionData) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    if (isLoading) return <p>Loading submissions...</p>;

    return (
        <div className="space-y-4">
            {submissions.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3">Student</th>
                                        <th className="px-6 py-3">Quiz</th>
                                        <th className="px-6 py-3">Score</th>
                                        <th className="px-6 py-3">Submitted</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.attempt.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                                            <td className="px-6 py-4 font-medium">{sub.studentName}</td>
                                            <td className="px-6 py-4">{sub.quizTitle}</td>
                                            <td className="px-6 py-4 font-bold">{sub.attempt.overriddenScore ?? sub.attempt.score}/{sub.attempt.totalPoints}</td>
                                            <td className="px-6 py-4">{new Date(sub.attempt.submittedAt).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                {sub.attempt.gradedAt ? <Badge variant="success">Graded</Badge> : <Badge variant="secondary">Pending</Badge>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button size="sm" onClick={() => handleReviewClick(sub)}>Review</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <CoffeeIcon className="w-12 h-12 mx-auto text-slate-400" />
                    <p className="mt-4 text-lg font-semibold">All Caught Up!</p>
                    <p className="text-slate-500 dark:text-slate-400">No submissions are waiting for your review.</p>
                </div>
            )}
            {selectedSubmission && (
                <GradingModal
                    submission={selectedSubmission}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchSubmissions}
                />
            )}
        </div>
    );
};

interface GradingModalProps {
    submission: SubmissionData;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}
const GradingModal: React.FC<GradingModalProps> = ({ submission, isOpen, onClose, onSave }) => {
    const { user: mentor } = useAuth();
    const [editableAttempt, setEditableAttempt] = useState<QuizAttempt>(JSON.parse(JSON.stringify(submission.attempt)));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setEditableAttempt(JSON.parse(JSON.stringify(submission.attempt)));
    }, [submission]);

    const handleFeedbackChange = (questionId: string, text: string) => {
        setEditableAttempt(prev => ({
            ...prev,
            feedback: { ...prev.feedback, [questionId]: text },
        }));
    };
    
    const handleOverrideScore = (question: Question, isCorrect: boolean) => {
        const studentAnswer = editableAttempt.answers[question.id] || "";
        const wasCorrect = studentAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        
        if (isCorrect === wasCorrect) return; // No change needed

        const scoreChange = isCorrect ? question.points : -question.points;
        const currentScore = editableAttempt.overriddenScore ?? editableAttempt.score;
        
        setEditableAttempt(prev => ({
            ...prev,
            overriddenScore: currentScore + scoreChange,
            feedback: { ...prev.feedback, [question.id]: isCorrect ? "Marked as correct." : "Marked as incorrect." }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.updateQuizAttempt({
                ...editableAttempt,
                gradedBy: mentor?.id,
                gradedAt: new Date().toISOString(),
            });
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to save grade", error);
        } finally {
            setIsSaving(false);
        }
    };

    const quiz = submission.quiz;
    if (!quiz) return null;

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={`Grading: ${submission.quizTitle}`} description={`Submission by ${submission.studentName}`}>
             <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-4 -mr-4">
                {quiz.questions.map((q, index) => {
                    const studentAnswer = editableAttempt.answers[q.id] || "Not Answered";
                    const isCorrect = studentAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
                    return (
                        <Card key={q.id} className={cn(isCorrect ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10')}>
                            <CardHeader>
                                <p className="font-semibold">{index + 1}. {q.question}</p>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><strong className="text-slate-500">Student's Answer:</strong> {studentAnswer}</p>
                                <p><strong className="text-slate-500">Correct Answer:</strong> {q.correctAnswer}</p>
                                {q.type === 'short-answer' && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <Button size="sm" variant="outline" onClick={() => handleOverrideScore(q, true)}>Mark Correct</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleOverrideScore(q, false)}>Mark Incorrect</Button>
                                    </div>
                                )}
                                 <textarea
                                    value={editableAttempt.feedback?.[q.id] || ''}
                                    onChange={e => handleFeedbackChange(q.id, e.target.value)}
                                    placeholder="Provide feedback for this question..."
                                    className="mt-2 w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
                                    rows={2}
                                />
                            </CardContent>
                        </Card>
                    );
                })}

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Overall Feedback & Score</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <textarea
                            value={editableAttempt.overallFeedback || ''}
                            onChange={e => setEditableAttempt(prev => ({...prev, overallFeedback: e.target.value}))}
                            placeholder="Provide overall feedback for the attempt..."
                            className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-800 dark:border-slate-700"
                            rows={3}
                        />
                        <div className="flex items-center gap-4">
                            <label className="font-medium">Final Score</label>
                            <Input
                                type="number"
                                className="w-24"
                                value={editableAttempt.overriddenScore ?? editableAttempt.score}
                                onChange={e => setEditableAttempt(prev => ({...prev, overriddenScore: parseInt(e.target.value) || 0}))}
                            />
                             <span className="text-slate-500">/ {editableAttempt.totalPoints}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t dark:border-slate-700">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Grade'}</Button>
            </div>
        </Dialog>
    )
}
const CoffeeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>;

export default MentorGradingView;
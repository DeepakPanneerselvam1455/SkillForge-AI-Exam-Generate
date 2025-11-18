import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Course, CourseMaterial } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

interface CourseWithProgress extends Course {
    progress: number;
}

const StudentMyCourses: React.FC = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<CourseWithProgress[]>([]);
    const [viewedMaterials, setViewedMaterials] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const calculateProgress = (course: Course, viewed: Set<string>): number => {
        if (!course.materials || course.materials.length === 0) {
            return 100; // Completed if no materials
        }
        const viewedCount = course.materials.filter(m => viewed.has(m.id)).length;
        return Math.round((viewedCount / course.materials.length) * 100);
    };
    
    const fetchData = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [assignedCourses, viewedMaterialIds] = await Promise.all([
                api.getAssignedCoursesForStudent(user.id),
                api.getViewedMaterialsForStudent(user.id)
            ]);
            
            const viewedSet = new Set(viewedMaterialIds);
            setViewedMaterials(viewedSet);

            const coursesWithProgress = assignedCourses.map(course => ({
                ...course,
                progress: calculateProgress(course, viewedSet)
            }));
            setCourses(coursesWithProgress);

        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMaterialClick = async (materialId: string) => {
        if (!user) return;
        await api.markMaterialAsViewed(user.id, materialId);
        setViewedMaterials(prev => {
            // Fix: Explicitly type the new Set as Set<string> to resolve TypeScript's type inference issue.
            const newSet = new Set<string>(prev);
            newSet.add(materialId);
            setCourses(currentCourses => currentCourses.map(course => ({
                ...course,
                progress: calculateProgress(course, newSet)
            })));
            return newSet;
        });
    };
    
    if (isLoading) {
        return <div className="text-center p-8">Loading your courses...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                <p className="text-slate-500 dark:text-slate-400">Your assigned courses and learning materials.</p>
            </div>

            {courses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {courses.map(course => (
                        <Card key={course.id}>
                            <CardHeader>
                                <CardTitle>{course.title}</CardTitle>
                                <CardDescription>{course.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ProgressBar value={course.progress} />
                                <div>
                                    <h4 className="font-semibold mb-2">Learning Materials</h4>
                                    {course.materials.length > 0 ? (
                                        <ul className="space-y-2">
                                            {course.materials.map(material => (
                                                <li key={material.id}>
                                                    <a 
                                                        href={material.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        onClick={() => handleMaterialClick(material.id)}
                                                        className="flex items-center gap-3 p-3 rounded-md border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        {getMaterialIcon(material.type)}
                                                        <div className="flex-1">
                                                            <p className="font-semibold">{material.title}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-sm">
                                                                {material.type === 'link' || material.type === 'video' ? material.url : `Type: ${material.type.toUpperCase()}`}
                                                            </p>
                                                        </div>
                                                        {viewedMaterials.has(material.id) && <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">No materials for this course yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <BookIcon className="w-16 h-16 mx-auto text-indigo-500" />
                    <p className="mt-4 text-lg font-semibold">No Courses Assigned</p>
                    <p className="text-slate-500 dark:text-slate-400">Your instructor hasn't assigned any courses to you yet.</p>
                </div>
            )}
        </div>
    );
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Progress</span>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
            <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${value}%` }}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
            ></div>
        </div>
    </div>
);

const getMaterialIcon = (type: CourseMaterial['type']) => {
    switch(type) {
        case 'link': return <LinkIcon className="w-6 h-6 text-blue-500 shrink-0" />;
        case 'pdf': return <FileTextIcon className="w-6 h-6 text-red-500 shrink-0" />;
        case 'video': return <VideoIcon className="w-6 h-6 text-purple-500 shrink-0" />;
        default: return null;
    }
}

// Icons
const BookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>;
const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const VideoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>;
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default StudentMyCourses;
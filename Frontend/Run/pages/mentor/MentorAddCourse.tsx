import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Course } from '../../types';

const MentorAddCourse: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Form state
    const [courseName, setCourseName] = useState('');
    const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
    const [instructorName, setInstructorName] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [videoID, setVideoID] = useState('');
    const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Advanced');
    const [courseType, setCourseType] = useState('Youtube');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('English');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setInstructorName(user.name);
            setInstitutionName(`${user.name}-SkillForge`); // Mock institution name
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to create a course.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const courseData: Omit<Course, 'id' | 'createdAt' | 'materials' | 'topics'> & { videoID: string } = {
                title: courseName,
                description,
                difficulty,
                mentorId: user.id,
                instructorName,
                institutionName,
                publishDate,
                courseType,
                language,
                videoID,
            };
            await api.createCourse(courseData);
            navigate('/mentor/courses');
        } catch (err: any) {
            setError(err.message || 'Failed to create course.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-[#F9F6F2] dark:bg-slate-800 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-8">
                <FileTextIcon className="w-8 h-8 text-[#5D4037] dark:text-slate-300" />
                <h1 className="text-3xl font-bold text-[#5D4037] dark:text-slate-200" style={{ fontFamily: 'serif' }}>New Course</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Course Name */}
                    <FormField label="Course Name" required>
                        <Input id="courseName" value={courseName} onChange={e => setCourseName(e.target.value)} required />
                    </FormField>
                    {/* Enrolled Date */}
                    <FormField label="Enrolled Date" required>
                        <Input id="publishDate" type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} required />
                    </FormField>
                    {/* Instructor Name */}
                    <FormField label="Instructor Name" required>
                        <p className="flex h-10 w-full items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            {instructorName}
                        </p>
                    </FormField>
                    {/* Instructor Institution Name */}
                    <FormField label="Instructor Institution Name" required>
                         <p className="flex h-10 w-full items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                            {institutionName}
                        </p>
                    </FormField>
                    {/* Course Video ID */}
                    <FormField label="Course Video ID (only ID)" required>
                        <Input id="videoID" value={videoID} onChange={e => setVideoID(e.target.value)} placeholder="please mention youtube video ID" required />
                    </FormField>
                    {/* Skill Level */}
                    <FormField label="Skill Level" required>
                        <Select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as any)} required>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </Select>
                    </FormField>
                    {/* Course Type */}
                    <FormField label="Course Type" required>
                         <Select id="courseType" value={courseType} onChange={e => setCourseType(e.target.value)} required>
                            <option>Youtube</option>
                            <option>PDF</option>
                            <option>External Link</option>
                        </Select>
                    </FormField>
                    {/* Course Language */}
                    <FormField label="Course Language" required>
                        <Select id="language" value={language} onChange={e => setLanguage(e.target.value)} required>
                            <option>English</option>
                            <option>Spanish</option>
                            <option>French</option>
                             <option>German</option>
                        </Select>
                    </FormField>
                    {/* Course Description */}
                    <div className="md:col-span-2">
                         <FormField label="Course Description" required>
                            <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4}/>
                        </FormField>
                    </div>
                </div>
                {error && <p className="text-sm text-red-600 text-center pt-4">{error}</p>}
                <div className="flex justify-center pt-6">
                    <Button type="submit" disabled={isSubmitting} className="bg-[#4A0404] hover:bg-[#6a0e0e] text-white rounded-full px-10 py-3 text-lg h-auto flex items-center gap-2">
                        <PlusCircleIcon className="w-6 h-6" />
                        {isSubmitting ? 'Creating...' : 'Add Course'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Form Field Component
const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="space-y-1">
        <label className="text-sm font-bold text-[#5D4037] dark:text-slate-300">
            {label} {required && <span className="text-red-600">*</span>}
        </label>
        {children}
    </div>
);

// Icons
const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);


export default MentorAddCourse;
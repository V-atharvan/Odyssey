import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, Clock, Sparkles,
    Github as GithubIcon, Globe, User, GraduationCap,
    Briefcase, FileText
} from 'lucide-react';
import { studentAPI } from '../../api/api';
import FileUpload from '../common/FileUpload';
import toast from 'react-hot-toast';

export default function StudentForm({ onComplete, onBack }) {
    const [formData, setFormData] = useState({
        bio: '',
        skills: '',
        collegeId: '',
        degree: '',
        department: '',
        graduationYear: new Date().getFullYear(),
        githubUrl: '',
        portfolioUrl: '',
        resumeUrl: '',
        profileImageUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        studentAPI.searchColleges('').then(res => setColleges(res.data.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (formData.collegeId) {
            Promise.all([
                studentAPI.getCollegeDepartments(formData.collegeId),
                studentAPI.getCollegeCourses(formData.collegeId)
            ]).then(([deptRes, courseRes]) => {
                setDepartments(deptRes.data.data || []);
                setCourses(courseRes.data.data || []);
                
                // Reset fields if not in new lists
                if (!deptRes.data.data?.includes(formData.department)) {
                    setFormData(p => ({ ...p, department: '' }));
                }
                if (!courseRes.data.data?.includes(formData.degree)) {
                    setFormData(p => ({ ...p, degree: '' }));
                }
            }).catch(console.error);
        } else {
            setDepartments([]);
            setCourses([]);
        }
    }, [formData.collegeId]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await studentAPI.updateProfile(formData);
            toast.success('Profile completed!');
            onComplete();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <h3 className="font-bold text-text-heading text-xl mb-4">Complete your Profile</h3>

            <div>
                <label className="label">Tell us about yourself (Bio)</label>
                <textarea
                    name="bio"
                    className="input min-h-[100px]"
                    placeholder="I am a second-year Engineering student passionate about full-stack development..."
                    value={formData.bio}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="label">College</label>
                    <select
                        name="collegeId"
                        className="input cursor-pointer"
                        value={formData.collegeId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select your College...</option>
                        {colleges.map(c => (
                            <option key={c.id} value={c.id}>{c.collegeName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Degree / Course</label>
                    <select
                        name="degree"
                        className="input cursor-pointer disabled:opacity-50"
                        value={formData.degree}
                        onChange={handleChange}
                        required
                        disabled={!formData.collegeId || courses.length === 0}
                    >
                        <option value="">Select Degree...</option>
                        {courses.map((course, i) => (
                            <option key={i} value={course}>{course}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Department</label>
                    <select
                        name="department"
                        className="input cursor-pointer disabled:opacity-50"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        disabled={!formData.collegeId || departments.length === 0}
                    >
                        <option value="">Select Department...</option>
                        {departments.map((dept, i) => (
                            <option key={i} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Graduation Year</label>
                    <input
                        name="graduationYear"
                        type="number"
                        className="input"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="label">Skills (comma separated)</label>
                    <input
                        name="skills"
                        className="input"
                        placeholder="Java, React..."
                        value={formData.skills}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">GitHub Profile</label>
                    <input
                        name="githubUrl"
                        className="input"
                        placeholder="github.com/username"
                        value={formData.githubUrl}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="label">Portfolio Link</label>
                    <input
                        name="portfolioUrl"
                        className="input"
                        placeholder="yourportfolio.com"
                        value={formData.portfolioUrl}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
                <FileUpload
                    label="Profile Picture (optional)"
                    type="profile_pictures"
                    accept=".jpg,.jpeg,.png"
                    onUploadComplete={(url) => setFormData(p => ({ ...p, profileImageUrl: url }))}
                />
                <FileUpload
                    label="Resume (mandatory)"
                    type="resumes"
                    accept=".pdf"
                    onUploadComplete={(url) => setFormData(p => ({ ...p, resumeUrl: url }))}
                />
            </div>

            <button type="submit" className="btn-primary w-full py-4 mt-8 flex items-center justify-center gap-2" disabled={loading}>
                {loading ? <span className="spinner w-6 h-6 border-white/30" /> : (
                    <>Finish & Go to Dashboard</>
                )}
            </button>
        </form>
    );
}

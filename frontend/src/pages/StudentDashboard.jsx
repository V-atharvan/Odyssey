import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, Search, ClipboardList, Star, Bell, Bot, 
    CheckCircle2, Clock, Sparkles, XCircle, FileText, LayoutGrid,
    Rocket, User, UploadCloud, Link as LinkIcon, Trash2, Edit3,
    ArrowRight, AlertTriangle, ShieldCheck, Trophy, Briefcase,
    Building2, Calendar, MessageSquare, ChevronRight, TrendingUp,
    Award, AlertCircle, Check
} from 'lucide-react';
import { 
    LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { studentAPI, projectAPI } from '../api/api';
import toast from 'react-hot-toast';
import ProjectExplorer from '../components/student/ProjectExplorer';
import ProfileSettings from '../components/common/ProfileSettings';
import SettingsPage from '../components/common/SettingsPage';
import FileUpload from '../components/common/FileUpload';
import { analyticsEvents } from '../firebase/analytics';

// ─────────────────────────────────────────────────
// Mission Control Components
// ─────────────────────────────────────────────────







// ─────────────────────────────────────────────────
// Original Helpers (Preserved)
// ─────────────────────────────────────────────────
function StarRating({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} className={s <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-text-muted'} />
            ))}
        </div>
    );
}



// ...Modal components preserved...
function ResumeUploadModal({ currentUrl, onClose, onSave }) {
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [urlInput, setUrlInput] = useState(currentUrl || '');
    const [mode, setMode] = useState('upload'); 
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        const targetUrl = mode === 'upload' ? uploadedUrl : urlInput.trim();
        if (!targetUrl) { 
            toast.error(mode === 'upload' ? 'Please upload a resume first' : 'Please provide a resume URL'); 
            return; 
        }
        setLoading(true);
        try {
            await studentAPI.updateProfile({ resumeUrl: targetUrl });
            toast.success('Resume saved! ✨');
            analyticsEvents.resumeUploaded(mode);
            onSave(targetUrl);
            onClose();
        } catch {
            toast.error('Failed to save resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="card w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-text-heading uppercase tracking-normal">📄 Resume Upload</h3>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-heading rounded-xl hover:bg-surface-50 transition-all leading-none text-2xl">×</button>
                </div>
                <div className="flex gap-1 bg-surface-50 rounded-2xl p-1 mb-5">
                    {['upload', 'url'].map(m => (
                        <button key={m} onClick={() => setMode(m)}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                ${mode === m ? 'bg-primary-600 text-white shadow-lg scale-105' : 'text-text-body hover:text-text-heading'}`}>
                            {m === 'upload' ? <UploadCloud size={16} /> : <LinkIcon size={16} />}
                            {m === 'upload' ? 'Upload PDF' : 'Paste URL'}
                        </button>
                    ))}
                </div>
                {mode === 'upload' ? (
                    <FileUpload
                        label="Select PDF Resume"
                        type="resumes"
                        accept=".pdf"
                        onUploadComplete={(url) => setUploadedUrl(url)}
                    />
                ) : (
                    <div>
                        <label className="label uppercase text-[10px] tracking-widest">Resume URL</label>
                        <input className="input" placeholder="https://drive.google.com/file/d/..."
                            value={urlInput} onChange={e => setUrlInput(e.target.value)} />
                    </div>
                )}
                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="btn-secondary flex-1 py-4 uppercase font-black tracking-widest text-[10px]">Cancel</button>
                    <button onClick={handleSave} className="btn-primary flex-1 py-4 uppercase font-black tracking-widest text-[10px]" disabled={loading}>
                        {loading ? <span className="spinner w-4 h-4" /> : 'Save Resume'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Replaced by centralized ProfileSettings


function ApplicationDetailModal({ app, onClose }) {
    const statusIcon = { 
        PENDING: <Clock size={16} className="text-amber-500" />, 
        SHORTLISTED: <Sparkles size={16} className="text-primary-500" />, 
        ACCEPTED: <Rocket size={16} className="text-emerald-500" />, 
        COMPLETED: <CheckCircle2 size={16} className="text-blue-500" />, 
        REJECTED: <XCircle size={16} className="text-red-500" /> 
    };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card w-full max-w-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/50 to-transparent" />
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-text-heading uppercase tracking-normal">Application Status</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-text-heading text-3xl leading-none">×</button>
                </div>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em] mb-2">Target Project</p>
                        <p className="text-lg font-black text-text-heading leading-tight">{app.projectTitle}</p>
                    </div>
                    <div className="flex gap-10">
                        <div>
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em] mb-2">Process Phase</p>
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center shadow-inner border border-white/40">{statusIcon[app.status] || '❓'}</span>
                                <StatusBadge status={app.status} />
                            </div>
                        </div>
                    </div>
                    {app.pitch && (
                        <div className="bg-surface-50/50 rounded-2xl p-5 border border-white/20 relative">
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.2em] mb-3">Your Pitch Reflection</p>
                            <p className="text-sm text-text-body leading-relaxed italic font-medium opacity-80">
                                "{app.pitch}"
                            </p>
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="btn-secondary w-full mt-10 py-4 uppercase font-black tracking-widest text-xs">Return to Dashboard</button>
            </motion.div>
        </div>
    );
}

// AssessmentsView removed
function AssessmentsView_REMOVED() { return null; }
function AssessmentsView_REMOVED_PLACEHOLDER() {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeAssessment, setActiveAssessment] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await studentAPI.getAssessments();
                setAssessments(res.data?.data || []);
            } catch (err) {
                toast.error("Failed to load assessments feed");
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    // Timer logic
    useEffect(() => {
        if (activeAssessment && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [activeAssessment, timeLeft]);

    const startTest = (test) => {
        setActiveAssessment(test);
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(test.questions.length).fill(-1));
        setTimeLeft(test.durationMinutes * 60);
        setResult(null);
        analyticsEvents.assessmentStarted(test.id, test.subject);
    };

    const handleSelectOption = (optIdx) => {
        setSelectedAnswers(prev => {
            const next = [...prev];
            next[currentQuestionIndex] = optIdx;
            return next;
        });
    };

    const handleAutoSubmit = () => {
        toast.error("Time is up! Auto-submitting answers...");
        submitTest();
    };

    const submitTest = async () => {
        if (!activeAssessment) return;
        setSubmitting(true);
        
        // Pad unanswered questions with -1
        const finalAnswers = selectedAnswers.map(ans => ans === -1 ? 0 : ans);

        try {
            const res = await studentAPI.submitAssessment({
                assessmentId: activeAssessment.id,
                answers: finalAnswers
            });
            
            const resData = res.data?.data;
            setResult(resData);
            analyticsEvents.assessmentCompleted(
                activeAssessment.id,
                resData?.score || 0,
                resData?.passed || false
            );
            
            if (res.data?.data?.passed) {
                toast.success("Congratulations! You passed the assessment!");
                // Trigger profile update inside main dashboard state
                studentAPI.getProfile().then(profileRes => {
                    if (onUpdatedProfile) onUpdatedProfile(profileRes.data.data);
                });
            } else {
                toast.error("Assessment not passed. You can try again!");
            }
            
            // Clean up state
            setActiveAssessment(null);
            if (timerRef.current) clearInterval(timerRef.current);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to grade assessment submission");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Syncing Assessment Engine...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pt-4">
            <div>
                <h2 className="text-4xl font-black text-white tracking-normal uppercase">Skill assessments</h2>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1.5">Verify your proficiency to unlock platform score multipliers</p>
            </div>

            {/* In-Test Workspace Overlay */}
            {activeAssessment && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-surface-900 border border-white/10 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl space-y-8"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px]" />
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                        <div>
                            <span className="text-[9px] text-primary-400 font-black uppercase tracking-[0.2em]">{activeAssessment.subject} Assessment</span>
                            <h3 className="text-xl font-black text-white uppercase mt-1">{activeAssessment.title}</h3>
                        </div>
                        <div className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                            <p className="text-[8px] text-amber-500 font-extrabold uppercase tracking-widest leading-none mb-1">Time Remaining</p>
                            <p className="text-lg font-black text-amber-400 font-mono leading-none">{formatTime(timeLeft)}</p>
                        </div>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex gap-2">
                        {activeAssessment.questions.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-2 flex-1 rounded-full transition-all duration-300
                                    ${idx === currentQuestionIndex ? 'bg-primary-500' : selectedAnswers[idx] !== -1 ? 'bg-emerald-500/50' : 'bg-white/10'}`}
                            />
                        ))}
                    </div>

                    {/* Question Content */}
                    <div className="space-y-6 min-h-[160px]">
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}</p>
                        <p className="text-lg font-bold leading-normal">{activeAssessment.questions[currentQuestionIndex].text}</p>
                    </div>

                    {/* Options list */}
                    <div className="grid gap-4">
                        {activeAssessment.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                            const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                            return (
                                <button
                                    key={optIdx}
                                    onClick={() => handleSelectOption(optIdx)}
                                    className={`w-full p-5 rounded-2xl text-left border font-semibold text-sm transition-all flex items-center justify-between group
                                        ${isSelected ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-600/10' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                >
                                    <span>{opt}</span>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all
                                        ${isSelected ? 'border-white bg-white text-primary-600' : 'border-white/20 group-hover:border-white/40'}`}>
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Nav Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 transition-all disabled:opacity-30"
                        >
                            Previous
                        </button>

                        {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary-600 border border-primary-500 text-white hover:bg-primary-700 transition-all shadow-lg"
                            >
                                Next Question
                            </button>
                        ) : (
                            <button
                                onClick={submitTest}
                                disabled={submitting}
                                className="px-10 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-600 border border-emerald-500 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                            >
                                {submitting ? "Grading..." : "Submit Assessment"}
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Available Tests List Grid */}
            {!activeAssessment && (
                <div className="grid md:grid-cols-3 gap-6">
                    {assessments.map(test => {
                        // Check if student already has this skill verified on profile to show badge
                        const skillVerified = studentProfile?.skills != null && 
                            studentProfile.skills.toLowerCase().includes(test.subject.toLowerCase());

                        return (
                            <div 
                                key={test.id} 
                                className="bg-surface-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col justify-between min-h-[260px] hover:border-primary-500/30 transition-all relative overflow-hidden group shadow-premium"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[40px]" />
                                
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[8px] bg-white/5 border border-white/10 text-primary-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                                            {test.subject}
                                        </span>
                                        {skillVerified && (
                                            <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                                                <Award size={10} /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase group-hover:text-primary-400 transition-colors">{test.title}</h3>
                                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-4">
                                        {test.questionCount} Questions · {test.durationMinutes} Minutes
                                    </p>
                                </div>

                                <button
                                    onClick={() => startTest(test)}
                                    className={`w-full mt-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-center
                                        ${skillVerified 
                                            ? 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10' 
                                            : 'bg-primary-600 border border-primary-500 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/10'}`}
                                >
                                    {skillVerified ? "Retake Challenge" : "Challenge Test"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Scoring Result Modal Card */}
            {result && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="bg-surface-900 border border-white/10 rounded-[3rem] p-10 max-w-xl mx-auto text-center relative overflow-hidden shadow-2xl space-y-8"
                >
                    <div className="absolute inset-0 bg-primary-500/5 blur-[80px]" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg border
                            ${result.passed ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                            {result.passed ? <Trophy size={36} /> : <AlertCircle size={36} />}
                        </div>

                        <h3 className="text-2xl font-black uppercase text-white tracking-normal leading-none">
                            {result.passed ? "Assessment Passed!" : "Assessment Failed"}
                        </h3>
                        <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mt-2">{result.feedbackMessage}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-extrabold text-white/40 uppercase tracking-[0.2em] mb-1">SCORE SECURED</p>
                            <p className="text-3xl font-black text-white tracking-normal">{result.scorePercent.toFixed(0)}%</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[8px] font-extrabold text-white/40 uppercase tracking-[0.2em] mb-1">PERFORMANCE SCORE</p>
                            <p className="text-3xl font-black text-emerald-400 tracking-normal">{result.performanceScoreUpdated.toFixed(0)}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setResult(null)}
                        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all relative z-10"
                    >
                        Acknowledge Scorecard
                    </button>
                </motion.div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────
const TABS = ['projects', 'reviews', 'resume', 'settings'];

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [profile, setProfile] = useState(null);
    const [myApplications, setMyApplications] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('projects');
    const [viewingApp, setViewingApp] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [projectsCount, setProjectsCount] = useState(0);

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path === 'student' || path === '') setActiveTab('projects');
        else if (TABS.includes(path)) setActiveTab(path);
    }, [location.pathname]);

    const fetchData = async () => {
        try {
            const results = await Promise.allSettled([
                studentAPI.getProfile(),
                projectAPI.getMyApplications(),
                studentAPI.getReviews(),
            ]);

            if (results[0].status === 'fulfilled') setProfile(results[0].value.data.data);
            if (results[1].status === 'fulfilled') setMyApplications(results[1].value.data.data || []);
            if (results[2].status === 'fulfilled') setReviews(results[2].value.data.data || []);

        } catch (error) {
            console.error('Critical Dashboard Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Syncing with Odyssey...</p>
                </div>
            </DashboardLayout>
        );
    }

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 4.5;

    const notifications = [
        ...myApplications.map(a => ({
            id: `app-${a.id}`,
            type: 'info',
            icon: '📋',
            title: `Application update: ${a.projectTitle}`,
            subtitle: `Status: ${a.status}`,
            time: a.appliedAt,
        })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    return (
        <DashboardLayout>
            <AnimatePresence>
                {viewingApp && <ApplicationDetailModal app={viewingApp} onClose={() => setViewingApp(null)} />}
                {uploadingResume && <ResumeUploadModal currentUrl={profile?.resumeUrl} onClose={() => setUploadingResume(false)} onSave={(url) => setProfile(p => ({ ...p, resumeUrl: url }))} />}
            </AnimatePresence>


            {/* Verification Alert (Premium Variant) */}
            {profile?.verificationStatus !== 'VERIFIED' && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-10 p-6 glass border-amber-500/20 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-amber-500/5 transition-opacity group-hover:opacity-10" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner group-hover:rotate-12 transition-transform">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <p className="text-amber-900 font-black uppercase tracking-normal">Identity Verification Pending</p>
                            <p className="text-amber-800/60 text-xs font-bold mt-1 leading-relaxed">
                                Our curators are reviewing your profile. You can explore the feed but project applications are locked until your identity is confirmed.
                            </p>
                        </div>
                        <button className="text-xs font-black uppercase text-amber-900 flex items-center gap-2 hover:translate-x-1 transition-transform">
                            Learn More <ArrowRight size={14} />
                        </button>
                    </div>
                </motion.div>
            )}



            {/* Rest of the tabs (Preserved & Premium-ized) */}


            {/* ═══════════════ STUDENT DASHBOARD OVERVIEW ═══════════════ */}
            {activeTab === 'projects' && (
                <div className="animate-fade-in pt-4 space-y-12">

                    {/* ── KPI Cards Grid ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { 
                                label: "Portfolio Completion", 
                                value: `${Math.min(100, Math.round(
                                    ((profile?.resumeUrl ? 20 : 0) + 
                                    (profile?.githubUrl ? 20 : 0) + 
                                    (profile?.portfolioUrl ? 20 : 0) +
                                    (profile?.skills ? 20 : 0) + 
                                    (profile?.bio ? 20 : 0))
                                ))}%`, 
                                icon: <Trophy size={22} />, 
                                color: "primary" 
                            },
                            { label: "Applied Projects", value: myApplications.length, icon: <ClipboardList size={22} />, color: "accent" },
                            { label: "Active Projects", value: myApplications.filter(a => a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS').length, icon: <Rocket size={22} />, color: "emerald" },
                            { label: "Verification", value: profile?.verificationStatus === 'VERIFIED' ? '✓ Verified' : 'Pending', icon: <ShieldCheck size={22} />, color: profile?.verificationStatus === 'VERIFIED' ? "emerald" : "amber" },
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <StatCard {...stat} />
                            </motion.div>
                        ))}
                    </div>

                    {/* ── Two-Column: Radar + Kanban ── */}
                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* Skill Readiness Radar Chart */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl"
                        >
                            <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Award size={18} className="text-primary-500" /> Skill Readiness
                            </h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart 
                                        data={(() => {
                                            const skills = profile?.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];
                                            const defaultSkills = ['Java', 'Spring', 'React', 'DSA', 'Communication', 'Problem Solving'];
                                            const displaySkills = skills.length >= 3 ? skills.slice(0, 6) : defaultSkills;
                                            return displaySkills.map(skill => ({
                                                skill: skill.length > 12 ? skill.substring(0, 10) + '..' : skill,
                                                level: skills.includes(skill) ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 30,
                                                fullMark: 100
                                            }));
                                        })()}
                                    >
                                        <PolarGrid stroke="rgba(99,102,241,0.15)" />
                                        <PolarAngleAxis 
                                            dataKey="skill" 
                                            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 800 }} 
                                        />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar 
                                            dataKey="level" 
                                            stroke="#6366f1" 
                                            fill="#6366f1" 
                                            fillOpacity={0.25} 
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Application Tracker — Kanban Style */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl"
                        >
                            <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                <ClipboardList size={18} className="text-primary-500" /> Application Tracker
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { stage: 'Applied', count: myApplications.filter(a => a.status === 'PENDING').length, color: 'bg-slate-500', barColor: 'bg-slate-500/30' },
                                    { stage: 'Shortlisted', count: myApplications.filter(a => a.status === 'SHORTLISTED').length, color: 'bg-primary-500', barColor: 'bg-primary-500/30' },
                                    { stage: 'Interview', count: myApplications.filter(a => a.status === 'INTERVIEW').length, color: 'bg-amber-500', barColor: 'bg-amber-500/30' },
                                    { stage: 'Assigned', count: myApplications.filter(a => a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS').length, color: 'bg-emerald-500', barColor: 'bg-emerald-500/30' },
                                    { stage: 'Completed', count: myApplications.filter(a => a.status === 'COMPLETED').length, color: 'bg-blue-500', barColor: 'bg-blue-500/30' },
                                ].map((item, i) => {
                                    const total = Math.max(myApplications.length, 1);
                                    const pct = Math.round((item.count / total) * 100);
                                    return (
                                        <div key={i} className="flex items-center gap-4 group">
                                            <span className="w-24 text-[10px] font-black uppercase tracking-widest text-text-muted">{item.stage}</span>
                                            <div className="flex-1 h-8 rounded-xl bg-surface-50 dark:bg-white/5 border border-border relative overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.max(pct, item.count > 0 ? 8 : 0)}%` }}
                                                    transition={{ duration: 1, delay: i * 0.15 }}
                                                    className={`h-full rounded-xl ${item.color} flex items-center justify-end px-3`}
                                                >
                                                    {item.count > 0 && (
                                                        <span className="text-[9px] font-black text-white">{item.count}</span>
                                                    )}
                                                </motion.div>
                                            </div>
                                            <span className="w-8 text-right text-sm font-black text-text-heading">{item.count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Two-Column: Portfolio Progress + Recent Activity ── */}
                    <div className="grid lg:grid-cols-2 gap-8">

                        {/* Portfolio Progress */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl"
                        >
                            <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" /> Portfolio Progress
                            </h3>
                            {(() => {
                                const items = [
                                    { label: 'Resume', done: !!profile?.resumeUrl, icon: '📄' },
                                    { label: 'GitHub', done: !!profile?.githubUrl, icon: '💻' },
                                    { label: 'LinkedIn / Portfolio', done: !!profile?.portfolioUrl, icon: '🔗' },
                                    { label: 'Skills', done: !!(profile?.skills && profile.skills.length > 2), icon: '⚡' },
                                    { label: 'Bio / About', done: !!(profile?.bio && profile.bio.length > 10), icon: '✍️' },
                                ];
                                const doneCount = items.filter(i => i.done).length;
                                const pct = Math.round((doneCount / items.length) * 100);
                                return (
                                    <>
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="relative w-20 h-20 shrink-0">
                                                <svg className="w-full h-full -rotate-90 transform">
                                                    <circle cx="40" cy="40" r="34" className="text-surface-100 dark:text-white/5 stroke-current" strokeWidth="8" fill="transparent" />
                                                    <motion.circle 
                                                        cx="40" cy="40" r="34"
                                                        className="text-emerald-500 stroke-current"
                                                        strokeWidth="8"
                                                        strokeDasharray={213.6}
                                                        initial={{ strokeDashoffset: 213.6 }}
                                                        animate={{ strokeDashoffset: 213.6 - (213.6 * pct) / 100 }}
                                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                                        fill="transparent"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-lg font-black text-text-heading">{pct}%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-text-heading">{doneCount}/{items.length}</p>
                                                <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Sections Complete</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {items.map((item, i) => (
                                                <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                                    item.done 
                                                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                                                        : 'bg-surface-50 dark:bg-white/5 border-border'
                                                }`}>
                                                    <span className="text-lg">{item.icon}</span>
                                                    <span className={`text-sm font-bold flex-1 ${item.done ? 'text-text-heading' : 'text-text-muted'}`}>{item.label}</span>
                                                    {item.done 
                                                        ? <CheckCircle2 size={18} className="text-emerald-500" />
                                                        : <XCircle size={18} className="text-text-muted opacity-30" />
                                                    }
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl"
                        >
                            <h3 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                <Clock size={18} className="text-amber-500" /> Recent Activity
                            </h3>
                            <div className="space-y-1">
                                {(() => {
                                    const activities = [
                                        ...myApplications.slice(0, 3).map(a => ({
                                            icon: '📋',
                                            text: `Applied to ${a.projectTitle || a.companyName || 'a project'}`,
                                            time: a.appliedAt,
                                            color: 'primary'
                                        })),
                                        ...(profile?.resumeUrl ? [{ icon: '📄', text: 'Portfolio Updated', time: new Date().toISOString(), color: 'emerald' }] : []),
                                        ...(profile?.verificationStatus === 'VERIFIED' ? [{ icon: '✅', text: 'Student Verification Approved', time: new Date().toISOString(), color: 'emerald' }] : []),
                                        ...(myApplications.filter(a => a.status === 'ACCEPTED').slice(0, 1).map(a => ({
                                            icon: '🚀',
                                            text: `Project Assigned: ${a.projectTitle || 'New Project'}`,
                                            time: a.appliedAt,
                                            color: 'blue'
                                        }))),
                                    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

                                    if (activities.length === 0) {
                                        return <p className="text-text-muted italic text-sm font-bold py-8 text-center opacity-60">No recent activity recorded</p>;
                                    }

                                    return activities.map((act, i) => (
                                        <div key={i} className="flex items-start gap-4 py-3 border-b border-border last:border-0 group">
                                            <div className="w-10 h-10 rounded-xl bg-surface-50 dark:bg-white/5 border border-border flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                                                {act.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-text-heading leading-tight">{act.text}</p>
                                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">
                                                    {act.time ? new Date(act.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                                                </p>
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Discovery Feed Section ── */}
                    <div className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div>
                                <h2 className="text-5xl font-black text-text-heading tracking-normal uppercase leading-none mb-3">Discovery Feed</h2>
                                <p className="text-text-muted font-bold opacity-60 text-lg">Hand-picked challenges for your skill level.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 px-4 py-2 bg-primary-500/10 rounded-full">{projectsCount} {projectsCount === 1 ? 'Opening' : 'Openings'} Available</span>
                            </div>
                        </div>
                        <ProjectExplorer studentProfile={profile} onProjectsLoaded={(projects) => setProjectsCount(projects.length)} />
                    </div>
                </div>
            )}

            {activeTab === 'applications' && (
                <div className="space-y-12 animate-fade-in pt-8">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h2 className="text-5xl font-black text-text-heading tracking-normal uppercase leading-none mb-3">Your Pursuit List</h2>
                            <p className="text-text-muted font-bold opacity-60 text-lg">Tracking your journey across active projects.</p>
                        </div>
                    </div>
                    {myApplications.length === 0 ? (
                        <div className="glass-card text-center py-32 rounded-[3rem] border-white/20">
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <ClipboardList size={100} className="text-primary-500/10 mb-8 mx-auto" />
                                <h3 className="text-3xl font-black text-text-heading uppercase tracking-normal mb-3">No active applications</h3>
                                <p className="text-text-muted font-bold text-lg mb-12 opacity-60">The world is waiting for your skills. Start your first pursuit.</p>
                                <button onClick={() => setActiveTab('projects')} className="btn-primary py-5 px-16 rounded-2xl uppercase font-black tracking-widest shadow-2xl">Explore Opportunity</button>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myApplications.map((app, i) => (
                                <motion.div 
                                    key={app.id} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setViewingApp(app)} 
                                    className="glass p-8 rounded-[2rem] hover:border-primary-500/40 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary-500/10"
                                >
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-16 h-16 rounded-2xl bg-surface-900 text-white flex items-center justify-center font-black text-2xl border border-white/10 shadow-xl group-hover:rotate-6 transition-transform">
                                            {app.projectTitle[0]}
                                        </div>
                                        <StatusBadge status={app.status} />
                                    </div>
                                    <h3 className="text-xl font-black group-hover:text-primary-600 transition-colors uppercase tracking-normal leading-none mb-2">{app.projectTitle}</h3>
                                    <p className="text-[10px] text-primary-500 font-black uppercase tracking-widest mb-6">{app.companyName}</p>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50 border-t border-white/10 pt-6">
                                        <span>Applied</span>
                                        <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="space-y-10 animate-fade-in pt-4">
                    <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase mb-10">Talent Reputation</h2>
                    {reviews.length === 0 ? (
                        <div className="glass text-center py-32 rounded-[2.5rem] opacity-40 italic font-bold">No verified feedback recorded yet.</div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((r, i) => (
                                <motion.div key={r.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass p-8 rounded-3xl flex flex-col md:flex-row gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Star size={100} />
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0 uppercase">{r.companyName[0]}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-lg font-black uppercase tracking-normal text-text-heading">{r.companyName}</span>
                                            <div className="flex items-center gap-3">
                                                 <StarRating rating={r.rating} />
                                                 <span className="text-xs font-black px-2 py-1 bg-white border border-border rounded-lg">{r.rating}.0</span>
                                            </div>
                                        </div>
                                        <p className="text-text-body font-bold italic leading-relaxed opacity-80">
                                            "{r.comment}"
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}



            {activeTab === 'resume' && (
                <div className="space-y-10 animate-fade-in pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                        <div>
                             <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase">Documentation</h2>
                             <p className="text-text-muted mt-2 font-bold opacity-60">Manage your verified professional assets.</p>
                        </div>
                        <button onClick={() => setUploadingResume(true)} className="btn-primary py-4 px-8 rounded-2xl uppercase font-black tracking-widest text-xs flex items-center gap-3">
                            <UploadCloud size={18} /> Update Asset
                        </button>
                    </div>
                    {profile?.resumeUrl ? (
                         <div className="glass p-8 rounded-[2.5rem] flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-surface-900 text-white flex items-center justify-center text-3xl shadow-xl group-hover:rotate-12 transition-transform">📄</div>
                                <div>
                                    <p className="text-xl font-black text-text-heading tracking-normal uppercase">Main Professional CV</p>
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60">Last updated {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => window.open(profile.resumeUrl)} className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-inner">
                                <ChevronRight size={24} />
                            </button>
                         </div>
                    ) : (
                        <div className="glass text-center py-24 rounded-[2.5rem]">
                            <FileText size={60} className="text-surface-100/10 mb-6 mx-auto" />
                            <p className="text-text-muted font-black uppercase tracking-widest mb-10 opacity-60">No documentation on file.</p>
                            <button onClick={() => setUploadingResume(true)} className="btn-primary py-4 px-10 rounded-2xl uppercase tracking-widest font-black text-xs">Upload Portfolio PDF</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'notifications' && (
                <div className="space-y-6 animate-fade-in pt-4">
                    <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase mb-10">Global Activity Log</h2>
                    {notifications.length === 0 ? <p className="text-text-muted italic py-10">The air is silent. No activity recorded.</p> : (
                        <div className="space-y-4">
                            {notifications.map((n, i) => (
                                <motion.div 
                                    key={n.id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-6 glass rounded-2xl flex items-center gap-6 group hover:border-white/40 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-surface-50 flex items-center justify-center text-text-muted shadow-inner group-hover:rotate-6 transition-transform">
                                        <ClipboardList size={22} className="text-primary-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-text-heading group-hover:text-primary-600 transition-colors uppercase tracking-normal leading-none mb-1">{n.title}</p>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60 ">{n.subtitle || 'System recorded event'}</p>
                                    </div>
                                    <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40">{new Date(n.time).toLocaleDateString()}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'assessments' && (
                <AssessmentsView studentProfile={profile} onUpdatedProfile={(updated) => setProfile(updated)} />
            )}
            {activeTab === 'settings' && <SettingsPage user={user} />}
        </DashboardLayout>
    );
}

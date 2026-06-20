import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Home, GraduationCap, CheckCircle2, Folder, 
    TrendingUp, Search, Building2, Users,
    X, Briefcase, User, Calendar, Clock, AlertTriangle,
    BarChart3, PieChart as PieChartIcon, ShieldCheck, ShieldAlert,
    FileText, LayoutGrid, Rocket, MoreVertical, Trash2,
    Trophy, Star, School, ChevronRight, Zap,
    Upload, Cloud, AlertCircle, Check, FileDown, Eye,
    Github, Globe, FileCheck, Mail, MapPin
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import CompanyRequests from '../components/college/CompanyRequests';
import ProfileSettings from '../components/common/ProfileSettings';
import SettingsPage from '../components/common/SettingsPage';
import { collegeAPI } from '../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

// ─── Constants ─────────────────────────────────────────────────────────────
const STATUS_COLORS = {
    VERIFIED: '#10b981', PENDING: '#f59e0b', REJECTED: '#ef4444',
    COMPLETED: '#10b981', IN_PROGRESS: '#6366f1', ASSIGNED: '#3b82f6',
    SUBMITTED: '#8b5cf6', OPEN: '#f59e0b', CANCELLED: '#ef4444',
};
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

// ─── Mission Control Components ─────────────────────────────────────────────

// Logic removed for cleaner UI - focusing on Actionable Data


function ActionQueue({ pendingCount = 0, onVerify }) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[60px]" />
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                    <Zap size={24} />
                </div>
                <div>
                    <h3 className="font-black uppercase tracking-normal text-xl text-text-heading">Critical Queue</h3>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">Immediate Attention Required</p>
                </div>
            </div>
            
            <div className="space-y-4 relative z-10">
                <div className="p-4 bg-surface-50 dark:bg-white/5 rounded-2xl border border-border flex items-center justify-between group cursor-pointer hover:bg-surface-100 dark:hover:bg-white/10 transition-colors" onClick={onVerify}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-black">
                            {pendingCount}
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-normal text-text-heading">Student Verifications</p>
                            <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">Awaiting Institutional Approval</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-text-heading transition-colors" />
                </div>
                
                <div className="p-4 bg-surface-50 dark:bg-white/5 rounded-2xl border border-border flex items-center justify-between group cursor-pointer hover:bg-surface-100 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-500 font-black">
                            2
                        </div>
                        <div>
                            <p className="text-sm font-black tracking-normal text-text-heading">Partnership Requests</p>
                            <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">New Company Connections</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-text-heading transition-colors" />
                </div>
            </div>
            
            <button onClick={onVerify} className="mt-10 btn-primary w-full py-4 text-[10px] uppercase font-black tracking-[0.3em] shadow-lg shadow-primary-500/20">Access Verification Portal</button>
        </motion.div>
    );
}

function CsvUploader({ onImportFinished }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.csv')) {
                setFile(droppedFile);
                setResult(null);
            } else {
                toast.error("Please drop a valid CSV file");
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.csv')) {
                setFile(selectedFile);
                setResult(null);
            } else {
                toast.error("Only CSV files are supported");
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const res = await collegeAPI.bulkImportStudents(file);
            setResult(res.data.data);
            toast.success("Bulk import processing completed");
            if (onImportFinished) onImportFinished(res.data.data);
            setFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to parse CSV file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Drag & Drop Area */}
            <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]
                    ${dragActive ? 'border-primary-500 bg-primary-500/5 scale-[0.99]' : 'border-border hover:border-primary-500/40 bg-surface-50 dark:bg-white/5'}`}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[60px]" />
                <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-white/5 border border-border flex items-center justify-center text-primary-400 mb-6 group-hover:scale-110 transition-transform">
                    <Cloud size={28} className={uploading ? "animate-bounce" : ""} />
                </div>

                {file ? (
                    <div className="space-y-4">
                        <p className="text-lg font-black text-text-heading uppercase tracking-normal">{file.name}</p>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{(file.size / 1024).toFixed(2)} KB</p>
                        <div className="flex gap-4 justify-center mt-6">
                            <button 
                                onClick={() => setFile(null)} 
                                disabled={uploading}
                                className="px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-surface-50 dark:bg-white/5 border border-border text-text-heading hover:bg-surface-100 dark:hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpload} 
                                disabled={uploading}
                                className="px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary-600 border border-primary-500 text-white hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-50"
                            >
                                {uploading ? "Uploading & Parsing..." : "Execute Bulk Import"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-xl font-black text-text-heading tracking-normal uppercase">Drag & Drop Student CSV</p>
                        <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mt-2">or select file manually from device</p>
                        
                        <label className="mt-8 inline-block px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-surface-100 dark:bg-white/10 border border-border text-text-heading hover:bg-surface-200 dark:hover:bg-white/20 transition-all cursor-pointer">
                            Browse Files
                            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                )}
            </div>

            {/* Results Report Card */}
            {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="glass-card border border-border rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl space-y-8"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[60px]" />
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-normal text-text-heading">Import Status Report</h3>
                            <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-0.5">Execution Summary Completed</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-surface-50 dark:bg-white/5 rounded-2xl border border-border text-center">
                            <p className="text-[8px] font-extrabold text-text-muted uppercase tracking-[0.2em] mb-1">TOTAL ROWS</p>
                            <p className="text-2xl font-black text-text-heading tracking-normal">{result.totalProcessed}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <p className="text-[8px] font-extrabold text-emerald-400 uppercase tracking-[0.2em] mb-1">SUCCESS</p>
                            <p className="text-2xl font-black text-emerald-400 tracking-normal">{result.successCount}</p>
                        </div>
                        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-center">
                            <p className="text-[8px] font-extrabold text-red-400 uppercase tracking-[0.2em] mb-1">FAILED</p>
                            <p className="text-2xl font-black text-red-400 tracking-normal">{result.failureCount}</p>
                        </div>
                    </div>

                    {/* Batch Parse Errors details */}
                    {result.errors && result.errors.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Validation Warnings ({result.errors.length})</span>
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-border rounded-2xl p-4 bg-surface-50 dark:bg-white/5">
                                {result.errors.map((err, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] py-1 border-b border-border last:border-0">
                                        <span className="font-extrabold uppercase text-text-muted">Row {err.rowNumber} {err.email && `(${err.email})`}</span>
                                        <span className="font-extrabold text-red-400 uppercase">{err.errorMessage}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}

// ─── Tiny helpers (Preserved) ─────────────────────────────────────────────────────────────
// Logic removed for cleaner UI
const ScoreMeter = ({ value, max = 100, label, color = '#6366f1' }) => {
    return (
        <div className="flex justify-between items-center w-full">
            <span className="text-[11px] font-black uppercase tracking-widest text-text-body">{label}</span>
            <span className="text-sm font-black text-text-heading px-3 py-1 bg-white/50 rounded-lg border border-white/20">{value}</span>
        </div>
    );
};

const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Syncing Institutional Data...</p>
    </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CollegeDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboard, setDashboard] = useState(null);
    const [students, setStudents] = useState([]);
    const [projects, setProjects] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);
    const [studentFilter, setStudentFilter] = useState('ALL');
    const [projectFilter, setProjectFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [verifyingId, setVerifyingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Initial load
    useEffect(() => {
        setLoading(true);
        Promise.allSettled([
            collegeAPI.getDashboard(),
            collegeAPI.getStudents(),
        ]).then(([dashRes, stuRes]) => {
            if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data.data);
            if (stuRes.status === 'fulfilled') setStudents(stuRes.value.data.data || []);
        }).catch(() => toast.error('Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    const handleUpdateStudentStatus = async (studentId, status) => {
        setVerifyingId(studentId);
        try {
            const res = await collegeAPI.verifyStudent(studentId, status);
            setStudents(prev => prev.map(s => s.id === studentId ? res.data.data : s));
            toast.success(`Student ${status.toLowerCase()} successfully`);
        } catch (error) {
            toast.error('Failed to update student status');
        } finally {
            setVerifyingId(null);
        }
    };

    const handleToggleActive = async (studentId) => {
        setTogglingId(studentId);
        try {
            const res = await collegeAPI.toggleStudentStatus(studentId);
            setStudents(prev => prev.map(s => s.id === studentId ? res.data.data : s));
            toast.success('Account status updated');
        } catch (error) {
            toast.error('Failed to update account status');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("CRITICAL WARNING: This will permanently delete the student account from the entire database. This action cannot be undone. Create a backup if necessary. Proceed?")) return;
        try {
            await collegeAPI.deleteStudentAccount(studentId);
            setStudents(prev => prev.filter(s => s.id !== studentId));
            toast.success('Student account permanently deleted');
        } catch (error) {
            toast.error('Failed to permanently delete account');
        }
    };

    // Lazy load tabs
    const loadTab = useCallback(async (tab) => {
        setActiveTab(tab);
        setTabLoading(true);
        try {
            if (tab === 'projects' && projects.length === 0) {
                const r = await collegeAPI.getProjects();
                setProjects(r.data.data || []);
            } else if (tab === 'companies' && companies.length === 0) {
                const r = await collegeAPI.getCompanies();
                setCompanies(r.data.data || []);
            } else if (tab === 'overview' && !analytics) {
                const r = await collegeAPI.getAnalytics();
                setAnalytics(r.data.data);
            }
        } catch { /* silently degrade */ }
        setTabLoading(false);
    }, [projects.length, companies.length, analytics]);

    // Sync tab with URL
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        const validTabs = [ 'overview', 'students', 'verify', 'projects', 'companies', 'settings', 'import' ];
        if (validTabs.includes(path)) {
            loadTab(path);
        } else if (path === 'college' || path === '') {
            loadTab('overview');
        }
    }, [location.pathname, loadTab]);

    const handleVerify = async (studentId, status) => {
        setVerifyingId(studentId);
        try {
            await collegeAPI.verifyStudent(studentId, status);
            setStudents(prev => prev.map(s => s.id === studentId ? { ...s, verificationStatus: status } : s));
            toast.success(`Student ${status.toLowerCase() === 'verified' ? 'verified ✅' : 'rejected ❌'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setVerifyingId(null);
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s => {
            // Exclude PENDING students from the Students tab, as they belong in the Verify tab
            if (s.verificationStatus === 'PENDING') return false; 
            
            if (studentFilter !== 'ALL' && s.verificationStatus !== studentFilter) return false;
            
            if (searchQuery && !s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) && !s.email?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            
            return true;
        });
    }, [students, studentFilter, searchQuery]);

    if (loading) return <DashboardLayout><Spinner /></DashboardLayout>;

    const d = dashboard || {};

    // ── Student Profile Modal ────────────────────────────────────────────
    const StudentProfileModal = ({ student, onClose }) => {
        if (!student) return null;
        return (
            <AnimatePresence>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-card border border-border rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-surface-100 dark:bg-white/5 border border-border text-text-muted hover:text-text-heading transition-all">
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative">
                                {student.profileImageUrl ? (
                                    <img src={student.profileImageUrl} alt={student.fullName} className="w-20 h-20 rounded-2xl object-cover border-2 border-border" />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-primary-500/10 border-2 border-primary-500/20 flex items-center justify-center text-primary-500 font-black text-3xl">
                                        {student.fullName?.[0]}
                                    </div>
                                )}
                                <div className="absolute -bottom-1 -right-1">
                                    <StatusBadge status={student.verificationStatus} />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-heading tracking-normal uppercase">{student.fullName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Mail size={14} className="text-text-muted" />
                                    <span className="text-sm text-text-muted">{student.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-surface-50 dark:bg-white/5 border border-border rounded-2xl p-4">
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-1">Department</p>
                                <p className="text-sm font-bold text-text-heading">{student.department || '—'}</p>
                            </div>
                            <div className="bg-surface-50 dark:bg-white/5 border border-border rounded-2xl p-4">
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-1">Graduation Year</p>
                                <p className="text-sm font-bold text-text-heading">{student.graduationYear || '—'}</p>
                            </div>
                            <div className="bg-surface-50 dark:bg-white/5 border border-border rounded-2xl p-4">
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-1">Performance Score</p>
                                <p className="text-sm font-bold text-text-heading">{student.performanceScore?.toFixed(1) || '0.0'}</p>
                            </div>
                            <div className="bg-surface-50 dark:bg-white/5 border border-border rounded-2xl p-4">
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-1">Completed Projects</p>
                                <p className="text-sm font-bold text-text-heading">{student.completedProjects || 0}</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {student.bio && (
                            <div className="mb-6">
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-2">Bio</p>
                                <p className="text-sm text-text-body leading-relaxed bg-surface-50 dark:bg-white/5 border border-border rounded-2xl p-4">{student.bio}</p>
                            </div>
                        )}

                        {/* Skills */}
                        {student.skills && (
                            <div className="mb-6">
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {student.skills.split(',').map((skill, i) => (
                                        <span key={i} className="text-xs bg-primary-500/10 text-primary-500 font-bold px-3 py-1.5 rounded-lg border border-primary-500/20">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {student.githubUrl && (
                                <a href={student.githubUrl.startsWith('http') ? student.githubUrl : `https://${student.githubUrl}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-white/5 border border-border text-text-heading hover:border-primary-500/40 transition-all text-xs font-bold">
                                    <Github size={16} /> GitHub
                                </a>
                            )}
                            {student.portfolioUrl && (
                                <a href={student.portfolioUrl.startsWith('http') ? student.portfolioUrl : `https://${student.portfolioUrl}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-white/5 border border-border text-text-heading hover:border-primary-500/40 transition-all text-xs font-bold">
                                    <Globe size={16} /> Portfolio
                                </a>
                            )}
                            {student.resumeUrl && (
                                <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-white/5 border border-border text-text-heading hover:border-primary-500/40 transition-all text-xs font-bold">
                                    <FileCheck size={16} /> Resume
                                </a>
                            )}
                        </div>

                        {/* Actions — only show for PENDING students */}
                        {student.verificationStatus === 'PENDING' && (
                            <div className="flex gap-4 pt-6 border-t border-border">
                                <button onClick={() => { handleVerify(student.id, 'REJECTED'); onClose(); }} disabled={verifyingId === student.id}
                                    className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-3.5 rounded-xl uppercase font-black tracking-widest text-[10px] hover:bg-red-500/20 transition-all">
                                    Reject Profile
                                </button>
                                <button onClick={() => { handleVerify(student.id, 'VERIFIED'); onClose(); }} disabled={verifyingId === student.id}
                                    className="flex-1 bg-primary-600 text-white py-3.5 rounded-xl uppercase font-black tracking-widest text-[10px] shadow-xl shadow-primary-600/20 hover:scale-105 transition-all">
                                    Confirm Identity
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    };
    const collegeName = d.collegeName || 'Institutional Dashboard';

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-10">

            {/* Verification Alert (Premium Variant) */}
            {d.verificationStatus && d.verificationStatus !== 'VERIFIED' && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 p-6 glass border-amber-500/20 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-amber-500/5 transition-opacity group-hover:opacity-10" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner group-hover:rotate-12 transition-transform">
                            {d.verificationStatus === 'PENDING' ? <Clock size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <p className="text-amber-900 font-black uppercase tracking-normal">Institutional Profile Under Review</p>
                            <p className="text-amber-800/60 text-xs font-bold mt-1 leading-relaxed">
                                Our administrators are confirming your credentials. You can audit students, but global marketplace interactions are temporarily limited.
                            </p>
                        </div>
                        <div className="px-5 py-2.5 bg-white/60 rounded-xl border border-amber-200 text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] shadow-sm">
                            Phase 2: Admin Approval
                        </div>
                    </div>
                </motion.div>
            )}


            {activeTab === 'overview' && (
                <>
                    {/* ── KPI Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 mt-4">
                         {[
                            { label: "Total Students", value: d.totalStudents || 0, icon: <GraduationCap size={22} />, color: "primary", variant: "strategic", onClick: () => navigate('/college/students') },
                            { label: "Pending Verification", value: d.pendingStudents || 0, icon: <Clock size={22} />, color: "amber", variant: "strategic", onClick: () => navigate('/college/verify') },
                            { label: "Active Connections", value: d.activeCompaniesConnected || 0, icon: <Building2 size={22} />, color: "accent", variant: "strategic", onClick: () => navigate('/college/companies') }
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                <StatCard {...stat} />
                            </motion.div>
                        ))}
                    </div>

                    {/* ── Two-Column: Department Analytics + Verification Status ── */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        
                        {/* Department Analytics Bar Chart */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card border border-border p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h4 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                <BarChart3 size={18} className="text-primary-500" /> Department Analytics
                            </h4>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={(() => {
                                            // Group students by department
                                            const deptMap = {};
                                            students.forEach(s => {
                                                const dept = s.department || 'Unknown';
                                                deptMap[dept] = (deptMap[dept] || 0) + 1;
                                            });
                                            const data = Object.entries(deptMap).map(([name, count]) => ({ name: name.length > 15 ? name.substring(0, 12) + '...' : name, students: count }));
                                            return data.length > 0 ? data.slice(0, 6) : [
                                                { name: 'CSE', students: 45 },
                                                { name: 'ECE', students: 32 },
                                                { name: 'Mech', students: 18 },
                                                { name: 'Civil', students: 12 },
                                            ];
                                        })()}
                                        barSize={35}
                                    >
                                        <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="var(--color-text-muted)" fontSize={9} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(99,102,241,0.05)' }} 
                                            contentStyle={{ background: 'var(--color-surface-card, #0b0f19)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '11px' }} 
                                        />
                                        <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]}>
                                            {(() => {
                                                const deptMap = {};
                                                students.forEach(s => {
                                                    const dept = s.department || 'Unknown';
                                                    deptMap[dept] = (deptMap[dept] || 0) + 1;
                                                });
                                                const data = Object.entries(deptMap);
                                                return (data.length > 0 ? data : [['CSE'], ['ECE'], ['Mech'], ['Civil']]).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ));
                                            })()}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Verification Status Pie Chart */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card border border-border p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h4 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                <PieChartIcon size={18} className="text-emerald-500" /> Verification Status
                            </h4>
                            <div className="h-52 flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={(() => {
                                                const verified = students.filter(s => s.verificationStatus === 'VERIFIED').length;
                                                const pending = students.filter(s => s.verificationStatus === 'PENDING').length;
                                                const rejected = students.filter(s => s.verificationStatus === 'REJECTED').length;
                                                const data = [
                                                    { name: 'Verified', value: verified, color: '#10b981' },
                                                    { name: 'Pending', value: pending, color: '#f59e0b' },
                                                    { name: 'Rejected', value: rejected, color: '#ef4444' },
                                                ].filter(d => d.value > 0);
                                                return data.length > 0 ? data : [
                                                    { name: 'Verified', value: 60, color: '#10b981' },
                                                    { name: 'Pending', value: 25, color: '#f59e0b' },
                                                    { name: 'Rejected', value: 5, color: '#ef4444' },
                                                ];
                                            })()}
                                            cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={70}
                                            paddingAngle={4} dataKey="value"
                                        >
                                            {(() => {
                                                const verified = students.filter(s => s.verificationStatus === 'VERIFIED').length;
                                                const pending = students.filter(s => s.verificationStatus === 'PENDING').length;
                                                const rejected = students.filter(s => s.verificationStatus === 'REJECTED').length;
                                                const data = [
                                                    { name: 'Verified', value: verified, color: '#10b981' },
                                                    { name: 'Pending', value: pending, color: '#f59e0b' },
                                                    { name: 'Rejected', value: rejected, color: '#ef4444' },
                                                ].filter(d => d.value > 0);
                                                const finalData = data.length > 0 ? data : [
                                                    { name: 'Verified', value: 60, color: '#10b981' },
                                                    { name: 'Pending', value: 25, color: '#f59e0b' },
                                                    { name: 'Rejected', value: 5, color: '#ef4444' },
                                                ];
                                                return finalData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ));
                                            })()}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--color-surface-card, #0b0f19)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '11px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                {[
                                    { label: 'Verified', color: 'bg-emerald-500', count: students.filter(s => s.verificationStatus === 'VERIFIED').length },
                                    { label: 'Pending', color: 'bg-amber-500', count: students.filter(s => s.verificationStatus === 'PENDING').length },
                                    { label: 'Rejected', color: 'bg-red-500', count: students.filter(s => s.verificationStatus === 'REJECTED').length },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{item.label}</span>
                                        <span className="text-xs font-black text-text-heading">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Action Queue ── */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <ActionQueue 
                            pendingCount={students.filter(s => s.verificationStatus === 'PENDING').length} 
                            onVerify={() => navigate('/college/verify')} 
                        />
                    </div>

                </>
            )}


            {/* Rest of the Tabs (Students, Verify, Projects, etc.) are kept but with premium motion-divs */}
            {activeTab === 'students' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                        <div className="flex flex-wrap gap-3">
                            {['ALL', 'VERIFIED', 'REJECTED'].map(f => (
                                <button key={f} onClick={() => setStudentFilter(f)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                        ${studentFilter === f ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-surface-50 dark:bg-surface-900 border-border text-text-muted hover:text-text-heading'}`}>
                                    {f} <span className="opacity-30 ml-1">({f === 'ALL' ? students.filter(s => s.verificationStatus !== 'PENDING').length : students.filter(s => s.verificationStatus === f).length})</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4 w-full md:w-auto items-center">
                            <button 
                                onClick={() => loadTab('import')}
                                className="px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary-600 border border-primary-500 text-white hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20"
                            >
                                <Upload size={14} />
                                Bulk Import
                            </button>
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text" value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search registry..."
                                    className="bg-surface-50 dark:bg-surface-900 border border-border w-full pl-12 pr-4 py-3 rounded-xl text-sm font-bold text-text-heading focus:ring-4 ring-primary-500/10 focus:outline-none focus:border-primary-500 transition-all placeholder:text-text-muted"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {filteredStudents.length === 0 ? (
                            <div className="glass-card border border-border text-center py-32 rounded-[3rem] text-text-muted italic font-black uppercase tracking-[0.3em]">No verified students found</div>
                        ) : filteredStudents.map((s, i) => (
                             <motion.div key={s.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card border border-border p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary-500/40 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-5 flex-1 min-w-0 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-white/5 border border-border flex items-center justify-center text-text-heading font-black text-xl group-hover:scale-110 transition-transform">{s.fullName?.[0]}</div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-black text-text-heading tracking-normal uppercase leading-none mb-1">{s.fullName}</p>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest truncate">{s.email} · {s.department} · Batch {s.graduationYear}</p>
                                        {s.skills && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {s.skills.split(',').slice(0, 5).map(sk => (
                                                    <span key={sk} className="text-[9px] bg-primary-500/10 text-primary-400 font-black px-2 py-0.5 rounded-md uppercase tracking-wider border border-primary-500/20">{sk.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 relative z-10">
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase font-black tracking-widest text-text-muted mb-1">Performance</p>
                                        <p className="text-lg font-black text-text-heading tracking-normal">{s.performanceScore.toFixed(1)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase font-black tracking-widest text-text-muted mb-1">Projects</p>
                                        <p className="text-lg font-black text-text-heading tracking-normal">{s.completedProjects || 0}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 ml-4">
                                        
                                        <button
                                            onClick={() => handleToggleActive(s.id)}
                                            disabled={togglingId === s.id}
                                            className={`p-2 rounded-xl transition-all disabled:opacity-50 border ${
                                                s.active 
                                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                            }`}
                                            title={s.active ? 'Suspend Account' : 'Activate Account'}
                                        >
                                            {s.active ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                                        </button>

                                        <button
                                            onClick={() => handleDeleteStudent(s.id)}
                                            className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                            title="Permanently Delete Database Record"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <StatusBadge status={s.verificationStatus} />
                                    </div>
                                </div>
                             </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {activeTab === 'verify' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 space-y-8">
                     <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase mb-10">Trust Verification Center</h2>
                     {students.filter(s => s.verificationStatus === 'PENDING').length === 0 ? (
                        <div className="glass-card border border-border text-center py-32 rounded-[3rem] text-text-muted italic font-black uppercase tracking-[0.3em]">Global student trust is currently at 100%</div>
                     ) : (
                        <div className="grid gap-6">
                             {students.filter(s => s.verificationStatus === 'PENDING').map(s => (
                                <motion.div key={s.id} layout className="glass-card p-8 rounded-[2.5rem] border border-border flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/5 blur-[80px] -ml-32 -mt-32" />
                                    <div className="flex items-center gap-6 flex-1 relative z-10 cursor-pointer" onClick={() => setSelectedStudent(s)}>
                                         <div className="relative">
                                             <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20" />
                                             <div className="w-16 h-16 rounded-[1.5rem] bg-surface-100 dark:bg-surface-800 border border-border flex items-center justify-center text-text-heading font-black text-2xl relative z-10">{s.fullName[0]}</div>
                                         </div>
                                         <div>
                                             <p className="text-xl font-black text-text-heading tracking-normal uppercase leading-none mb-1 hover:text-primary-500 transition-colors">{s.fullName}</p>
                                             <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{s.email} · {s.department} · Batch {s.graduationYear}</p>
                                         </div>
                                    </div>
                                    <div className="flex gap-3 w-full md:w-auto relative z-10 items-center">
                                        <button onClick={() => setSelectedStudent(s)}
                                            className="bg-surface-50 dark:bg-white/5 text-text-heading border border-border px-5 py-4 rounded-xl uppercase font-black tracking-widest text-[10px] hover:border-primary-500/40 transition-all flex items-center gap-2">
                                            <Eye size={14} /> View Profile
                                        </button>
                                        <button onClick={() => handleVerify(s.id, 'REJECTED')} disabled={verifyingId === s.id} className="bg-red-500/10 text-red-400 border border-red-500/20 px-8 py-4 rounded-xl uppercase font-black tracking-widest text-[10px] hover:bg-red-500/20 transition-all">Reject Profile</button>
                                        <button onClick={() => handleVerify(s.id, 'VERIFIED')} disabled={verifyingId === s.id} className="bg-primary-600 text-white px-10 py-4 rounded-xl uppercase font-black tracking-widest text-[10px] shadow-xl shadow-primary-600/20 hover:scale-105 transition-all">Confirm Identity</button>
                                    </div>
                                </motion.div>
                             ))}
                        </div>
                     )}
                </motion.div>
            )}
            {activeTab === 'import' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 max-w-4xl mx-auto space-y-10">
                    <div>
                        <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase">Bulk Registry Onboarding</h2>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1.5">Register whole student cohorts instantly via CSV</p>
                    </div>

                    {/* CSV Template Guidelines Card */}
                    <div className="glass-card border border-border rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[60px]" />
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-normal text-text-heading">CSV Schema Guide</h3>
                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-0.5">Headers must match exactly</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 text-xs text-text-body">
                            <div>
                                <p className="font-extrabold mb-2 uppercase tracking-wide text-[10px] text-primary-400">Required Headers</p>
                                <ul className="space-y-1 list-disc pl-4 uppercase font-bold text-[9px] tracking-wider">
                                    <li><code className="text-text-heading bg-surface-100 dark:bg-white/10 px-1.5 py-0.5 rounded">fullName</code> - Student's full name</li>
                                    <li><code className="text-text-heading bg-surface-100 dark:bg-white/10 px-1.5 py-0.5 rounded">email</code> - Valid student institutional email</li>
                                    <li><code className="text-text-heading bg-surface-100 dark:bg-white/10 px-1.5 py-0.5 rounded">department</code> - Major branch (e.g. Computer Science)</li>
                                    <li><code className="text-text-heading bg-surface-100 dark:bg-white/10 px-1.5 py-0.5 rounded">graduationYear</code> - Year (e.g. 2026)</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-extrabold mb-2 uppercase tracking-wide text-[10px] text-emerald-400">Optional Columns</p>
                                <ul className="space-y-1 list-disc pl-4 uppercase font-bold text-[9px] tracking-wider">
                                    <li><code className="text-text-heading bg-surface-100 dark:bg-white/10 px-1.5 py-0.5 rounded">skills</code> - Comma separated skills</li>
                                    <li><code className="text-text-heading bg-surface-100 dark:bg-white/10 px-1.5 py-0.5 rounded">experienceLevel</code> - ENTRY, INTERMEDIATE, SENIOR</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-4 items-center justify-between">
                            <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Initial passwords are secure UUIDs. Students log in via Forgot Password reset.</span>
                            <a 
                                href="data:text/csv;charset=utf-8,fullName,email,department,graduationYear,skills,experienceLevel%0AAlex%20Smith,alex.smith@college.edu,Computer%20Science,2026,%22Java,React,SQL%22,ENTRY%0AEmma%20Watson,emma.watson@college.edu,Electrical%20Engineering,2025,%22Python,C%2B%2B%22,INTERMEDIATE" 
                                download="odyssey_student_import_template.csv"
                                className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-surface-50 dark:bg-white/5 border border-border text-text-heading hover:bg-surface-100 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
                            >
                                <FileDown size={14} />
                                Download Template CSV
                            </a>
                        </div>
                    </div>

                    {/* Uploader Box */}
                    <CsvUploader onImportFinished={(res) => {
                        // Re-fetch students in background
                        collegeAPI.getStudents().then(stuRes => setStudents(stuRes.data.data || []));
                    }} />
                </motion.div>
            )}

            {activeTab === 'companies' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                    <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase mb-10">Industry Network</h2>
                    <CompanyRequests />
                    
                    {/* Active Partners List */}
                    <div className="mt-12">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-500 mb-8">Verified Partners</h3>
                        {companies.length === 0 ? (
                            <div className="bg-white/5 p-16 text-center text-white/20 italic rounded-[3rem] border border-dashed border-white/10 uppercase font-black text-[10px] tracking-widest">
                                No verified hub partners in your network yet
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-6">
                                {companies.map(company => (
                                    <div key={company.id} className="glass-card p-6 rounded-[2.5rem] border border-border flex items-center gap-6 group hover:border-primary-500/30 transition-all relative overflow-hidden shadow-premium">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[40px] opacity-40" />
                                        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-white/5 flex items-center justify-center text-text-heading font-black text-2xl group-hover:scale-110 transition-transform border border-border relative z-10">
                                            {company.logoUrl ? <img src={company.logoUrl} className="w-full h-full object-cover rounded-2xl" /> : company.companyName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <p className="text-xl font-black text-text-heading tracking-normal uppercase leading-none mb-1">{company.companyName}</p>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest truncate">{company.industry} · {company.city}, {company.state}</p>
                                            {company.website && (
                                                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary-400 font-black uppercase tracking-widest mt-3 inline-block hover:underline">Visit HQ →</a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {activeTab === 'settings' && <SettingsPage user={user} />}
            </div>
        </DashboardLayout>
    );
}

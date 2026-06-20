import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, X, 
    CheckCircle2, Zap, ClipboardList, Star, Clock,
    TrendingUp, Rocket, ShieldCheck, ChevronRight, Briefcase,
    Building2, AlertTriangle, Sparkles, LayoutGrid, Calendar, GraduationCap
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import axiosInstance, { projectAPI } from '../api/api';
import toast from 'react-hot-toast';
import CreateProjectForm from '../components/company/CreateProjectForm';
import PartnerColleges from '../components/company/PartnerColleges';
import ProfileSettings from '../components/common/ProfileSettings';
import SettingsPage from '../components/common/SettingsPage';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

// ─── Mission Control Components ─────────────────────────────────────────────

function PipelineEfficiencyHero({ score = 84, activeCount = 0, poolCount = 1200 }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-900 border border-white/5 shadow-premium p-10 rounded-[3rem] relative overflow-hidden group mb-10"
        >
            <div className="absolute -top-10 -right-10 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Briefcase size={180} className="rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-48 h-48 shrink-0">
                    <svg className="w-full h-full -rotate-90 transform">
                        <circle
                            cx="96" cy="96" r="85"
                            className="text-white/5 stroke-current"
                            strokeWidth="14" fill="transparent"
                        />
                        <motion.circle
                            cx="96" cy="96" r="85"
                            className="text-emerald-500 stroke-current"
                            strokeWidth="14"
                            strokeDasharray={534}
                            initial={{ strokeDashoffset: 534 }}
                            animate={{ strokeDashoffset: 534 - (534 * score) / 100 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            fill="transparent"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white tracking-normal">{score}%</span>
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Efficiency</span>
                    </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-4xl font-black text-white mb-4 tracking-normal uppercase">Recruitment Pipeline Health</h3>
                    <p className="text-slate-300 text-lg mb-8 max-w-xl leading-relaxed font-medium">
                        Your project completion rate is <span className="text-white font-black underline decoration-emerald-500/50 underline-offset-4">trending upward</span>. You have access to <span className="text-emerald-400 font-black">{poolCount.toLocaleString()}+</span> verified students.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <Zap size={20} className="text-primary-400" />
                            <div>
                                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-white/50 mb-0.5">Active Talent</p>
                                <p className="text-lg font-black text-white leading-none">{activeCount}</p>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                            <ShieldCheck size={20} className="text-emerald-400" />
                            <div>
                                <p className="text-[9px] uppercase font-black tracking-[0.2em] text-white/50 mb-0.5">Verified Pool</p>
                                <p className="text-lg font-black text-white leading-none text-emerald-400">Top 5% Match</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </motion.div>
    );
}

function TalentRecommendation({ applicants = [] }) {
    if (applicants.length === 0) return null;
    const topMatch = applicants[0];
    
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#0B0F19] p-8 rounded-[2.5rem] relative overflow-hidden group border border-white/5 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full flex items-center gap-2">
                    <Sparkles size={14} /> Top Talent Match
                </span>
                <button className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary-500 transition-colors">See All</button>
            </div>
            
            <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-surface-900 border border-white/10 flex items-center justify-center text-white font-black text-2xl shadow-xl group-hover:rotate-6 transition-transform">
                    {topMatch.studentName[0]}
                </div>
                <div>
                    <h4 className="text-xl font-black text-text-heading tracking-normal uppercase leading-none mb-1 group-hover:text-primary-600 transition-colors">{topMatch.studentName}</h4>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                        <GraduationCap size={12} /> {topMatch.studentDepartment || 'Computer Science'}
                    </p>
                </div>
            </div>
            
            <p className="text-sm text-text-body font-bold italic leading-relaxed opacity-80 mb-6 line-clamp-2">
                "Verified skill match of 98% for your Web development openings based on their previous performance."
            </p>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-black text-text-heading">{topMatch.studentPerformanceScore || 4.9}</span>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Portfolio <ChevronRight size={14} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Modals (Preserved & Premium-ized) ───────────────────────────────────────────────────

function ApplicantsModal({ project, onClose, onAssign }) {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        projectAPI.getApplicants(project.id)
            .then(res => setApplicants(res.data.data))
            .catch(() => toast.error('Failed to load applicants'))
            .finally(() => setLoading(false));
    }, [project.id]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="card w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500/50 to-transparent" />
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-text-heading uppercase tracking-normal">Candidate Pool</h3>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">{project.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white rounded-2xl hover:bg-white/10 transition-all text-3xl">×</button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                         <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">Retrieving Profiles...</p>
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="text-center py-20 opacity-40 italic font-bold">No candidate outreach recorded yet.</div>
                ) : (
                    <div className="space-y-4">
                        {applicants.map((app, i) => (
                            <motion.div 
                                key={app.id} 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.06] hover:shadow-xl transition-all group"
                            >
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="w-14 h-14 rounded-2xl bg-surface-900 text-white flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                                        {app.studentName?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-lg font-black text-text-heading tracking-normal uppercase leading-none mb-1 group-hover:text-primary-500 transition-colors">{app.studentName}</p>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest truncate">{app.studentEmail}</p>
                                        {app.studentSkills && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {app.studentSkills.split(',').slice(0, 3).map(s => (
                                                    <span key={s} className="text-[9px] bg-primary-500/10 text-primary-500 font-black px-2 py-0.5 rounded-md uppercase tracking-wider">{s.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-10 w-full md:w-auto">
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1 opacity-80">Talent Score</p>
                                        <p className="text-lg font-black text-white tracking-normal flex items-center justify-end gap-1"><Star size={14} className="text-amber-500" /> {app.studentPerformanceScore || 4.2}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <StatusBadge status={app.status} />
                                        {app.status === 'PENDING' && (
                                            <button onClick={() => onAssign(project.id, app.studentId)}
                                                className="btn-primary text-[10px] py-1.5 px-4 font-black uppercase tracking-widest">Assign</button>
                                        )}
                                        {app.status === 'SUBMITTED' && (
                                            <button onClick={() => onRelease(app.id)}
                                                className="btn-primary text-[10px] py-1.5 px-4 font-black uppercase tracking-widest bg-emerald-600 shadow-emerald-500/20">Release Wealth</button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const TABS = ['overview', 'projects', 'applicants', 'partner-colleges', 'settings'];

export default function CompanyDashboard() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
    const location = useLocation();

    // 1. Category Breakdown Data for recharts
    const categoryData = useMemo(() => {
        if (!dashboardStats?.categoryBreakdown || Object.keys(dashboardStats.categoryBreakdown).length === 0) {
            return [
                { name: 'Software', value: 4 },
                { name: 'Data Science', value: 2 },
                { name: 'Marketing', value: 1 }
            ];
        }
        return Object.entries(dashboardStats.categoryBreakdown).map(([name, value]) => ({
            name, value
        }));
    }, [dashboardStats]);

    // 2. Application Funnel Data for recharts
    const funnelData = useMemo(() => {
        if (!dashboardStats?.applicationStatusBreakdown || Object.keys(dashboardStats.applicationStatusBreakdown).length === 0) {
            return [
                { name: 'Pending', value: 5 },
                { name: 'Assigned', value: 3 },
                { name: 'Rejected', value: 1 }
            ];
        }
        return Object.entries(dashboardStats.applicationStatusBreakdown).map(([name, value]) => ({
            name: name === 'ACCEPTED' ? 'Assigned' : name === 'SUBMITTED' ? 'Submitted' : name === 'REJECTED' ? 'Rejected' : 'Pending',
            value
        }));
    }, [dashboardStats]);

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path === 'company' || path === '') setActiveTab('overview');
        else if (TABS.includes(path)) setActiveTab(path);
        
        if (location.state?.openCreate) {
            setShowCreate(true);
            window.history.replaceState({}, document.title); // Clear state
        }
    }, [location.pathname, location.state]);

    const fetchProjects = async () => {
        try {
            const [projRes, dashRes] = await Promise.all([
                projectAPI.getMy(),
                axiosInstance.get('/companies/dashboard')
            ]);
            setProjects(projRes.data.data || []);
            if (dashRes.data?.data) {
                setDashboardStats(dashRes.data.data);
                setVerificationStatus(dashRes.data.data.verificationStatus);
            }
        } catch {
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleAssign = async (projectId, studentId) => {
        try {
            await projectAPI.assignStudent(projectId, studentId);
            toast.success('Assignment confirmed! 🚀');
            fetchProjects();
            setSelectedProject(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to assign');
        }
    };



    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Syncing Corporate Assets...</p>
                </div>
            </DashboardLayout>
        );
    }

    const open = projects.filter(p => p.status === 'OPEN').length;
    const inProgress = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;

    return (
        <DashboardLayout>
            <AnimatePresence>
                {showCreate && <CreateProjectForm onClose={() => setShowCreate(false)} onSuccess={fetchProjects} />}
                {selectedProject && (
                    <ApplicantsModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onAssign={handleAssign}
                    />
                )}
            </AnimatePresence>

            {/* Verification Alert (Premium Variant) */}
            {verificationStatus && verificationStatus !== 'VERIFIED' && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 p-6 glass border-amber-500/20 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-amber-500/5 transition-opacity group-hover:opacity-10" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 shadow-inner group-hover:rotate-12 transition-transform">
                            {verificationStatus === 'PENDING' ? <Clock size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                            <p className="text-amber-900 font-black uppercase tracking-normal">Corporate Trust Verification Required</p>
                            <p className="text-amber-800/60 text-xs font-bold mt-1 leading-relaxed">
                                Your account is currently in audit mode. You can design project templates, but global broadcast is restricted until corporate credentials are confirmed.
                            </p>
                        </div>
                        <div className="px-5 py-2.5 bg-white/60 rounded-xl border border-amber-200 text-[10px] font-black text-amber-800 uppercase tracking-[0.2em] shadow-sm">
                            Audit in Progress
                        </div>
                    </div>
                </motion.div>
            )}


            {activeTab === 'overview' && (
                <div className="space-y-16 mt-8">
                    <PipelineEfficiencyHero score={84} activeCount={inProgress} />

                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-10">
                             {/* Stats Grid — 4 KPIs */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {[
                                    { label: "Active Projects", value: inProgress, icon: <Zap size={22} />, color: "primary" },
                                    { label: "Total Applicants", value: dashboardStats?.totalApplications || projects.reduce((s, p) => s + (p.applicantsCount || 0), 0), icon: <Users size={22} />, color: "accent" },
                                    { label: "Students Assigned", value: projects.reduce((s, p) => s + (p.assignedCount || 0), 0) || inProgress, icon: <GraduationCap size={22} />, color: "emerald" },
                                    { label: "Completed Projects", value: completed, icon: <CheckCircle2 size={22} />, color: "emerald", trend: projects.length ? +Math.round((completed / projects.length) * 100) / 10 : 0 },
                                ].map((stat, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                        <StatCard {...stat} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Project Pipeline */}
                            <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl">
                                <h4 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Briefcase size={18} className="text-primary-500" /> Project Pipeline
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { stage: 'Draft', count: projects.filter(p => p.status === 'DRAFT').length, color: 'bg-slate-400' },
                                        { stage: 'Open', count: open, color: 'bg-amber-500' },
                                        { stage: 'Running', count: inProgress, color: 'bg-primary-500' },
                                        { stage: 'Completed', count: completed, color: 'bg-emerald-500' },
                                    ].map((item, i) => {
                                        const total = Math.max(projects.length, 1);
                                        const pct = Math.round((item.count / total) * 100);
                                        return (
                                            <div key={i} className="flex items-center gap-4">
                                                <span className="w-24 text-[10px] font-black uppercase tracking-widest text-text-muted">{item.stage}</span>
                                                <div className="flex-1 h-8 rounded-xl bg-surface-50 dark:bg-white/5 border border-border relative overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.max(pct, item.count > 0 ? 10 : 0)}%` }}
                                                        transition={{ duration: 1, delay: i * 0.15 }}
                                                        className={`h-full rounded-xl ${item.color} flex items-center justify-end px-3`}
                                                    >
                                                        {item.count > 0 && <span className="text-[9px] font-black text-white">{item.count}</span>}
                                                    </motion.div>
                                                </div>
                                                <span className="w-8 text-right text-sm font-black text-text-heading">{item.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Charts & Analytics Visuals */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                                {/* Application Funnel Chart */}
                                <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl bg-slate-950/20">
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <TrendingUp size={18} className="text-primary-500" /> Candidate Funnel
                                    </h4>
                                    <div className="h-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={funnelData} barSize={35}>
                                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} />
                                                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                                                    {funnelData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Category Distribution Chart */}
                                <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl bg-slate-950/20">
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <LayoutGrid size={18} className="text-emerald-500" /> Topic Sectors
                                    </h4>
                                    <div className="h-60 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="w-full sm:w-1/2 h-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={categoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={45}
                                                        outerRadius={65}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                    >
                                                        {categoryData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="w-full sm:w-1/2 space-y-2 px-2 max-h-full overflow-y-auto">
                                            {categoryData.map((entry, index) => (
                                                <div key={entry.name} className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                                                    <div className="flex-1 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                                                        <span className="truncate pr-1">{entry.name}</span>
                                                        <span className="text-white">{entry.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Projects Interactive Table */}
                            <div className="glass p-8 rounded-[2.5rem] border-white/20">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="font-black text-text-heading uppercase tracking-normal text-3xl flex items-center gap-3">
                                        <LayoutGrid size={28} className="text-primary-500" /> Current Initiatives
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setShowCreate(true)}
                                            className="btn-primary py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-500/20"
                                        >
                                            <Plus size={16} /> Post Initiative
                                        </button>
                                        <button onClick={() => setActiveTab('projects')} className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] hover:underline px-6 py-3 bg-primary-500/5 rounded-2xl border border-primary-500/10">View Archive</button>
                                    </div>
                                </div>
                                
                                {projects.length === 0 ? (
                                    <div className="text-center py-24 bg-white/5 border border-dashed border-white/10 rounded-[2rem] text-white/20 italic font-black uppercase text-[10px] tracking-[0.3em]">
                                        No active corporate initiatives detected.
                                    </div>
                                ) : (
                                    <div className="space-y-3 px-2">
                                        {projects.slice(0, 5).map((p, i) => (
                                            <motion.div 
                                                key={p.id}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                                className="flex flex-col md:flex-row items-center justify-between bg-white/[0.03] border-white/5 hover:bg-white/[0.07] transition-all duration-300 group cursor-pointer"
                                                onClick={() => setSelectedProject(p)}
                                            >
                                                <div className="flex-1 w-full px-6 py-4 rounded-l-2xl border-y border-l border-white/5">
                                                    <h4 className="text-sm font-black text-white tracking-widest uppercase leading-none mb-2 group-hover:text-primary-400 transition-colors">{p.title}</h4>
                                                    <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
                                                        <span className="flex items-center gap-1.5"><Users size={12} className="text-primary-500" /> {p.applicantsCount} Pursuits</span>
                                                        {p.durationWeeks && <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary-500" /> {p.durationWeeks} Weeks</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-10 px-6 py-4 rounded-r-2xl border-y border-r border-white/5 md:w-[300px] justify-between md:justify-end">
                                                    <StatusBadge status={p.status} />
                                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-primary-400">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-10">
                            {/* Best Candidate Recommender (Mock/Logic) */}
                             <TalentRecommendation applicants={projects.flatMap(p => p.applicants || []).sort((a,b) => b.studentPerformanceScore - a.studentPerformanceScore)} />

                             {/* Active Milestone Card */}
                             <div className="bg-[#0B0F19] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[60px]" />
                                <h3 className="font-black uppercase tracking-tight text-xl mb-8 flex items-center gap-2">
                                    <TrendingUp size={20} className="text-primary-400" /> Asset Valuation
                                </h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.25em]">Total Initiatives Deployed</span>
                                        <span className="text-sm font-black tracking-normal text-white">{projects.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.25em]">Active Contracts</span>
                                        <span className="text-sm font-black tracking-normal text-primary-400">{inProgress}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-white/50 tracking-[0.25em]">Partner Network</span>
                                        <span className="text-sm font-black tracking-normal text-white">4 Verified Colleges</span>
                                    </div>
                                </div>
                                <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-3">Growth Tip</p>
                                    <p className="text-xs text-white/60 leading-relaxed font-bold italic">
                                        Companies that provide feedback within 24h see a 30% higher student satisfaction rate.
                                    </p>
                                </div>
                                <button onClick={() => setActiveTab('partner-colleges')} className="mt-8 px-6 py-4 rounded-2xl text-[10px] uppercase font-black tracking-[0.3em] border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all w-full">
                                    Expand Partner Network
                                </button>
                             </div>

                             {/* Recent Applicants Table */}
                             <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-2xl">
                                <h4 className="text-sm font-black text-text-heading uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <Users size={18} className="text-primary-500" /> Recent Applicants
                                </h4>
                                {(() => {
                                    const allApplicants = projects.flatMap(p => 
                                        (p.applicants || []).map(a => ({ ...a, projectTitle: p.title }))
                                    ).slice(0, 5);
                                    
                                    if (allApplicants.length === 0) {
                                        return <p className="text-text-muted italic text-sm font-bold py-4 text-center opacity-60">No applicants yet</p>;
                                    }
                                    
                                    return (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-[9px] uppercase font-black tracking-widest text-text-muted border-b border-border">
                                                        <th className="pb-3 pr-4">Student</th>
                                                        <th className="pb-3 pr-4">Match</th>
                                                        <th className="pb-3 pr-4">Skills</th>
                                                        <th className="pb-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allApplicants.map((app, i) => (
                                                        <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-50 dark:hover:bg-white/5 transition-colors">
                                                            <td className="py-3 pr-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                                                                        {app.studentProfileImageUrl ? (
                                                                            <img src={app.studentProfileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            app.studentName[0]
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm font-black text-text-heading">{app.studentName}</p>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 pr-4">
                                                                <span className="text-sm font-black text-primary-500">{app.studentPerformanceScore ? `${Math.round(app.studentPerformanceScore)}%` : '—'}</span>
                                                            </td>
                                                            <td className="py-3 pr-4">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {(app.studentSkills || '').split(',').slice(0, 2).map((s, j) => (
                                                                        <span key={j} className="text-[8px] bg-primary-500/10 text-primary-400 px-1.5 py-0.5 rounded font-bold uppercase">{s.trim()}</span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="py-3"><StatusBadge status={app.status} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })()}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'projects' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                         <div>
                             <h2 className="text-4xl font-black text-text-heading tracking-normal uppercase">Initiative Archive</h2>
                             <p className="text-text-muted mt-2 font-bold opacity-60">Complete audit trail of all deployed projects.</p>
                         </div>
                         <button 
                             onClick={() => setShowCreate(true)}
                             className="btn-primary py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary-500/20"
                         >
                             <Plus size={20} /> Create New Initiative
                         </button>
                     </div>
                     <div className="space-y-4">
                        {projects.map((p, i) => (
                             <motion.div 
                                key={p.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary-500/40 transition-all group cursor-pointer"
                                onClick={() => setSelectedProject(p)}
                            >
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-4 mb-3">
                                         <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{p.category || 'Professional'}</span>
                                         <StatusBadge status={p.status} />
                                    </div>
                                    <h4 className="text-xl font-black text-text-heading tracking-normal uppercase leading-none mb-3 group-hover:text-primary-600 transition-colors">{p.title}</h4>
                                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50">
                                         <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date().toLocaleDateString()}</span>
                                         <span className="flex items-center gap-1.5"><Users size={12} /> {p.applicantsCount} Pursuits</span>
                                    </div>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-primary-500">
                                    <ChevronRight size={24} />
                                </div>
                            </motion.div>
                        ))}
                     </div>
                </motion.div>
            )}

            {activeTab === 'partner-colleges' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                     <PartnerColleges />
                </motion.div>
            )}

            {activeTab === 'applicants' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass text-center py-32 rounded-[3rem] mt-4">
                     <div className="max-w-md mx-auto">
                         <div className="w-20 h-20 rounded-3xl bg-primary-500/10 flex items-center justify-center text-primary-500 mx-auto mb-8">
                             <Users size={40} />
                         </div>
                         <h3 className="text-2xl font-black text-text-heading uppercase tracking-normal mb-4">Command Center Detail</h3>
                         <p className="text-sm text-text-muted font-bold opacity-60 leading-relaxed mb-10">
                             To view specific applicants, please audit an individual Initiative first by selecting it from the Overview or Archive.
                         </p>
                         <button onClick={() => setActiveTab('overview')} className="btn-primary py-4 px-10 rounded-2xl uppercase tracking-widest font-black text-xs">Return to Command</button>
                     </div>
                </motion.div>
            )}
            {activeTab === 'settings' && <SettingsPage user={user} />}

        </DashboardLayout>
    );
}

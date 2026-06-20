import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Users, GraduationCap, Building2, School, Folder, 
    TrendingUp, Activity, ClipboardList, 
    ShieldCheck, Database, CheckCircle2, ChevronLeft, 
    ChevronRight, Power, UserX, UserCheck
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { adminAPI } from '../api/api';
import toast from 'react-hot-toast';
import ProfileSettings from '../components/common/ProfileSettings';
import SettingsPage from '../components/common/SettingsPage';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
    STUDENT: 'badge-primary',
    COMPANY: 'badge-success',
    COLLEGE_ADMIN: 'badge-warning',
    ADMIN: 'badge-danger',
};

export default function AdminDashboard() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('analytics');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const roleFilter = queryParams.get('role') || 'ALL';

    const displayedUsers = users.filter(u => u.email !== user?.email);

    useEffect(() => {
        setPage(0);
    }, [roleFilter]);

    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (path === 'admin' || path === '') {
            setActiveTab('analytics');
        } else if (['analytics', 'users', 'settings'].includes(path)) {
            setActiveTab(path);
        }
    }, [location.pathname]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await adminAPI.getAnalytics();
            setAnalytics(res.data.data);
        } catch {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await adminAPI.getUsers(page, roleFilter);
            const data = res.data.data;
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
            if (data.size) setPageSize(data.size);
        } catch {
            toast.error('Failed to load users');
        }
    }, [page, roleFilter]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
    useEffect(() => { if (activeTab === 'users') fetchUsers(); }, [activeTab, page, fetchUsers]);

    const handleToggleStatus = async (userId) => {
        try {
            await adminAPI.toggleUserStatus(userId);
            toast.success('User status updated');
            fetchUsers();
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const handleVerifyAction = async (user) => {
        try {
            if (user.role === 'COLLEGE_ADMIN') {
                await adminAPI.verifyCollege(user.profileId);
                toast.success('College verified successfully');
            } else if (user.role === 'COMPANY') {
                await adminAPI.verifyCompany(user.profileId);
                toast.success('Company verified successfully');
            }
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        }
    };

    const handleRejectAction = async (user) => {
        try {
            if (user.role === 'COLLEGE_ADMIN') {
                await adminAPI.rejectCollege(user.profileId);
                toast.success('College registration rejected');
            } else if (user.role === 'COMPANY') {
                await adminAPI.rejectCompany(user.profileId);
                toast.success('Company registration rejected');
            }
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Rejection failed');
        }
    };

    return (
        <DashboardLayout>


            {/* Tab Bar removed for sidebar consolidation */}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="animate-fade-in space-y-8">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="spinner w-8 h-8" /></div>
                    ) : (
                        <>
                            {/* Primary Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Users" value={analytics?.totalUsers || 0} icon={<Users size={22} />} color="primary" onClick={() => navigate('/admin/users?role=ALL')} />
                                <StatCard label="Students" value={analytics?.totalStudents || 0} icon={<GraduationCap size={22} />} color="accent" onClick={() => navigate('/admin/users?role=STUDENT')} />
                                <StatCard label="Companies" value={analytics?.totalCompanies || 0} icon={<Building2 size={22} />} color="emerald" onClick={() => navigate('/admin/users?role=COMPANY')} />
                                <StatCard label="Colleges" value={analytics?.totalColleges || 0} icon={<School size={22} />} color="amber" onClick={() => navigate('/admin/users?role=COLLEGE_ADMIN')} />
                            </div>

                            {/* Secondary Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard label="Total Projects" value={analytics?.totalProjects || 0} icon={<Folder size={22} />} color="primary" />
                                <StatCard label="Open Projects" value={analytics?.openProjects || 0} icon={<Activity size={22} />} color="emerald" />
                                <StatCard label="Completed Projects" value={analytics?.completedProjects || 0} icon={<CheckCircle2 size={22} />} color="accent" />
                            </div>

                            {/* Activity Grid */}
                            <div className="grid lg:grid-cols-2 gap-6">
                                <div className="card">
                                    <h3 className="font-semibold text-text-heading mb-4">Platform Activity</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Applications', value: analytics?.totalApplications, icon: <ClipboardList size={20} />, color: 'primary' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between p-4
                                                         bg-surface-50 rounded-xl border border-border">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-primary-500">{item.icon}</span>
                                                    <span className="text-text-body font-bold">{item.label}</span>
                                                </div>
                                                <span className="text-2xl font-black text-text-heading">{item.value || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 className="font-semibold text-text-heading mb-4">Platform Health</h3>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                label: 'Project Completion Rate', pct: analytics?.totalProjects
                                                    ? Math.round((analytics.completedProjects / analytics.totalProjects) * 100) : 0,
                                                color: 'bg-primary-600'
                                            },
                                            {
                                                label: 'Student Verification Rate', pct: analytics?.totalStudents
                                                    ? 60 : 0, color: 'bg-primary-600'
                                            },
                                            {
                                                label: 'Active Projects', pct: analytics?.totalProjects
                                                    ? Math.round((analytics.openProjects / analytics.totalProjects) * 100) : 0,
                                                color: 'bg-primary-600'
                                            },
                                        ].map(item => (
                                            <div key={item.label}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-text-muted">{item.label}</span>
                                                    <span className="text-text-heading font-bold">{item.pct}%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2">
                                                    <div className={`${item.color} h-2 rounded-full transition-all duration-700`}
                                                        style={{ width: `${item.pct}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="animate-fade-in">
                    <div className="card shadow-sm border-surface-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
                            <div>
                                <h3 className="font-bold text-text-heading text-xl flex items-center gap-2">
                                    <Users size={20} className="text-primary-600" /> User Directory
                                </h3>
                                <p className="text-xs text-text-muted mt-1">
                                    Manage all system accounts, view verification statuses, and toggle active states.
                                </p>
                            </div>
                            <div className="text-sm text-text-muted font-medium bg-surface-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-border">
                                Showing {displayedUsers.length} of {roleFilter === 'ALL' ? (analytics?.totalUsers ? analytics.totalUsers - 1 : 0) : roleFilter === 'STUDENT' ? analytics?.totalStudents || 0 : roleFilter === 'COMPANY' ? analytics?.totalCompanies || 0 : roleFilter === 'COLLEGE_ADMIN' ? analytics?.totalColleges || 0 : displayedUsers.length} users
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { id: 'ALL', label: 'All Users', count: Math.max(0, (analytics?.totalUsers ? analytics.totalUsers - 1 : 0)) },
                                { id: 'STUDENT', label: 'Students', count: analytics?.totalStudents },
                                { id: 'COMPANY', label: 'Companies', count: analytics?.totalCompanies },
                                { id: 'COLLEGE_ADMIN', label: 'Colleges', count: analytics?.totalColleges },
                                { id: 'ADMIN', label: 'Admins', count: Math.max(0, (analytics?.totalUsers - (analytics?.totalStudents || 0) - (analytics?.totalCompanies || 0) - (analytics?.totalColleges || 0) - 1) || 0) }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => {
                                        if (filter.id === 'ALL') {
                                            navigate('/admin/users');
                                        } else {
                                            navigate(`/admin/users?role=${filter.id}`);
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2
                                    ${roleFilter === filter.id 
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/10' 
                                        : 'bg-surface-50 text-text-muted border-border hover:bg-surface-100 hover:text-text-heading'}`}
                                >
                                    {filter.label}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black
                                        ${roleFilter === filter.id 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-surface-200 dark:bg-white/10 text-text-muted'}`}>
                                        {filter.count || 0}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {displayedUsers.length === 0 ? (
                            <div className="text-center py-20 bg-surface-50 rounded-2xl border border-dashed border-border">
                                <Users size={48} className="text-surface-300 mx-auto mb-4" />
                                <p className="text-text-muted font-medium">No users found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto -mx-2">
                                <table className="w-full text-sm border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-left text-text-muted font-semibold uppercase tracking-wider text-xs">
                                            <th className="px-4 py-2 w-[80px]">ID</th>
                                            <th className="px-4 py-2 min-w-[150px]">Name</th>
                                            <th className="px-4 py-2 min-w-[200px]">Email</th>
                                            <th className="px-4 py-2 w-[120px]">Role</th>
                                            <th className="px-4 py-2 w-[140px]">Verification</th>
                                            <th className="px-4 py-2 w-[100px]">Status</th>
                                            <th className="px-4 py-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {displayedUsers.map((u, index) => (
                                            <tr key={u.id} className="group bg-surface-50 hover:bg-primary-500/10 transition-all duration-200 border border-border">
                                                <td className="px-4 py-4 text-text-muted font-mono rounded-l-xl border-y border-l border-border">#{index + 1 + (page * pageSize)}</td>
                                                <td className="px-4 py-4 font-bold text-text-heading border-y border-border">{u.fullName}</td>
                                                <td className="px-4 py-4 text-text-body border-y border-border">{u.email}</td>
                                                <td className="px-4 py-4 border-y border-border text-center">
                                                    <span className={`badge ${ROLE_COLORS[u.role] || 'badge-gray'} shadow-sm`}>{u.role}</span>
                                                </td>
                                                <td className="px-4 py-4 border-y border-border text-center">
                                                    {u.verificationStatus ? (
                                                        <StatusBadge status={u.verificationStatus} />
                                                    ) : (
                                                        <span className="text-surface-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 border-y border-border text-center">
                                                    <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'} shadow-sm`}>
                                                        {u.active ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 rounded-r-xl border-y border-r border-border text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {u.role !== 'STUDENT' && (
                                                            <>
                                                                {(u.role === 'COLLEGE_ADMIN' || u.role === 'COMPANY') && u.verificationStatus === 'PENDING' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleVerifyAction(u)}
                                                                            className="btn-primary py-1.5 px-3 text-xs shadow-md shadow-primary-500/10"
                                                                        >
                                                                            Verify
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectAction(u)}
                                                                            className="px-3 py-1.5 rounded-lg font-bold text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => handleToggleStatus(u.id)}
                                                                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border
                                                                        ${u.active
                                                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'}`}
                                                                >
                                                                    {u.active ? 'Suspend' : 'Activate'}
                                                                </button>
                                                            </>
                                                        )}
                                                        {u.role === 'STUDENT' && (
                                                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic py-1.5">
                                                                Managed by College
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-8 pt-6 border-t border-border">
                                <button
                                    disabled={page === 0}
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    className="p-2 rounded-lg hover:bg-surface-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="flex gap-1.5">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button key={i} onClick={() => setPage(i)}
                                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border
                                            ${page === i 
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20 scale-110' 
                                                : 'bg-white text-text-muted border-border hover:border-primary-500 hover:text-primary-600'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={page === totalPages - 1}
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    className="p-2 rounded-lg hover:bg-surface-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && <SettingsPage user={user} />}
        </DashboardLayout>
    );
}

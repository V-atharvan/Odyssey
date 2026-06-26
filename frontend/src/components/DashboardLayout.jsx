import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Home, Search, ClipboardList, Star, Bell, Bot,
    Folder, Users, TrendingUp, CheckCircle2, GraduationCap,
    Building2, User, LogOut, Menu, X, Settings, Plus, Trophy, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';
import NotificationDropdown from './common/NotificationDropdown';
import ThemeToggle from './common/ThemeToggle';
import ChatPanel from './common/ChatPanel';

const NAV_ITEMS = {
    STUDENT: [
        { label: 'Find Projects', icon: <Search size={20} />, path: '/student' },
        { label: 'Settings', icon: <Settings size={20} />, path: '/student/settings' },
    ],
    COMPANY: [
        { label: 'Overview', icon: <Home size={20} />, path: '/company' },
        { label: 'Projects', icon: <Folder size={20} />, path: '/company/projects' },
        { label: 'Applicants', icon: <Users size={20} />, path: '/company/applicants' },
        { label: 'Partner Colleges', icon: <Building2 size={20} />, path: '/company/partner-colleges' },
        { label: 'Chat', icon: <MessageSquare size={20} />, path: '#', onClick: () => document.getElementById('chat-panel-toggle')?.click() },
        { label: 'Settings', icon: <Settings size={20} />, path: '/company/settings' },
    ],
    COLLEGE_ADMIN: [
        { label: 'Overview', icon: <Home size={20} />, path: '/college' },
        { label: 'Students', icon: <GraduationCap size={20} />, path: '/college/students' },
        { label: 'Verification', icon: <CheckCircle2 size={20} />, path: '/college/verify' },
        { label: 'Projects', icon: <Folder size={20} />, path: '/college/projects' },
        { label: 'Partners', icon: <Building2 size={20} />, path: '/college/companies' },
        { label: 'Settings', icon: <Settings size={20} />, path: '/college/settings' },
    ],
    ADMIN: [
        { label: 'Analytics', icon: <TrendingUp size={20} />, path: '/admin' },
        { label: 'User Directory', icon: <User size={20} />, path: '/admin/users' },
        { label: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
    ],
};

const ROLE_LABELS = {
    STUDENT: 'Student',
    COMPANY: 'Company',
    COLLEGE_ADMIN: 'College Admin',
    ADMIN: 'Platform Admin',
};

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navItems = NAV_ITEMS[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-mesh flex flex-col overflow-x-hidden">
            {/* Global Top Header */}
            <header className="fixed top-0 left-0 right-0 z-[100] bg-white dark:bg-surface-900 border-b border-slate-200/80 dark:border-white/5 p-4 lg:px-8 flex items-center justify-between shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img src={logo} alt="Odyssey Logo" className="w-10 h-10 rounded-xl shadow-lg border border-white/20 relative z-10" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <h1 className="font-black text-slate-900 dark:text-white text-xl tracking-normal">Odyssey</h1>
                        <p className="text-[9px] text-primary-400 font-bold uppercase tracking-[0.2em] mt-1">{ROLE_LABELS[user?.role]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {user?.role === 'COMPANY' && (
                        <button
                            onClick={() => navigate('/company', { state: { openCreate: true } })}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20 active:scale-95 mr-2 border border-white/10"
                        >
                            <Plus size={16} /> Post Initiative
                        </button>
                    )}
                    <ThemeToggle />
                    <NotificationDropdown />
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-11 h-11 flex items-center justify-center text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all active:scale-90"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Drawer Navigation Menu */}
            <aside
                className={`fixed top-0 right-0 h-screen z-[110] w-72
                    ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                    bg-white dark:bg-surface-900 border-l border-slate-200/80 dark:border-white/5 flex flex-col shadow-premium overflow-hidden`}
            >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary-600/10 to-transparent pointer-events-none opacity-50" />

                {/* Logo Section */}
                <div className="p-6 pb-8 flex items-center gap-4 relative text-slate-900 dark:text-white">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 animate-pulse" />
                        <img src={logo} alt="Odyssey Logo" className="w-11 h-11 rounded-2xl shadow-xl border border-white/10 relative z-10" />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="font-black text-2xl tracking-normal leading-none">Odyssey</h1>
                        <p className="text-[10px] text-primary-400 font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">{ROLE_LABELS[user?.role]}</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar relative">
                    {navItems.map((item, i) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 + 0.2 }}
                        >
                            <NavLink
                                to={item.path}
                                end={item.path.split('/').length <= 2}
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                                    ${isActive && item.path !== '#'
                                        ? 'bg-primary-100 dark:bg-white/10 text-primary-700 dark:text-white shadow-premium border border-primary-200 dark:border-white/20'
                                        : 'text-slate-600 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`
                                }
                                onClick={(e) => {
                                    setMobileMenuOpen(false);
                                    if (item.onClick) {
                                        e.preventDefault();
                                        item.onClick();
                                    }
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={`text-xl flex-shrink-0 transition-all duration-500 
                                            ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'group-hover:scale-110'}`}>
                                            {item.icon}
                                        </span>
                                        <span className={`flex items-center gap-3 font-bold tracking-normal text-sm
                                            ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1 group-hover:underline underline-offset-4'} transition-transform duration-300`}>
                                            {item.label}
                                            {item.highlight && (
                                                <span className="text-[9px] bg-gradient-to-r from-accent-400 to-accent-600 text-white font-black px-2 py-0.5 rounded-full shadow-lg brightness-110">AI</span>
                                            )}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </motion.div>
                    ))}
                </nav>

                {/* User Info Footer */}
                <div 
                    onClick={() => {
                        if (user?.role === 'STUDENT') {
                            navigate(`/portfolio/${user.profileId}`);
                        } else if (user?.role === 'COMPANY') {
                            navigate('/company/settings');
                        } else if (user?.role === 'COLLEGE_ADMIN') {
                            navigate('/college/settings');
                        } else if (user?.role === 'ADMIN') {
                            navigate('/admin/settings');
                        }
                    }}
                    className="p-6 mt-auto border-t border-slate-200/80 dark:border-white/5 bg-slate-50 dark:bg-black/20 relative cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                    <div className="px-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-surface-800 border border-slate-300 dark:border-white/5 flex items-center justify-center text-sm font-black text-slate-700 dark:text-white shrink-0 shadow-lg">
                            {(user?.role === 'COMPANY' || user?.role === 'COLLEGE_ADMIN') ? (
                                user?.logoUrl ? <img src={user.logoUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : user?.fullName?.charAt(0)
                            ) : (
                                user?.profileImageUrl ? <img src={user.profileImageUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" /> : user?.fullName?.charAt(0)
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">{user?.fullName}</p>
                            <p className="text-[10px] text-slate-500 dark:text-surface-100/40 truncate font-medium mt-0.5">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] pt-[72px]">
                <div className="flex-1 p-4 sm:p-8 lg:p-12 lg:pt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Real-time Chat Panel */}
            {user && user.role === 'COMPANY' && <ChatPanel />}
        </div>
    );
}

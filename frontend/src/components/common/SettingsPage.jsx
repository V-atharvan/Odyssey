import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, ChevronRight, Shield, Palette, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileSettings from './ProfileSettings';

export default function SettingsPage({ user }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('menu');
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const rolePath = user?.role === 'STUDENT' ? '/student' 
        : user?.role === 'COMPANY' ? '/company' 
        : user?.role === 'COLLEGE_ADMIN' ? '/college' 
        : '/admin';

    if (activeSection === 'profile') {
        return (
            <div>
                <button 
                    onClick={() => setActiveSection('menu')}
                    className="group mb-6 flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition-all"
                >
                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 group-hover:bg-white/10 rounded-xl border border-white/10 transition-all text-white">
                        <ArrowLeft size={24} />
                    </div>
                    <span>Back to Settings</span>
                </button>
                <ProfileSettings user={user} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 pt-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-black text-text-heading tracking-normal mb-2">Settings</h1>
                <p className="text-text-muted text-sm mb-10">Manage your account preferences and system configuration.</p>

                <div className="space-y-3">
                    {/* Profile */}
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSection('profile')}
                        className="w-full glass p-5 rounded-2xl flex items-center gap-4 group hover:shadow-lg transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                            <User size={22} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-text-heading text-sm">Profile</p>
                            <p className="text-xs text-text-muted mt-0.5">Edit your name, bio, skills and social links</p>
                        </div>
                        <ChevronRight size={18} className="text-text-muted group-hover:text-text-heading transition-colors" />
                    </motion.button>

                    {/* Account Security (decorative) */}
                    <motion.div
                        whileHover={{ x: 4 }}
                        className="w-full glass p-5 rounded-2xl flex items-center gap-4 group hover:shadow-lg transition-all opacity-60 cursor-not-allowed"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                            <Shield size={22} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-text-heading text-sm">Account Security</p>
                            <p className="text-xs text-text-muted mt-0.5">Password, two-factor authentication</p>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-surface-50 text-text-muted px-2 py-1 rounded-full border border-border">Soon</span>
                    </motion.div>

                    {/* Appearance (decorative) */}
                    <motion.div
                        whileHover={{ x: 4 }}
                        className="w-full glass p-5 rounded-2xl flex items-center gap-4 group hover:shadow-lg transition-all opacity-60 cursor-not-allowed"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Palette size={22} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-text-heading text-sm">Appearance</p>
                            <p className="text-xs text-text-muted mt-0.5">Accent color, font size, layout density</p>
                        </div>
                        <span className="text-[9px] font-black uppercase bg-surface-50 text-text-muted px-2 py-1 rounded-full border border-border">Soon</span>
                    </motion.div>
                </div>

                {/* Logout */}
                <div className="mt-12 pt-8 border-t border-border">
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full p-5 rounded-2xl flex items-center gap-4 group hover:bg-red-50 border border-transparent hover:border-red-200 transition-all text-left"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <LogOut size={22} />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-red-600 text-sm">Logout</p>
                            <p className="text-xs text-red-400 mt-0.5">Sign out of your account</p>
                        </div>
                        <ChevronRight size={18} className="text-red-300 group-hover:text-red-500 transition-colors" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}

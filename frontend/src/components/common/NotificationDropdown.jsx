import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Briefcase, Building2, UserCheck, Sparkles } from 'lucide-react';
import { notificationAPI } from '../../api/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export default function NotificationDropdown() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const [notifsRes, countRes] = await Promise.all([
                notificationAPI.getAll(),
                notificationAPI.getUnreadCount()
            ]);
            setNotifications(notifsRes.data?.data || []);
            setUnreadCount(countRes.data?.data?.count || 0);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Setup WebSocket listener for push notifications
        let stompClient = null;
        if (user?.userId) {
            try {
                const socket = new SockJS('/api/ws');
                stompClient = Stomp.over(socket);
                stompClient.debug = () => {};
                
                stompClient.connect({}, () => {
                    stompClient.subscribe(`/queue/notifications-${user.userId}`, (msg) => {
                        const newNotif = JSON.parse(msg.body);
                        setNotifications(prev => [newNotif, ...prev]);
                        setUnreadCount(prev => prev + 1);
                        
                        toast.custom((t) => (
                            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-surface-900/95 border border-emerald-500/20 backdrop-blur-md shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`}>
                                <div className="flex-1 w-0">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                <Bell size={18} />
                                            </div>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-black text-white uppercase tracking-normal">{newNotif.title}</p>
                                            <p className="mt-1 text-xs text-white/60 font-semibold">{newNotif.message}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex border-l border-white/5 pl-4 ml-4 items-center">
                                    <button
                                        onClick={() => toast.dismiss(t.id)}
                                        className="w-full border border-transparent rounded-none rounded-r-lg p-2 flex items-center justify-center text-xs font-black text-primary-400 uppercase tracking-widest hover:text-white focus:outline-none"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ), { duration: 5000 });
                    });
                });
            } catch (err) {
                console.error("Failed to establish WebSocket real-time subscription", err);
            }
        }

        const interval = setInterval(fetchNotifications, 60000);
        return () => {
            clearInterval(interval);
            if (stompClient) {
                try { stompClient.disconnect(); } catch (ignore) {}
            }
        };
    }, [user?.userId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            fetchNotifications();
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAll = async () => {
        try {
            await notificationAPI.markAllAsRead();
            fetchNotifications();
            toast.success('All caught up! ✨');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    // Navigate to the notifications section of the user's dashboard
    const handleViewAll = () => {
        setIsOpen(false);
        const rolePrefix = {
            STUDENT: '/student',
            COMPANY: '/company',
            COLLEGE_ADMIN: '/college',
            ADMIN: '/admin',
        };
        const base = rolePrefix[user?.role] || '/student';
        navigate(`${base}/notifications`);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'APPLICATION_RECEIVED': return <Briefcase className="text-primary-500" size={18} />;
            case 'PARTNERSHIP_REQUEST': return <Building2 className="text-amber-500" size={18} />;
            case 'PARTNERSHIP_ACCEPTED': return <Check className="text-emerald-500" size={18} />;
            case 'STUDENT_VERIFIED': return <UserCheck className="text-emerald-500" size={18} />;
            case 'STUDENT_REJECTED': return <X className="text-red-500" size={18} />;
            default: return <Bell className="text-primary-400" size={18} />;
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-500 group overflow-hidden
                    ${isOpen ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-emerald-500 hover:bg-emerald-500/10 border border-white/10'}`}
            >
                <Bell size={20} className={`relative z-10 transition-transform duration-500 ${isOpen ? 'scale-110' : 'group-hover:rotate-12'}`} />
                <div className={`absolute inset-0 bg-emerald-500/20 blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

                {unreadCount > 0 && (
                    <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-4 h-4 bg-emerald-600 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-surface-900 shadow-sm z-20"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute right-0 mt-4 w-80 sm:w-[400px] glass border-white/20 rounded-[2rem] shadow-2xl overflow-hidden z-[100] origin-top-right backdrop-blur-2xl"
                    >
                        {/* Header — clean, no title, no sync all */}
                        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary-500/5 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <Bell size={15} />
                                </div>
                                <h3 className="font-black text-text-heading text-base tracking-normal uppercase">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[9px] font-black bg-primary-500 text-white px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAll}
                                    className="text-[10px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-1 bg-primary-500/10 rounded-lg transition-colors border border-primary-500/10"
                                >
                                    <Check size={10} /> Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification list */}
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-text-muted flex flex-col items-center opacity-40">
                                    <Bell size={40} className="mb-3 text-primary-500/20" />
                                    <p className="font-black uppercase tracking-widest text-xs">All caught up</p>
                                    <p className="text-[10px] mt-1 opacity-60">No new notifications</p>
                                </div>
                            ) : (
                                <div className="px-2 space-y-1">
                                    {notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            className={`p-4 rounded-2xl transition-all duration-300 flex gap-3 group cursor-pointer
                                                ${!notif.isRead ? 'bg-primary-500/[0.04] hover:bg-primary-500/[0.08]' : 'hover:bg-surface-100 dark:hover:bg-white/5'}`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-white/5 border border-border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-inner">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className={`text-sm leading-tight tracking-normal pr-3
                                                        ${!notif.isRead ? 'text-text-heading font-black' : 'text-text-muted font-bold'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-1 shadow-[0_0_8px_rgba(16,185,129,0.8)] flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-text-body leading-relaxed font-semibold line-clamp-2">{notif.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-50">
                                                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {!notif.isRead && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                                                            className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-primary-500/5 px-2 py-0.5 rounded-md"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Footer — "View All" redirects to notifications section */}
                        <div className="px-4 py-3 border-t border-border bg-surface-50 dark:bg-surface-900/40">
                            <button
                                onClick={handleViewAll}
                                className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-[0.2rem] shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            >
                                View All Notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

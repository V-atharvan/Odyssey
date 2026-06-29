import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    GraduationCap, Building2, School, ShieldCheck,
    ArrowRight, Mail, Lock, User, Shield, Eye, EyeOff, Phone
} from 'lucide-react';
import PhoneOTPFlow from '../components/auth/PhoneOTPFlow';
import { authAPI, DEMO_MODE } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { analyticsEvents } from '../firebase/analytics';
import toast from 'react-hot-toast';
import logo from '../assets/logo.jpg';

const ROLE_PATHS = {
    STUDENT: '/student',
    COMPANY: '/company',
    COLLEGE_ADMIN: '/college',
    ADMIN: '/admin',
};

const DEMO_ACCOUNTS = [
    { role: 'STUDENT', email: 'student@demo.com', label: 'Student', icon: <GraduationCap size={16} />, color: 'bg-surface-50 border-white/10 hover:border-primary-500/50 hover:bg-surface-100/50' },
    { role: 'COMPANY', email: 'company@demo.com', label: 'Company', icon: <Building2 size={16} />, color: 'bg-surface-50 border-white/10 hover:border-primary-500/50 hover:bg-surface-100/50' },
    { role: 'COLLEGE_ADMIN', email: 'college@demo.com', label: 'College Admin', icon: <School size={16} />, color: 'bg-surface-50 border-white/10 hover:border-primary-500/50 hover:bg-surface-100/50' },
    { role: 'ADMIN', email: 'admin@demo.com', label: 'Admin', icon: <Shield size={16} />, color: 'bg-surface-50 border-white/10 hover:border-primary-500/50 hover:bg-surface-100/50' },
];

export default function LoginPage() {
    const [showPhoneFlow, setShowPhoneFlow] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, loginWithEmail, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const fbUser = await loginWithGoogle();
            const idToken = await fbUser.getIdToken();

            const res = await authAPI.firebaseLogin({ idToken });
            const data = res.data.data;

            login(
                { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
                data.token
            );
            analyticsEvents.login('google');
            toast.success(`Welcome back, ${data.fullName}!`);
            navigate(ROLE_PATHS[data.role] || '/');
        } catch (err) {
            console.error("Google login failed", err);
            // Firebase-specific error: email already registered with password
            if (err?.code === 'auth/account-exists-with-different-credential') {
                toast.error(
                    'This email is already registered with email & password. Please sign in using your password.',
                    { duration: 6000 }
                );
            } else if (err?.code === 'auth/popup-closed-by-user') {
                // User closed popup — silent, no toast needed
            } else if (err?.code === 'auth/popup-blocked') {
                toast.error('Popup was blocked by your browser. Please allow popups for this site and try again.');
            } else {
                toast.error(err.response?.data?.message || err?.message || 'Google login failed');
            }
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authAPI.login({ email, password });
            const data = res.data.data;
            login(
                { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
                data.token
            );

            // Log in to Firebase under the hood so file uploads & FCM work
            try {
                await loginWithEmail(email, password);
            } catch (fbErr) {
                console.warn("Firebase sign-in under the hood failed:", fbErr.message);
            }

            analyticsEvents.login('email');
            toast.success(`Welcome back, ${data.fullName}!`);
            navigate(ROLE_PATHS[data.role] || '/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed';
            if (msg.includes('not verified')) {
                toast.error(msg, { duration: 6000 });
                // We could navigate to a verification page here if one existed
            } else if (!err.response) {
                toast.error('Cannot reach the server. Please start the Spring Boot backend on port 8080.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // One-click demo login
    const handleDemoLogin = async (account) => {
        setEmail(account.email);
        setPassword('demo1234');
        setLoading(true);
        try {
            const res = await authAPI.login({ email: account.email, password: 'demo1234' });
            const data = res.data.data;
            login(
                { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
                data.token
            );
            analyticsEvents.login('demo');
            toast.success(`Logged in as ${account.label}!`);
            navigate(ROLE_PATHS[data.role] || '/');
        } catch {
            toast.error('Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-100 flex">

            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex flex-col justify-center items-start p-20 w-1/2 relative overflow-hidden bg-gradient-to-br from-[#022b21] via-[#064e3b] to-[#04221a]">

                {/* Glowing backdrop blur blobs */}
                <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

                {/* Floating SVG Code Graphics (MongoDB Style) */}
                <svg className="absolute -top-12 -right-12 w-96 h-96 text-emerald-500/10 pointer-events-none select-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M70,10 C50,10 40,25 40,40 C40,48 35,50 30,50 C35,50 40,52 40,60 C40,75 50,90 70,90" />
                </svg>
                <svg className="absolute top-48 -right-24 w-[30rem] h-[30rem] text-emerald-500/10 pointer-events-none select-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M30,10 C50,10 60,25 60,40 C60,48 65,50 70,50 C65,50 60,52 60,60 C60,75 50,90 30,90" />
                </svg>
                <svg className="absolute bottom-10 right-20 w-64 h-64 text-emerald-400/15 pointer-events-none select-none animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="50" y1="15" x2="50" y2="85" />
                    <line x1="15" y1="50" x2="85" y2="50" />
                    <line x1="25" y1="25" x2="75" y2="75" />
                    <line x1="25" y1="75" x2="75" y2="25" />
                </svg>
                <svg className="absolute bottom-0 -right-16 w-80 h-96 text-emerald-500/10 pointer-events-none select-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="20" y1="90" x2="80" y2="10" />
                </svg>

                <div className="relative z-10 w-full">
                    {/* Logo — clickable back to home */}
                    <div className="flex items-center gap-3 mb-12 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logo} alt="Odyssey Logo" className="w-12 h-12 rounded-2xl shadow-xl border border-white/10 group-hover:border-emerald-400/50 transition-all" />
                        <span className="text-3xl font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">Odyssey</span>
                    </div>

                    <h2 className="text-5xl font-black text-white mb-6 leading-tight">
                        Your career journey
                        <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 font-extrabold">starts here.</span>
                    </h2>
                    <p className="text-emerald-100/80 text-lg max-w-md leading-relaxed mb-10">
                        Connect students with real-world projects from top companies.
                        Earn, learn, and build a portfolio that stands out.
                    </p>

                    {/* Demo quick-login cards */}
                    {DEMO_MODE && (
                        <div className="w-full max-w-md">
                            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                Demo Mode — Click to log in instantly
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {DEMO_ACCOUNTS.map(acc => (
                                    <button
                                        key={acc.role}
                                        onClick={() => handleDemoLogin(acc)}
                                        disabled={loading}
                                        className="bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3 p-3 rounded-2xl"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            {acc.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{acc.label}</p>
                                            <p className="text-emerald-200/60 text-[10px] mt-0.5 truncate max-w-[120px]">{acc.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right login form ── */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="card shadow-2xl w-full max-w-md animate-slide-up border-none shadow-gray-200/50">
                    {/* Mobile logo — clickable back to home */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logo} alt="Odyssey Logo" className="w-8 h-8 rounded-xl" />
                        <span className="text-xl font-bold text-text-heading group-hover:text-primary-600 transition-colors">Odyssey</span>
                    </div>

                    <h2 className="text-3xl font-bold text-text-heading mb-1">Welcome back</h2>
                    <p className="text-slate-400 dark:text-white/60 mb-8 font-medium">
                        {DEMO_MODE
                            ? <span className="text-primary-400 text-sm font-bold">Demo mode active — backend not required</span>
                            : 'Sign in to your account'}
                    </p>

                    {/* Mobile demo buttons */}
                    {DEMO_MODE && (
                        <div className="grid grid-cols-2 gap-2 mb-6 lg:hidden">
                            {DEMO_ACCOUNTS.map(acc => (
                                <button key={acc.role} onClick={() => handleDemoLogin(acc)} disabled={loading}
                                    className={`${acc.color} border rounded-xl px-3 py-2.5 text-left
                              transition-all duration-200 active:scale-95 disabled:opacity-50`}>
                                    <p className="font-medium text-text-heading text-sm">{acc.label}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    {showPhoneFlow ? (
                        <PhoneOTPFlow
                            onBack={() => setShowPhoneFlow(false)}
                            onVerified={(data) => navigate(ROLE_PATHS[data.role] || '/')}
                        />
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="label text-text-heading">Email address</label>
                                    <input type="email" className="input bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/30 dark:focus:bg-white/10" placeholder="you@example.com"
                                        value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="label text-text-heading">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} className="input bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/30 dark:focus:bg-white/10 pr-12" placeholder="••••••••"
                                            value={password} onChange={e => setPassword(e.target.value)} required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {DEMO_MODE && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Demo password: <code className="text-primary-600 dark:text-primary-400">demo1234</code></p>
                                    )}
                                </div>

                                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
                                    {loading
                                        ? <span className="spinner w-5 h-5" />
                                        : <>Sign In <ArrowRight size={18} /></>}
                                </button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/10"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#0B0F19] px-2 text-slate-500 dark:text-slate-400 font-bold">Or continue with</span></div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50 text-slate-700 dark:text-white bg-transparent"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-sm font-semibold text-text-heading">Sign in with Google</span>
                            </button>


                            <p className="text-center text-slate-500 dark:text-slate-400 mt-6 font-medium">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors">
                                    Sign up
                                </Link>
                            </p>
                        </>
                    )}

                    {DEMO_MODE && (
                        <div className="mt-6 p-4 bg-surface-50 border border-border rounded-xl text-xs text-text-body font-semibold">
                            <p className="font-semibold mb-1">ℹ️ Backend not required in Demo Mode</p>
                            <p className="text-text-muted">All data is local mock data. Start Spring Boot on port 8080 and set VITE_DEMO_MODE=false to use the real backend.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

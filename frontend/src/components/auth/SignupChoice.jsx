import React from 'react';
import { Mail, GraduationCap, Building2, School, ArrowLeft, Phone } from 'lucide-react';

const ROLE_LABELS = {
    STUDENT: { label: 'Student', icon: <GraduationCap className="w-4 h-4" /> },
    COMPANY: { label: 'Company', icon: <Building2 className="w-4 h-4" /> },
    COLLEGE_ADMIN: { label: 'College / University', icon: <School className="w-4 h-4" /> },
};

export default function SignupChoice({ role, onEmailSignup, onGoogleSignup, onMicrosoftSignup, onPhoneSignup, onBack }) {
    const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.STUDENT;

    return (
        <div className="space-y-4 animate-fade-in text-text-body">
            {/* Header with back button */}
            <div className="flex items-center gap-0 mb-2 px-2">
                <button type="button" onClick={onBack} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-heading hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all">
                    <ArrowLeft size={24} className="text-text-heading dark:text-white" />
                </button>
                <div className="flex-1 text-center pr-8">
                    <h3 className="font-bold text-text-heading dark:text-white text-xl">How would you like to sign up?</h3>
                    <div className="inline-flex items-center gap-1.5 mt-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {roleInfo.icon}
                        Joining as {roleInfo.label}
                    </div>
                </div>
            </div>

            {/* Social login buttons */}
            <button
                onClick={onGoogleSignup}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 
                           bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-semibold text-slate-700 dark:text-white group"
            >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
            </button>

            <button
                onClick={onMicrosoftSignup}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 
                           bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-semibold text-slate-700 dark:text-white group"
            >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 23 23">
                    <rect x="0" y="0" width="11" height="11" fill="#f25022" />
                    <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
                    <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
                    <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
                </svg>
                Continue with Microsoft
            </button>

            <button
                onClick={onPhoneSignup}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10 
                           bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-semibold text-slate-700 dark:text-white group"
            >
                <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                Continue with Phone (OTP)
            </button>

            <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                <span className="text-sm font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            </div>

            {/* Email signup */}
            <button
                onClick={onEmailSignup}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 
                           transition-all font-bold shadow-lg shadow-primary-600/20 group"
            >
                <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Sign up with Email
            </button>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { analyticsEvents } from '../firebase/analytics';
import toast from 'react-hot-toast';
import logo from '../assets/logo.jpg';
import { ArrowRight, Eye, EyeOff, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import SignupChoice from '../components/auth/SignupChoice';
import RoleSelection from '../components/auth/RoleSelection';
import StudentForm from '../components/profile/StudentForm';
import CollegeForm from '../components/profile/CollegeForm';
import CompanyForm from '../components/profile/CompanyForm';
import PhoneOTPFlow from '../components/auth/PhoneOTPFlow';

export default function RegisterPage() {
    // New flow: 1:Role → 2:Method (SignupChoice) → 3:EmailForm → 4:OTP → 5:Profile
    const [step, setStep] = useState(1);
    const [profileDone, setProfileDone] = useState(false);
    const [role, setRole] = useState('STUDENT');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, loginWithMicrosoft, registerWithEmail } = useAuth();
    const navigate = useNavigate();

    const ROLE_PATHS = { STUDENT: '/student', COMPANY: '/company', COLLEGE_ADMIN: '/college' };

    const handleGoogleSignup = async () => {
        setLoading(true);
        try {
            const fbUser = await loginWithGoogle();
            const idToken = await fbUser.getIdToken();

            const res = await authAPI.firebaseLogin({ idToken, role });
            const data = res.data.data;

            login(
                { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
                data.token
            );

            toast.success(`Welcome to Odyssey, ${data.fullName}!`);
            analyticsEvents.signUp(role, 'google');
            setStep(5);
        } catch (err) {
            console.error("Google signup failed", err);
            const msg = err.response?.data?.message || err.message || 'Google signup failed';
            if (!err.response && (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK')) {
                toast.error('Cannot reach the server. Please ensure the backend is running and CORS is configured.');
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMicrosoftSignup = async () => {
        setLoading(true);
        try {
            const fbUser = await loginWithMicrosoft();
            const idToken = await fbUser.getIdToken();

            const res = await authAPI.firebaseLogin({ idToken, role });
            const data = res.data.data;

            login(
                { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
                data.token
            );

            toast.success(`Welcome to Odyssey, ${data.fullName}!`);
            analyticsEvents.signUp(role, 'microsoft');
            setStep(5);
        } catch (err) {
            console.error("Microsoft signup failed", err);
            toast.error(err.response?.data?.message || err.message || 'Microsoft signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        setLoading(true);
        try {
            // 1. Register with Firebase
            const fbUser = await registerWithEmail(formData.email, formData.password, formData.fullName);
            const idToken = await fbUser.getIdToken();

            // 2. Register in Odyssey Backend (reusing firebaseLogin endpoint)
            const res = await authAPI.firebaseLogin({ idToken, role });
            const data = res.data.data;

            login(
                { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
                data.token
            );

            toast.success('Registration successful!');
            analyticsEvents.signUp(role, 'email');
            setStep(5);
        } catch (err) {
            console.error('Registration error:', err);
            toast.error(err.response?.data?.message || err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerified = (authData) => {
        const userData = {
            email: authData.email,
            fullName: authData.fullName,
            role: authData.role,
            profileId: authData.profileId,
            userId: authData.userId
        };
        login(userData, authData.token);
        analyticsEvents.signUp(role, authData.provider || 'phone');
        setStep(5);
    };

    const handleProfileComplete = () => {
        analyticsEvents.profileCompleted(role);
        setProfileDone(true);
    };

    const handleGoToDashboard = () => {
        navigate(ROLE_PATHS[role] || '/');
    };

    // Step labels for progress bar
    const STEP_LABELS = ['Role', 'Method', 'Profile'];
    // Step 1 -> index 0, Step 2 -> index 1, Step 3+ (EmailForm) -> index 1, Step 5 -> index 2
    const progressIndex = step === 5 ? 2 : step > 1 ? 1 : 0;

    return (
        <div className="min-h-screen bg-surface-100 flex items-center justify-center p-6">
            <div className="w-full max-w-xl animate-slide-up">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 mb-4 cursor-pointer group" onClick={() => navigate('/')}>
                        <img src={logo} alt="Odyssey Logo" className="w-12 h-12 rounded-2xl shadow-xl border border-white/10 group-hover:border-primary-400/50 transition-all" />
                        <span className="text-3xl font-black text-text-heading tracking-normal group-hover:text-primary-600 transition-colors">Odyssey</span>
                    </div>
                    <div>
                        <button 
                            onClick={() => navigate('/')} 
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:border-primary-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        >
                            <ArrowLeft size={16} /> Back to Home
                        </button>
                    </div>
                </div>

                {/* Progress Bar — visible from step 2 to 4 */}
                {step > 1 && step < 5 && (
                    <div className="mb-10">
                        <div className="flex items-start">
                            {STEP_LABELS.map((label, i) => {
                                const s = i + 1;
                                return (
                                    <div key={label} className="flex-1 relative flex flex-col items-center">
                                        {/* Line between circles — only between steps, not after last */}
                                        {i < STEP_LABELS.length - 1 && (
                                            <div className={`absolute top-4 left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] h-0.5 z-0
                                                ${i + 1 < progressIndex ? 'bg-primary-600' : 'bg-border'}`} 
                                            />
                                        )}
                                        {/* Circle */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 relative
                                            ${s === progressIndex
                                                ? 'bg-primary-600 text-white scale-110 shadow-lg ring-4 ring-primary-500/20'
                                                : s < progressIndex 
                                                    ? 'bg-primary-200 text-primary-700' 
                                                    : 'bg-border text-text-muted'}`}>
                                            {s < progressIndex ? '✓' : s}
                                        </div>
                                        {/* Label */}
                                        <span className={`mt-3 text-[10px] uppercase font-black tracking-widest transition-colors
                                            ${s === progressIndex ? 'text-primary-700' : 'text-text-muted'}`}>
                                            {label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="card shadow-2xl shadow-black/50 border-none p-8">

                    {/* STEP 1: Role Selection — first thing the user sees */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <RoleSelection
                                role={role}
                                onSelect={(r) => { setRole(r); setStep(2); }}
                                isFirstStep
                            />
                            <p className="text-center text-slate-500 pt-4 border-t border-slate-200 mt-6 font-semibold">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link>
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Signup Method — Google / Microsoft / Phone / Email */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <SignupChoice
                                role={role}
                                onEmailSignup={() => setStep(3)}
                                onGoogleSignup={handleGoogleSignup}
                                onMicrosoftSignup={handleMicrosoftSignup}
                                onPhoneSignup={() => setStep(4)}
                                onBack={() => setStep(1)}
                            />
                        </div>
                    )}

                    {/* STEP 3: Email Signup Form */}
                    {step === 3 && (
                        <form onSubmit={handleSignupSubmit} className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-0 mb-4 px-2">
                                <button type="button" onClick={() => setStep(2)} className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="flex-1 text-center pr-8">
                                    <h3 className="font-bold text-text-heading text-xl">Sign up with Email</h3>
                                    <p className="text-sm text-text-muted">Joining as {role.replace('_', ' ')}</p>
                                </div>
                            </div>

                            <div>
                                <label className="label">Full Name</label>
                                <input className="input" name="fullName" placeholder="John Doe"
                                    value={formData.fullName} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input className="input" type="email" name="email" placeholder="you@example.com"
                                    value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Password</label>
                                    <div className="relative">
                                        <input className="input pr-10" type={showPassword ? "text" : "password"} name="password" placeholder="••••••••"
                                            value={formData.password} onChange={handleChange} required minLength={8} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Confirm Password</label>
                                    <div className="relative">
                                        <input className="input pr-10" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="••••••••"
                                            value={formData.confirmPassword} onChange={handleChange} required minLength={8} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button type="submit"
                                className="btn-primary w-full py-4 mt-4 shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                                disabled={loading}>
                                {loading ? <span className="spinner w-6 h-6 border-white/30" /> : <>Continue <ArrowRight size={20} /></>}
                            </button>
                        </form>
                    )}

                    {/* STEP 4: Phone OTP Flow */}
                    {step === 4 && (
                        <PhoneOTPFlow
                            role={role}
                            onBack={() => setStep(2)}
                            onVerified={handleVerified}
                        />
                    )}


                    {/* STEP 5: Profile Completion */}
                    {step === 5 && !profileDone && (
                        <div className="animate-fade-in">
                            {!role && <div className="text-danger-600 bg-danger-50 p-4 rounded-xl text-center">Error: No role selected. Please restart registration.</div>}
                            {role === 'STUDENT' && <StudentForm onComplete={handleProfileComplete} />}
                            {role === 'COLLEGE_ADMIN' && <CollegeForm onComplete={handleProfileComplete} />}
                            {role === 'COMPANY' && <CompanyForm onComplete={handleProfileComplete} />}
                        </div>
                    )}

                    {/* STEP 6: Success Confirmation */}
                    {profileDone && (
                        <div className="animate-fade-in text-center py-8 space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-primary-500/10 flex items-center justify-center">
                                <CheckCircle2 size={40} className="text-primary-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-heading">Registration Complete!</h3>
                                <p className="text-text-muted mt-2">Your {role === 'STUDENT' ? 'student' : role === 'COMPANY' ? 'company' : 'college admin'} profile has been set up successfully.</p>
                            </div>
                            <div className="flex items-center gap-2 justify-center text-sm text-primary-500">
                                <Sparkles size={16} />
                                <span className="font-semibold">You're all set to explore Odyssey</span>
                            </div>
                            <button
                                onClick={handleGoToDashboard}
                                className="btn-primary w-full py-4 mt-4 shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                            >
                                Go to Dashboard <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Link as LinkIcon, Save, ShieldCheck, Github, Linkedin, Globe, Briefcase, GraduationCap, MapPin, Camera } from 'lucide-react';
import { studentAPI, collegeAPI, companyAPI, adminAPI } from '../../api/api';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { analyticsEvents } from '../../firebase/analytics';
import toast from 'react-hot-toast';

export default function ProfileSettings({ user }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarProgress, setAvatarProgress] = useState(0);
    const [courses, setCourses] = useState([]);

    const getAPI = () => {
        switch (user?.role) {
            case 'STUDENT': return studentAPI;
            case 'COMPANY': return companyAPI;
            case 'COLLEGE_ADMIN': return collegeAPI;
            case 'ADMIN': return adminAPI;
            default: return null;
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const api = getAPI();
            if (!api) {
                // No matching API — fill form from user context
                setForm({
                    fullName: user?.fullName || '',
                    email: user?.email || '',
                    bio: '', skills: '', degree: '', department: '', graduationYear: '',
                    linkedinUrl: '', githubUrl: '', portfolioUrl: '', profileImageUrl: '',
                    companyName: '', website: '', industry: '', description: '', logoUrl: '',
                    collegeName: '', city: '', state: '', accreditationDetails: '',
                });
                return;
            }
            
            // Handle different method names across APIs
            const fetchMethod = api.getMyProfile || api.getProfile;
            const res = await fetchMethod();
            const data = res.data.data;
            setProfile(data);
            
            // Initialize form based on role
            setForm({
                fullName: data.fullName || user.fullName || '',
                email: data.email || user.email || '',
                // Student fields
                bio: data.bio || '',
                skills: data.skills || '',
                degree: data.degree || '',
                department: data.department || '',
                graduationYear: data.graduationYear || '',
                linkedinUrl: data.linkedinUrl || '',
                githubUrl: data.githubUrl || '',
                portfolioUrl: data.portfolioUrl || '',
                profileImageUrl: data.profileImageUrl || '',
                // Company fields
                companyName: data.companyName || '',
                website: data.website || '',
                industry: data.industry || '',
                description: data.description || '',
                logoUrl: data.logoUrl || '',
                // College fields
                collegeName: data.collegeName || '',
                city: data.city || '',
                state: data.state || '',
                accreditationDetails: data.accreditationDetails || '',
            });

            if (user?.role === 'STUDENT' && data.collegeId) {
                studentAPI.getCollegeCourses(data.collegeId)
                    .then(courseRes => setCourses(courseRes.data.data || []))
                    .catch(console.error);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            const msg = err.response?.data?.message || err.message || 'Unknown error';
            toast.error(`Failed to load profile details: ${msg}`);
            // Fallback: fill form from user context so user can still edit
            setForm(prev => ({
                ...prev,
                fullName: prev.fullName || user?.fullName || '',
                email: prev.email || user?.email || '',
            }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user?.role]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const api = getAPI();
            await api.updateProfile(form);
            toast.success('Profile updated successfully! ✨');
            analyticsEvents.profileCompleted(user.role);
            fetchProfile(); // Refresh
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image size must be less than 2MB');
            return;
        }

        if (!storage) {
            toast.error('Firebase Storage is not initialized.');
            return;
        }

        setUploadingAvatar(true);
        setAvatarProgress(0);

        const folder = (user.role === 'COMPANY' || user.role === 'COLLEGE_ADMIN') ? 'logos' : 'avatars';
        const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const pct = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setAvatarProgress(pct);
            },
            (error) => {
                console.error(error);
                toast.error('Avatar upload failed.');
                setUploadingAvatar(false);
            },
            async () => {
                try {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    if (user.role === 'COMPANY' || user.role === 'COLLEGE_ADMIN') {
                        setForm(prev => ({ ...prev, logoUrl: downloadUrl }));
                    } else {
                        setForm(prev => ({ ...prev, profileImageUrl: downloadUrl }));
                    }
                    analyticsEvents.avatarUploaded();
                    toast.success('Avatar uploaded! Save profile to commit changes.');
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to get avatar URL.');
                } finally {
                    setUploadingAvatar(false);
                }
            }
        );
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="spinner w-10 h-10" />
            <p className="text-text-muted font-bold animate-pulse text-xs uppercase tracking-widest">Accessing Secure Profile...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20 pt-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-dark p-8 md:p-12 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-surface-900 border-2 border-primary-500/20 flex items-center justify-center text-3xl font-black text-white shadow-2xl relative group overflow-hidden cursor-pointer">
                            {((user.role === 'COMPANY' || user.role === 'COLLEGE_ADMIN') ? form.logoUrl : form.profileImageUrl) ? (
                                <img 
                                    src={(user.role === 'COMPANY' || user.role === 'COLLEGE_ADMIN') ? form.logoUrl : form.profileImageUrl} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-[2.5rem]" 
                                />
                            ) : (
                                <span>{form.fullName?.charAt(0) || user.fullName?.charAt(0)}</span>
                            )}
                            
                            {uploadingAvatar ? (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-1 rounded-[2.5rem]">
                                    <div className="spinner w-6 h-6 border-primary-500" />
                                    <span className="text-[10px] font-bold text-white mt-1">{avatarProgress}%</span>
                                </div>
                            ) : (
                                <label className="absolute inset-0 bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                                    <Camera size={20} className="mb-1" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">Change</span>
                                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleAvatarChange} />
                                </label>
                            )}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-normal uppercase leading-none mb-2">
                                {form.fullName || 'User Profile'}
                            </h1>
                            <p className="text-primary-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck size={14} /> verified {user.role?.replace('_', ' ')} account
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Common Section */}
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40 mb-4">Core Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input 
                                        className="input pl-12 "
                                        value={form.fullName}
                                        onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Email Address (Primary)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input 
                                        className="input pl-12 !text-white/40 cursor-not-allowed italic"
                                        value={form.email}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Sections */}
                    {user.role === 'STUDENT' && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Professional Bio</label>
                                <textarea 
                                    className="textarea h-32  h-32"
                                    value={form.bio}
                                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="Tell us about your background and aspirations..."
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Skills (Comma Separated)</label>
                                <input 
                                    className="input "
                                    value={form.skills}
                                    onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
                                    placeholder="React, Node.js, Python, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Degree / Course</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    {courses.length > 0 ? (
                                        <select 
                                            className="input pl-12 cursor-pointer"
                                            value={form.degree}
                                            onChange={e => setForm(p => ({ ...p, degree: e.target.value }))}
                                        >
                                            <option value="">Select Degree...</option>
                                            {courses.map((course, i) => (
                                                <option key={i} value={course}>{course}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input 
                                            className="input pl-12 "
                                            value={form.degree}
                                            onChange={e => setForm(p => ({ ...p, degree: e.target.value }))}
                                            placeholder="e.g. B.Tech, MBA"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Department</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input 
                                        className="input pl-12 "
                                        value={form.department}
                                        onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                        placeholder="e.g. Computer Science"
                                    />
                                </div>
                            </div>
                            <div className="space-y-6 pt-8 md:col-span-2 border-t border-white/5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-40">Digital Footprint</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative group">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white" size={18} />
                                        <input className="input pl-12 " placeholder="GitHub URL" value={form.githubUrl} onChange={e => setForm(p => ({...p, githubUrl: e.target.value}))} />
                                    </div>
                                    <div className="relative group">
                                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#0077b5]" size={18} />
                                        <input className="input pl-12 " placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={e => setForm(p => ({...p, linkedinUrl: e.target.value}))} />
                                    </div>
                                    <div className="relative group">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary-500" size={18} />
                                        <input className="input pl-12 " placeholder="Portfolio URL" value={form.portfolioUrl} onChange={e => setForm(p => ({...p, portfolioUrl: e.target.value}))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {user.role === 'COMPANY' && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input className="input pl-12 " value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input className="input pl-12 " value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Industry</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input className="input pl-12 " value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">About Company</label>
                                <textarea className="textarea h-32 " value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                        </div>
                    )}

                    {user.role === 'COLLEGE_ADMIN' && (
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Institution Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input className="input pl-12 " value={form.collegeName} onChange={e => setForm(p => ({ ...p, collegeName: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
                                    <input className="input pl-12 " value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">State</label>
                                <input className="input " value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-white/60">Accreditation & Details</label>
                                <textarea className="textarea h-32  font-mono text-xs" value={form.accreditationDetails} onChange={e => setForm(p => ({ ...p, accreditationDetails: e.target.value }))} />
                            </div>
                        </div>
                    )}

                    <div className="md:col-span-2 flex justify-end gap-4 pt-10 mt-10 border-t border-white/10">
                        <button 
                            type="button" 
                            onClick={fetchProfile}
                            className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-surface-100/40 hover:text-white transition-all"
                        >
                            Reset System
                        </button>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-10 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-premium transition-all active:scale-95"
                        >
                            {saving ? <div className="spinner w-4 h-4 border-white/30" /> : <Save size={16} />}
                            Synchronize Profile
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

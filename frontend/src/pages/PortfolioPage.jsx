import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Search, School, CheckCircle2, Github as GithubIcon, 
    Linkedin as LinkedinIcon, Globe, Star, ShieldCheck,
    Clock, Target, GraduationCap, Briefcase, ArrowLeft
} from 'lucide-react';
import { studentAPI, reviewAPI } from '../api/api';
import toast from 'react-hot-toast';

function StarRating({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={16} className={s <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-text-muted'} />
            ))}
        </div>
    );
}

export default function PortfolioPage() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId || studentId === 'undefined') {
            setLoading(false);
            return;
        }
        const load = async () => {
            try {
                const [profileRes, reviewRes] = await Promise.all([
                    studentAPI.getPortfolio(studentId),
                    reviewAPI.getByStudent(studentId),
                ]);
                setProfile(profileRes.data.data);
                setReviews(reviewRes.data.data || []);
            } catch {
                toast.error('Failed to load portfolio');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="spinner w-10 h-10" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-center">
                <div>
                    <Search size={48} className="text-surface-100/20 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-heading mb-2">Portfolio Not Found</h2>
                    <p className="text-text-body mb-6">This student's portfolio is not available.</p>
                    <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
                </div>
            </div>
        );
    }

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const skillList = profile.skills ? profile.skills.split(',').map(s => s.trim()) : [];

    return (
        <div className="min-h-screen bg-background">
            {/* Back */}
            <div className="max-w-4xl mx-auto px-6 pt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-text-body hover:text-white transition-all"
                >
                    <div className="w-10 h-10 flex items-center justify-center bg-white/5 group-hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                        <ArrowLeft size={24} />
                    </div>
                    <span className="font-medium">Back</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Hero Card */}
                <div className="card">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center text-text-heading font-bold text-3xl flex-shrink-0">
                            {profile.studentProfileImageUrl ? (
                                <img src={profile.studentProfileImageUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                profile.fullName?.[0] || '?' 
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-3">
                                <div>
                                    <h1 className="text-2xl font-bold text-text-heading">{profile.fullName}</h1>
                                    <p className="text-text-body text-sm mt-0.5">{profile.email}</p>
                                    {profile.collegeName && (
                                        <p className="text-primary-400 text-sm mt-1">{profile.collegeName}</p>
                                    )}
                                </div>
                                    {profile.verificationStatus === 'VERIFIED' 
                                        ? <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold border border-emerald-500/20">
                                            <ShieldCheck size={12} /> Verified
                                          </span>
                                        : <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold border border-amber-500/20">
                                            <Clock size={12} /> Pending
                                          </span>
                                    }
                            </div>

                            {profile.bio && (
                                <p className="text-text-body text-sm mt-3 leading-relaxed">{profile.bio}</p>
                            )}

                            <div className="flex flex-wrap gap-3 mt-3">
                                {profile.githubUrl && (
                                    <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                                        className="text-sm text-text-body hover:text-text-heading transition-colors flex items-center gap-1.5 bg-surface-50 px-3 py-1.5 rounded-lg border border-border hover:border-gray-500">
                                        <GithubIcon size={16} /> GitHub
                                    </a>
                                )}
                                {profile.linkedinUrl && (
                                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                                        className="text-sm text-text-body hover:text-text-heading transition-colors flex items-center gap-1.5 bg-surface-50 px-3 py-1.5 rounded-lg border border-border hover:border-gray-500">
                                        <LinkedinIcon size={16} /> LinkedIn
                                    </a>
                                )}
                                {profile.portfolioUrl && (
                                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer"
                                        className="text-sm text-text-body hover:text-text-heading transition-colors flex items-center gap-1.5 bg-surface-50 px-3 py-1.5 rounded-lg border border-border hover:border-gray-500">
                                        <Globe size={16} /> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Projects Done', value: profile.completedProjects || 0, icon: <CheckCircle2 size={20} className="text-primary-500" /> },
                        { label: 'Avg Rating', value: avgRating ? `${avgRating}` : 'N/A', icon: <Star size={20} className="text-amber-500" /> },
                        { label: 'Activity', value: profile.completedProjects > 0 ? 'Active' : 'New', icon: <Target size={20} className="text-emerald-500" /> },
                        { label: 'Grad Year', value: profile.graduationYear || '—', icon: <GraduationCap size={20} className="text-accent-500" /> },
                    ].map(s => (
                        <div key={s.label} className="card text-center">
                            <p className="text-2xl mb-1">{s.icon}</p>
                            <p className="font-bold text-text-heading text-lg">{s.value}</p>
                            <p className="text-xs text-text-muted">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Skills */}
                {skillList.length > 0 && (
                    <div className="card">
                        <h2 className="font-black text-text-heading mb-4 flex items-center gap-2 uppercase tracking-normal text-sm">
                            <Briefcase size={18} className="text-primary-500" /> Skills & Expertise
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {skillList.map(skill => (
                                <span key={skill} className="skill-tag text-sm px-3 py-1.5">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews */}
                {reviews.length > 0 && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-text-heading">Reviews from Companies</h2>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[#854d0e]">{avgRating}</span>
                                <StarRating rating={Math.round(parseFloat(avgRating))} />
                                <span className="text-text-muted text-sm">({reviews.length})</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="p-4 bg-surface-50 rounded-xl border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary-600
                                                flex items-center justify-center text-text-heading font-bold text-sm">
                                                {review.companyName[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-text-heading text-sm">{review.companyName}</p>
                                                <p className="text-xs text-text-muted">{review.projectTitle}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={review.rating} />
                                            <span className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-body italic">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {reviews.length === 0 && (
                    <div className="card text-center py-10 text-text-muted">
                        <Star size={32} className="text-amber-500 mx-auto mb-2 opacity-20" />
                        <p>No reviews yet on this profile</p>
                    </div>
                )}
            </div>
        </div>
    );
}

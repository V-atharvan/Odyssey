import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import ProjectCard from '../ProjectCard';
import { projectAPI, studentAPI } from '../../api/api';
import { analyticsEvents } from '../../firebase/analytics';
import toast from 'react-hot-toast';

function ApplyModal({ project, onClose, onSuccess }) {
    const [pitch, setPitch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (!pitch.trim()) return toast.error('Please write a pitch');
        if (pitch.split(' ').length > 100) return toast.error('Pitch must be under 100 words');
        
        setLoading(true);
        try {
            await projectAPI.apply(project.id, { pitch });
            toast.success('Application submitted! 🎉');
            analyticsEvents.applicationSubmitted(project.id, project.title);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="card shadow-2xl shadow-black/50 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden animate-slide-up p-0">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-normal">Project Pitch</h3>
                            <p className="text-sm text-white/60 mt-1 font-medium">Applying to <span className="text-primary-500">{project.title}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-black text-white/50 uppercase tracking-widest mb-3">Your 2-Sentence Pitch</label>
                        <textarea
                            className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border-2 border-white/5 focus:border-primary-500 focus:bg-white/[0.06] outline-none transition-all font-medium text-white h-40 resize-none shadow-inner placeholder:text-white/20"
                            placeholder="Hook them with your best work. Why are you the perfect match for this specific task?"
                            value={pitch}
                            onChange={e => setPitch(e.target.value)}
                        />
                        <div className="flex justify-between mt-2 px-1">
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Tip: Keep it short and impactful</p>
                            <span className={`text-[10px] font-black ${pitch.length > 500 ? 'text-red-500' : 'text-primary-500'}`}>{pitch.length} / 500</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/10 transition-all active:scale-95">
                            Not Now
                        </button>
                        <button onClick={handleApply} className="flex-2 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold shadow-lg shadow-primary-500/20 hover:translate-y-[-2px] transition-all active:scale-95 px-8" disabled={loading}>
                            {loading ? 'Submitting...' : '🚀 Submit Pitch'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProjectExplorer({ studentProfile, onProjectsLoaded }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingTo, setApplyingTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await studentAPI.getMatchedProjects();
            const content = res.data.data.content || [];
            setProjects(content);
            if (onProjectsLoaded) {
                onProjectsLoaded(content);
            }
        } catch {
            toast.error('Failed to load project feed');
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {applyingTo && (
                <ApplyModal 
                    project={applyingTo} 
                    onClose={() => setApplyingTo(null)} 
                    onSuccess={fetchProjects}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 max-w-md relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-text-muted group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for your next big project..." 
                        className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-3xl outline-none shadow-sm transition-all font-medium text-text-heading placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all
                                ${selectedCategory === cat 
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-200/20' 
                                    : 'bg-surface-50 text-text-muted hover:text-white border border-white/10 shadow-sm'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-96 rounded-3xl bg-white/50 animate-pulse border border-border"></div>
                    ))}
                </div>
            ) : studentProfile?.verificationStatus !== 'VERIFIED' ? (
                <div className="text-center py-24 bg-amber-500/5 rounded-[2.5rem] border-2 border-dashed border-amber-500/20 animate-fade-in shadow-2xl shadow-amber-500/5">
                    <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500 ring-8 ring-amber-500/5">
                        <Clock size={48} className="animate-pulse" />
                    </div>
                    <h3 className="text-3xl font-black text-text-heading mb-4 tracking-normal">Institutional Access Pending</h3>
                    <p className="text-text-muted max-w-lg mx-auto text-lg leading-relaxed font-medium">
                        Your account is currently {studentProfile?.verificationStatus?.toLowerCase() || 'pending'} by your college. 
                        Verified students get exclusive access to partnered company projects.
                    </p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-surface-50 backdrop-blur-md rounded-3xl border border-white/10">
                    <p className="text-6xl mb-6">🔍</p>
                    <h3 className="text-xl font-bold text-text-heading mb-2">No projects found</h3>
                    <p className="text-text-muted">Try adjusting your search or filters to see more opportunities from your college's partner network.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
                    {filteredProjects.map(p => (
                        <ProjectCard 
                            key={p.id} 
                            project={p} 
                            showMatchScore={true}
                            onApply={(proj) => {
                                if (studentProfile?.verificationStatus !== 'VERIFIED') {
                                    toast.error('Verify your profile with your College to start applying.');
                                    return;
                                }
                                setApplyingTo(proj);
                            }}
                            onView={(proj) => {
                                analyticsEvents.projectViewed(proj.id, proj.title);
                                toast.info(`Viewing details for ${proj.title}`);
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

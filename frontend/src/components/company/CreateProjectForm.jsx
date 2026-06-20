import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { projectAPI } from '../../api/api';
import { logOdysseyEvent } from '../../firebase/analytics';
import toast from 'react-hot-toast';

const CATEGORIES = [
    'Web Development',
    'Mobile App',
    'AI / Machine Learning',
    'UI/UX Design',
    'Content Writing',
    'Marketing',
    'Data Analysis',
    'Blockchain'
];

export default function CreateProjectForm({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        category: '',
        description: '',
        requirements: '',
        skillsRequired: [],
        durationWeeks: '',
        maxApplicants: 10,
        deadline: ''
    });
    const [skillInput, setSkillInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [matchingStudents, setMatchingStudents] = useState(0);

    // Mock live matching preview
    useEffect(() => {
        if (form.skillsRequired.length > 0) {
            // In a real app, you'd call an API like /api/students/count?skills=...
            const count = Math.floor(Math.random() * 20) + 5;
            setMatchingStudents(count);
        } else {
            setMatchingStudents(0);
        }
    }, [form.skillsRequired]);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const addSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!form.skillsRequired.includes(skillInput.trim())) {
                setForm(p => ({ ...p, skillsRequired: [...p.skillsRequired, skillInput.trim()] }));
            }
            setSkillInput('');
        }
    };

    const removeSkill = (skill) => {
        setForm(p => ({ ...p, skillsRequired: p.skillsRequired.filter(s => s !== skill) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await projectAPI.create({
                ...form,
                durationWeeks: parseInt(form.durationWeeks)
            });
            toast.success('Project posted successfully! 🚀');
            logOdysseyEvent('project_created', { title: form.title, category: form.category });
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-[#0B0F19] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/5">
                    <div 
                        className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-500 ease-out" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-normal uppercase">New Initiative Deployment</h2>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                Phase {step} of 3 • {
                                    step === 1 ? 'Primary Identity' : step === 2 ? 'Resource Allocation' : 'Final Authorization'
                                }
                            </p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Mission Objective (Title)</label>
                                    <input 
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-bold text-white placeholder:text-white/10 shadow-inner"
                                        name="title" placeholder="e.g. Modern E-commerce Frontend with React"
                                        value={form.title} onChange={handleChange} required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Functional Domain (Category)</label>
                                    <select 
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-bold text-white appearance-none shadow-inner"
                                        name="category" value={form.category} onChange={handleChange} required
                                    >
                                        <option value="" className="bg-[#0B0F19]">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0B0F19]">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Strategic Brief (Description)</label>
                                    <textarea 
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-medium text-white/80 placeholder:text-white/10 h-40 resize-none shadow-inner"
                                        name="description" placeholder="Describe the challenges and goals..."
                                        value={form.description} onChange={handleChange} required 
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Deployment Timeline (Weeks)</label>
                                    <input 
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-black text-2xl text-emerald-400 shadow-inner"
                                        type="number" name="durationWeeks" placeholder="4"
                                        value={form.durationWeeks} onChange={handleChange} required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Specialized Skillsets required</label>
                                    <div className="space-y-4">
                                        <input 
                                            className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-bold text-white placeholder:text-white/10 shadow-inner"
                                            placeholder="Type skillset and press Enter..."
                                            value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={addSkill}
                                        />
                                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                                            {form.skillsRequired.map(s => (
                                                <span key={s} className="px-4 py-2 rounded-xl bg-white/5 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-white/10 animate-pop">
                                                    {s}
                                                    <button type="button" onClick={() => removeSkill(s)} className="text-white/20 hover:text-red-500 transition-colors">✕</button>
                                                </span>
                                            ))}
                                        </div>
                                        {form.skillsRequired.length > 0 && (
                                            <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 animate-fade-in">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                                <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest leading-none">
                                                    Current Reach: <span className="text-white text-sm">{matchingStudents} Qualified Talent</span> found.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShieldCheck size={100} className="rotate-12" />
                                    </div>
                                    <h4 className="font-black text-white uppercase tracking-normal text-xl mb-3 relative z-10">Strategic Authorization Required</h4>
                                    <p className="text-sm text-white/40 leading-relaxed font-bold italic relative z-10">
                                        "Deployment will instantly ping matching talent in our verified network. Ensure mission critical details are finalized before launch."
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Application Deadline</label>
                                    <input 
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-bold text-white shadow-inner inv-scheme-dark"
                                        type="datetime-local" name="deadline"
                                        value={form.deadline} onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Ancillary Directives (Requirements)</label>
                                    <textarea 
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-white/[0.03] border-2 border-white/5 focus:border-emerald-500 focus:bg-white/5 outline-none transition-all font-medium text-white/80 placeholder:text-white/10 h-32 resize-none shadow-inner"
                                        name="requirements" placeholder="Hardware required? Specific timezone? GitHub portfolio?"
                                        value={form.requirements} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-8 border-t border-white/5 bg-[#0B0F19] sticky bottom-0 z-20">
                            {step > 1 && (
                                <button 
                                    type="button" onClick={prevStep}
                                    className="px-10 py-5 rounded-[1.5rem] border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all active:scale-95"
                                >
                                    Reconfigure
                                </button>
                            )}
                            {step < 3 ? (
                                <button 
                                    type="button" onClick={nextStep}
                                    className="flex-1 px-10 py-5 rounded-[1.5rem] bg-white text-[#0B0F19] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white shadow-2xl transition-all active:scale-95 disabled:opacity-20"
                                    disabled={!form.title || !form.category || !form.description}
                                >
                                    Proceed to Allocation
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    className="flex-1 px-10 py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? 'Authorizing...' : '🚀 Authorize Deployment'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

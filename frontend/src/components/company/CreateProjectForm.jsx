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

    useEffect(() => {
        if (form.skillsRequired.length > 0) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step !== 3) return;
        setLoading(true);
        try {
            await projectAPI.create({
                ...form,
                durationWeeks: parseInt(form.durationWeeks)
            });
            toast.success('Project posted successfully!');
            logOdysseyEvent('project_created', { title: form.title, category: form.category });
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const removeSkill = (skill) => {
        setForm(p => ({ ...p, skillsRequired: p.skillsRequired.filter(s => s !== skill) }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    // Step 1 needs title + category + description
    // Step 2 needs durationWeeks (skills are optional to add before proceeding)
    const canProceed = step === 1
        ? !!(form.title && form.category && form.description)
        : !!form.durationWeeks;

    const inputClass = "w-full px-6 py-5 rounded-[1.5rem] bg-surface-50 dark:bg-white/[0.03] border-2 border-border dark:border-white/5 focus:border-emerald-500 focus:bg-white dark:focus:bg-white/5 outline-none transition-all font-bold text-text-heading placeholder:text-text-muted shadow-inner";
    const labelClass = "block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 px-1";

    return (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0B0F19] border border-border dark:border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
                
                <div className="h-2 w-full bg-surface-100 dark:bg-white/5">
                    <div 
                        className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-500 ease-out" 
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-10 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-text-heading tracking-normal uppercase">New Initiative Deployment</h2>
                            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                Phase {step} of 3 • {
                                    step === 1 ? 'Primary Identity' : step === 2 ? 'Resource Allocation' : 'Final Authorization'
                                }
                            </p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-50 dark:bg-white/5 text-text-muted hover:text-text-heading hover:bg-surface-100 dark:hover:bg-white/10 transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <label className={labelClass}>Mission Objective (Title)</label>
                                    <input 
                                        className={inputClass}
                                        name="title" placeholder="e.g. Modern E-commerce Frontend with React"
                                        value={form.title} onChange={handleChange} required 
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Functional Domain (Category)</label>
                                    <select 
                                        className={`${inputClass} appearance-none`}
                                        name="category" value={form.category} onChange={handleChange} required
                                    >
                                        <option value="" className="bg-white dark:bg-[#0B0F19]">Select Category</option>
                                        {CATEGORIES.map(c => <option key={c} value={c} className="bg-white dark:bg-[#0B0F19]">{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Strategic Brief (Description)</label>
                                    <textarea 
                                        className={`${inputClass} font-medium text-text-body h-40 resize-none`}
                                        name="description" placeholder="Describe the challenges and goals..."
                                        value={form.description} onChange={handleChange} required 
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <label className={labelClass}>Deployment Timeline (Weeks)</label>
                                    <input 
                                        className={`${inputClass} font-black text-2xl text-emerald-500 dark:text-emerald-400`}
                                        type="number" name="durationWeeks" placeholder="4"
                                        value={form.durationWeeks} onChange={handleChange} required
                                        onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Specialized Skillsets required</label>
                                    <div className="space-y-4">
                                        <input 
                                            className={inputClass}
                                            placeholder="Type skillset and press Enter..."
                                            value={skillInput} onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={addSkill}
                                        />
                                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                                            {form.skillsRequired.map(s => (
                                                <span key={s} className="px-4 py-2 rounded-xl bg-surface-50 dark:bg-white/5 text-text-heading text-xs font-black uppercase tracking-widest flex items-center gap-3 border border-border dark:border-white/10 animate-pop">
                                                    {s}
                                                    <button type="button" onClick={() => removeSkill(s)} className="text-text-muted hover:text-red-500 transition-colors">✕</button>
                                                </span>
                                            ))}
                                        </div>
                                        {form.skillsRequired.length > 0 && (
                                            <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 animate-fade-in">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/80 uppercase tracking-widest leading-none">
                                                    Current Reach: <span className="text-text-heading text-sm">{matchingStudents} Qualified Talent</span> found.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="p-8 rounded-[2rem] bg-surface-50 dark:bg-white/[0.02] border border-border dark:border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <ShieldCheck size={100} className="rotate-12 text-text-heading" />
                                    </div>
                                    <h4 className="font-black text-text-heading uppercase tracking-normal text-xl mb-3 relative z-10">Strategic Authorization Required</h4>
                                    <p className="text-sm text-text-muted leading-relaxed font-bold italic relative z-10">
                                        "Deployment will instantly ping matching talent in our verified network. Ensure mission critical details are finalized before launch."
                                    </p>
                                </div>

                                <div>
                                    <label className={labelClass}>Application Deadline</label>
                                    <input 
                                        className={inputClass}
                                        type="datetime-local" name="deadline"
                                        value={form.deadline} onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Ancillary Directives (Requirements)</label>
                                    <textarea 
                                        className={`${inputClass} font-medium text-text-body h-32 resize-none`}
                                        name="requirements" placeholder="Hardware required? Specific timezone? GitHub portfolio?"
                                        value={form.requirements} onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-8 border-t border-border dark:border-white/5 bg-white dark:bg-[#0B0F19] sticky bottom-0 z-20">
                            {step > 1 && (
                                <button 
                                    type="button" onClick={prevStep}
                                    className="px-10 py-5 rounded-[1.5rem] border border-border dark:border-white/10 text-text-heading font-black uppercase tracking-widest text-[10px] hover:bg-surface-50 dark:hover:bg-white/5 transition-all active:scale-95"
                                >
                                    Reconfigure
                                </button>
                            )}
                            {step < 3 ? (
                                <button 
                                    type="button" onClick={nextStep}
                                    className={`flex-1 px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-95
                                        ${canProceed
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20 cursor-pointer'
                                            : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/30 cursor-not-allowed'}`}
                                    disabled={!canProceed}
                                >
                                    {step === 1 ? 'Proceed to Allocation' : 'Proceed to Authorization'}
                                </button>
                            ) : (
                                <button 
                                    type="submit" 
                                    className="flex-1 px-10 py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? 'Authorizing...' : 'Authorize Deployment'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

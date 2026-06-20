import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Clock, ArrowRight, Sparkles, Users } from 'lucide-react';

export default function ProjectCard({ project, onApply, onView, showMatchScore }) {
    const skills = project.skillsRequired || [];

    return (
        <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="rounded-[1.5rem] bg-surface-900/50 backdrop-blur-md border border-white/10 p-6 flex flex-col h-full relative overflow-hidden group hover:bg-surface-900/80 transition-all hover:shadow-[0_0_40px_-10px_rgba(var(--color-primary-500),0.15)]"
        >
            {/* Header with Company logo and Match Score */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 font-black text-xl shadow-lg">
                        {project.companyName?.[0] || 'O'}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            {project.companyName || 'Verified Company'}
                        </p>
                        <h3 className="font-bold text-lg text-white leading-tight line-clamp-2 pr-2">
                            {project.title}
                        </h3>
                    </div>
                </div>

                {showMatchScore && project.matchScore > 0 && (
                    <div className="flex flex-col items-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 mb-1">MATCH</span>
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="20" cy="20" r="18" className="text-white/5 stroke-current" strokeWidth="3" fill="transparent" />
                                <motion.circle
                                    cx="20" cy="20" r="18"
                                    className="text-primary-500 stroke-current"
                                    strokeWidth="3"
                                    strokeDasharray={113}
                                    initial={{ strokeDashoffset: 113 }}
                                    animate={{ strokeDashoffset: 113 * (1 - project.matchScore) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    fill="transparent"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-black text-primary-400">
                                    {Math.round(project.matchScore * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Category Tag */}
            <div className="mb-4">
                 <span className="text-primary-400 text-[10px] font-black uppercase tracking-widest">
                     {project.category || 'General'}
                 </span>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-sm font-medium line-clamp-2 leading-relaxed mb-4">
                {project.description}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-6">
                {skills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                        {skill}
                    </span>
                ))}
                {skills.length > 3 && (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                        +{skills.length - 3} more
                    </span>
                )}
            </div>

            {/* STIPEND & DURATION (Side-by-side) */}
            <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                <div>
                    <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1 uppercase">Stipend</p>
                    <p className="text-base font-black text-white">
                        {project.stipendAmount && project.stipendAmount > 0 
                            ? `₹${project.stipendAmount.toLocaleString()}` 
                            : 'Unpaid / Equity'}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1 uppercase">Duration</p>
                    <p className="text-base font-black text-white">{project.durationWeeks} Weeks</p>
                </div>
            </div>

            {/* Applicants & Status */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-surface-900 shadow-sm" />
                        <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-surface-900 shadow-sm opacity-80" />
                        <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-surface-900 shadow-sm opacity-60" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                        {project.applications?.length || 0} applications
                    </span>
                </div>
                <div className="px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-wider">
                    {project.status || 'OPEN'}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                {onView && (
                    <button 
                        onClick={() => onView(project)} 
                        className="py-2.5 rounded-xl border border-primary-500/30 text-primary-400 font-bold text-[13px] hover:bg-primary-500/10 transition-colors"
                    >
                        View
                    </button>
                )}
                {onApply && project.status === 'OPEN' && (
                    <button 
                        onClick={() => onApply(project)} 
                        className="py-2.5 rounded-xl bg-primary-600 text-white font-bold text-[13px] shadow hover:bg-primary-500 transition-colors"
                    >
                        Apply
                    </button>
                )}
            </div>
            
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[50px] pointer-events-none" />
        </motion.div>
    );
}

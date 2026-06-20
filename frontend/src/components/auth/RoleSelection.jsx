import React from 'react';
import { GraduationCap, School, Building2, ArrowLeft } from 'lucide-react';

const ROLES = [
    { value: 'STUDENT', label: 'Student', icon: <GraduationCap />, desc: 'Work on real projects, build your portfolio, and earn money.' },
    { value: 'COMPANY', label: 'Company', icon: <Building2 />, desc: 'Post micro-internships and hire elite student talent.' },
    { value: 'COLLEGE_ADMIN', label: 'College / University', icon: <School />, desc: 'Manage students, verify skills, and track placement performance.' },
];

export default function RoleSelection({ role, onSelect, onBack, isFirstStep = false }) {
    return (
        <div className="space-y-4 animate-fade-in relative">
            <div className={`flex items-center gap-0 mb-6 ${isFirstStep ? 'justify-center' : 'px-2'}`}>
                {!isFirstStep && (
                    <button type="button" onClick={onBack} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-heading hover:bg-surface-200 rounded-xl transition-all">
                        <ArrowLeft size={24} />
                    </button>
                )}
                <div className={`flex-1 ${isFirstStep ? 'text-center' : 'text-center pr-8'}`}>
                    <h3 className="font-bold text-text-heading text-2xl">I am a…</h3>
                    <p className="text-sm text-text-muted mt-1">Choose your role to get started</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {ROLES.map(r => (
                    <button
                        key={r.value}
                        type="button"
                        onClick={() => onSelect(r.value)}
                        className={`w-full group flex items-start gap-4 p-5 rounded-2xl border-2 
                                   text-left transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl
                          ${role === r.value
                                ? 'border-primary-500 bg-surface-200 shadow-lg shadow-primary-500/10 dark:shadow-primary-500/5'
                                : 'border-border bg-surface-200 hover:border-primary-500'}`}
                    >
                        <div className={`p-4 rounded-xl transition-colors duration-300
                                       ${role === r.value ? 'bg-primary-600 text-white shadow-lg' : 'bg-surface-100 text-text-muted group-hover:text-primary-600 shadow-sm'}`}>
                            {React.cloneElement(r.icon, { className: "w-8 h-8" })}
                        </div>
                        <div className="flex-1 mt-1">
                            <p className="font-bold text-text-heading text-lg leading-tight mb-1">{r.label}</p>
                            <p className="text-sm text-text-body leading-relaxed">{r.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

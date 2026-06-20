import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, color = 'primary', trend, variant = 'default', onClick }) {
    const isStrategic = variant === 'strategic';

    const iconColors = {
        primary: 'bg-primary-500/10 text-primary-600 border-primary-500/10',
        accent: 'bg-accent-500/10 text-accent-600 border-accent-500/10',
        emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/10',
        amber: 'bg-amber-500/10 text-amber-600 border-amber-500/10',
        rose: 'bg-red-500/10 text-red-600 border-red-500/10',
    };

    const gradientColors = {
        primary: 'from-primary-500/20 to-transparent',
        emerald: 'from-emerald-500/20 to-transparent',
        amber: 'from-amber-500/20 to-transparent',
        accent: 'from-accent-500/20 to-transparent',
        rose: 'from-red-500/20 to-transparent',
    };

    return (
        <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={onClick}
            className={`glass-card card-hover group p-8 relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/5 ${onClick ? 'cursor-pointer select-none' : ''}`}
        >
            {/* Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-radial ${gradientColors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />
            
            <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center border ${iconColors[color] || iconColors.primary} shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                        <span className="text-2xl drop-shadow-sm">
                            {icon}
                        </span>
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider shadow-sm transition-transform duration-300 group-hover:scale-105 ${trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className={`text-[10px] text-text-heading font-black uppercase tracking-[0.25em] group-hover:text-primary-400 transition-colors duration-300`}>
                        {label}
                    </p>
                    <p className={`text-4xl font-black text-text-heading tracking-normal leading-none group-hover:text-primary-400 transition-colors duration-300`}>
                        {value}
                    </p>
                </div>
            </div>
            
            {/* Bottom Accent */}
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color === 'emerald' ? 'emerald' : 'primary'}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </motion.div>
    );
}

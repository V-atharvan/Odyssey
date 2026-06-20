import React, { useState, useEffect } from 'react';
import { Search, Building2, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { companyAPI } from '../../api/api';
import toast from 'react-hot-toast';
import StatusBadge from '../StatusBadge';

export default function PartnerColleges() {
    const [query, setQuery] = useState('');
    const [colleges, setColleges] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchColleges = async (searchQuery = '') => {
        setLoading(true);
        try {
            const res = await companyAPI.searchColleges(searchQuery);
            setColleges(res.data.data);
        } catch (error) {
            toast.error('Failed to search colleges');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await companyAPI.getSentRequests();
            setSentRequests(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch requests');
        }
    };

    useEffect(() => {
        fetchColleges();
        fetchRequests();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchColleges(query);
    };

    const handleSendRequest = async (collegeId) => {
        try {
            await companyAPI.sendRequest(collegeId);
            toast.success('Partnership request sent!');
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'ACCEPTED': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'REJECTED': return <XCircle className="text-red-500" size={18} />;
            case 'PENDING': default: return <Clock className="text-amber-500" size={18} />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Search Section */}
            <div className="card shadow-premium border-none">
                <h3 className="font-bold text-text-heading mb-6 text-xl flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-lg">
                        <Building2 className="text-primary-600" size={20} />
                    </div>
                    Find Partner Colleges
                </h3>
                
                <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search colleges by name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input pl-12 h-13 shadow-sm hover:border-primary-400 focus:shadow-md transition-all rounded-2xl"
                        />
                    </div>
                    <button type="submit" className="btn-primary px-8 rounded-2xl h-13 shadow-primary-500/20">
                        Search
                    </button>
                </form>

                {loading ? (
                    <div className="flex justify-center py-8"><div className="spinner w-8 h-8" /></div>
                ) : colleges.length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-surface-50 rounded-2xl border border-dashed border-border flex flex-col items-center gap-2">
                        <Building2 size={32} className="opacity-20" />
                        <p>No colleges found. Try a different name.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {colleges.map(college => {
                            const hasRequested = sentRequests.some(r => r.collegeId === college.id);
                            return (
                                <div key={college.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-800 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                                            {college.logoUrl ? (
                                                <img src={college.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="text-primary-400 opacity-50" size={18} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm tracking-normal uppercase line-clamp-1">{college.collegeName}</h4>
                                            <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">
                                                {college.city}{college.city && college.state ? ', ' : ''}{college.state}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {hasRequested ? (
                                            <div className="px-4 py-2 bg-white/5 text-white/30 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest cursor-default">
                                                Request Pending
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleSendRequest(college.id)} 
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20 hover:scale-105 transition-all"
                                            >
                                                Send Request 🚀
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Sent Requests Section */}
            <div className="card shadow-premium border-none">
                <h3 className="font-bold text-text-heading mb-6 text-xl">My Partnership Requests</h3>
                {sentRequests.length === 0 ? (
                    <div className="text-center py-12 text-text-muted bg-surface-50 rounded-2xl border border-dashed border-border">
                        <p>You haven't sent any partnership requests yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto mt-4 px-2">
                        <table className="w-full text-left border-separate border-spacing-y-2 table-fixed">
                            <thead>
                                <tr className="text-left text-white/30 font-black uppercase tracking-[0.2em] text-[9px]">
                                    <th className="px-6 py-2 w-[40%]">Institutional Partner</th>
                                    <th className="px-6 py-2 w-[35%]">Collaboration Date</th>
                                    <th className="px-6 py-2 w-[25%] text-right pr-12">Network Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sentRequests.map(req => (
                                    <tr key={req.id} className="group bg-white/5 hover:bg-white/10 transition-all duration-300">
                                        <td className="px-6 py-3 rounded-l-xl border-y border-l border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform">
                                                    {req.collegeName[0]}
                                                </div>
                                                <span className="text-xs font-black text-white uppercase tracking-tight truncate">{req.collegeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-white/50 text-[10px] font-black uppercase tracking-widest border-y border-white/5">
                                            {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-3 rounded-r-xl border-y border-r border-white/5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-3 pr-6">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border
                                                    ${req.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                      req.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                      'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                    ● {req.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

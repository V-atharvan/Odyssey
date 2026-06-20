import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import { collegeAPI } from '../../api/api';
import toast from 'react-hot-toast';

export default function CompanyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await collegeAPI.getCompanyRequests();
            setRequests(res.data.data.filter(r => r.status === 'PENDING'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdate = async (id, status) => {
        try {
            await collegeAPI.updatePartnership(id, status);
            toast.success(`Partnership request ${status.toLowerCase()}`);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    if (loading || requests.length === 0) return null;

    return (
        <div className="bg-surface-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden mb-10 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] -mr-32 -mt-32" />
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Building2 size={16} />
                </div>
                Strategy Partnership Requests
            </h3>
            <div className="space-y-4 relative z-10">
                {requests.map(req => (
                    <div key={req.id} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 transition-all">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-inner">
                                {req.companyName[0]}
                            </div>
                            <div>
                                <p className="text-lg font-black text-white tracking-normal uppercase leading-none mb-1">{req.companyName}</p>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Inbound Collaboration Proposal · {new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button onClick={() => handleUpdate(req.id, 'REJECTED')} className="flex-1 md:flex-none px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all">
                                Decline
                            </button>
                            <button onClick={() => handleUpdate(req.id, 'ACCEPTED')} className="flex-1 md:flex-none px-8 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20 hover:scale-105 transition-all">
                                Authorize 
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

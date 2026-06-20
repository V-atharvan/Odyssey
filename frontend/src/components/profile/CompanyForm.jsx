import React, { useState } from 'react';
import axiosInstance from '../../api/api';
import FileUpload from '../common/FileUpload';
import toast from 'react-hot-toast';

export default function CompanyForm({ onComplete, onBack }) {
    const [formData, setFormData] = useState({
        companyName: '',
        website: '',
        industry: '',
        description: '',
        logoUrl: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put('/companies/profile', formData);
            toast.success('Company profile updated! 🏢');
            onComplete();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
             <h3 className="font-bold text-text-heading text-xl mb-4 text-center">Company Profile</h3>

            <div>
                <label className="label">Company Name</label>
                <input 
                    name="companyName"
                    className="input"
                    placeholder="Acme Corp"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label className="label">Website</label>
                <input 
                    name="website"
                    className="input"
                    placeholder="https://acme.com"
                    value={formData.website}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label className="label">Industry</label>
                <input 
                    name="industry"
                    className="input"
                    placeholder="Software Development / AI / Fintech"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label className="label">About Company</label>
                <textarea 
                    name="description"
                    className="input min-h-[100px]"
                    placeholder="Describe your company and the kind of talent you're looking for..."
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            <FileUpload 
                label="Company Logo"
                type="company_logos"
                accept=".jpg,.jpeg,.png"
                onUploadComplete={(url) => setFormData(p => ({ ...p, logoUrl: url }))}
            />

            <button type="submit" className="btn-primary w-full py-4 mt-4" disabled={loading}>
                {loading ? <span className="spinner w-6 h-6" /> : 'Start Hiring Student Talent 🚀'}
            </button>
        </form>
    );
}

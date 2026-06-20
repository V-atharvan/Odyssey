import React, { useState, useEffect } from 'react';
import { collegeAPI } from '../../api/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

// -------------------------------------------------------
// STEP 1: Basic College & Admin Info
// -------------------------------------------------------
function StepBasicInfo({ data, onChange }) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h3 className="font-bold text-text-heading text-xl">College Profile</h3>
                <p className="text-sm text-text-muted">Tell us about your institution</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="label">College Name *</label>
                    <input
                        className="input" name="collegeName"
                        value={data.collegeName} onChange={onChange} required
                        placeholder="N.B. Navale Sinhgad College of Engineering"
                    />
                </div>
                <div>
                    <label className="label">Short Name</label>
                    <input className="input" name="shortName" value={data.shortName} onChange={onChange} placeholder="SINHGAD" />
                </div>
                <div>
                    <label className="label">College Code</label>
                    <input className="input" name="collegeCode" value={data.collegeCode} onChange={onChange} placeholder="MH-SOL-001" />
                </div>
                <div>
                    <label className="label">Year of Establishment</label>
                    <input
                        className="input" type="number" name="establishmentYear"
                        value={data.establishmentYear} onChange={onChange}
                        placeholder="1995" min="1800" max={new Date().getFullYear()}
                    />
                </div>
                <div>
                    <label className="label">University Affiliation</label>
                    <input className="input" name="universityAffiliation" value={data.universityAffiliation} onChange={onChange} placeholder="Solapur University" />
                </div>
                <div>
                    <label className="label">Accreditation (NAAC/NBA)</label>
                    <input className="input" name="accreditation" value={data.accreditation} onChange={onChange} placeholder="NAAC A+" />
                </div>
                <div>
                    <label className="label">Official Website</label>
                    <input className="input" name="website" value={data.website} onChange={onChange} placeholder="https://college.edu" />
                </div>
                <div className="col-span-2">
                    <label className="label">Admin Name *</label>
                    <input className="input" name="adminName" value={data.adminName} onChange={onChange} placeholder="Dr. John Doe" required />
                </div>
                <div>
                    <label className="label">Admin Designation</label>
                    <input className="input" name="adminDesignation" value={data.adminDesignation} onChange={onChange} placeholder="Principal / Registrar" />
                </div>
                <div>
                    <label className="label">Contact Number</label>
                    <input className="input" name="contactPhone" value={data.contactPhone} onChange={onChange} placeholder="+91 98765 43210" />
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------
// STEP 2: Address / Location
// -------------------------------------------------------
function StepAddress({ data, onChange }) {
    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h3 className="font-bold text-text-heading text-xl">Location Details</h3>
                <p className="text-sm text-text-muted">Where is your institution located?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Country *</label>
                    <input className="input" name="country" value={data.country} onChange={onChange} placeholder="India" required />
                </div>
                <div>
                    <label className="label">State *</label>
                    <input className="input" name="state" value={data.state} onChange={onChange} placeholder="Maharashtra" required />
                </div>
                <div>
                    <label className="label">City *</label>
                    <input className="input" name="city" value={data.city} onChange={onChange} placeholder="Solapur" required />
                </div>
                <div>
                    <label className="label">Pincode *</label>
                    <input className="input" name="pincode" value={data.pincode} onChange={onChange} placeholder="413001" required />
                </div>
                <div className="col-span-2">
                    <label className="label">Full Address / Description</label>
                    <textarea
                        className="input min-h-[80px]" name="description"
                        value={data.description} onChange={onChange}
                        placeholder="123 College Road, Near Railway Station..."
                    />
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------
// STEP 3: Academic Information
// -------------------------------------------------------
function StepAcademic({ data, onChange, onListChange }) {
    const [courseInput, setCourseInput] = useState('');
    const [deptInput, setDeptInput] = useState('');

    const addItem = (key, input, setInput) => {
        if (input.trim()) {
            onListChange(key, [...(data[key] || []), input.trim()]);
            setInput('');
        }
    };
    const removeItem = (key, idx) => onListChange(key, (data[key] || []).filter((_, i) => i !== idx));

    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h3 className="font-bold text-text-heading text-xl">Academic Information</h3>
                <p className="text-sm text-text-muted">Add your courses, departments and student count</p>
            </div>
            <div>
                <label className="label">Total Students</label>
                <input className="input" type="number" name="totalStudents" value={data.totalStudents} onChange={onChange} placeholder="2500" min="0" />
            </div>
            {/* Courses */}
            <div>
                <label className="label">Courses Offered</label>
                <div className="flex gap-2">
                    <input
                        className="input flex-1" value={courseInput}
                        onChange={e => setCourseInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('coursesOffered', courseInput, setCourseInput))}
                        placeholder="e.g. B.Tech, MBA, MCA — press Enter or Add"
                    />
                    <button type="button" onClick={() => addItem('coursesOffered', courseInput, setCourseInput)} className="btn-primary px-4 py-2 text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(data.coursesOffered || []).map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                            {c}
                            <button type="button" onClick={() => removeItem('coursesOffered', i)} className="text-red-400 hover:text-red-600 font-bold ml-1 leading-none">×</button>
                        </span>
                    ))}
                </div>
            </div>
            {/* Departments */}
            <div>
                <label className="label">Departments</label>
                <div className="flex gap-2">
                    <input
                        className="input flex-1" value={deptInput}
                        onChange={e => setDeptInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('departments', deptInput, setDeptInput))}
                        placeholder="e.g. Computer Science, Mechanical"
                    />
                    <button type="button" onClick={() => addItem('departments', deptInput, setDeptInput)} className="btn-primary px-4 py-2 text-sm">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {(data.departments || []).map((d, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                            {d}
                            <button type="button" onClick={() => removeItem('departments', i)} className="text-red-400 hover:text-red-600 font-bold ml-1 leading-none">×</button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------
// STEP 4: Platform Preferences
// -------------------------------------------------------
function StepPreferences({ data, onChange }) {
    const prefs = [
        { name: 'talentShowcase', label: '🎯 Talent Showcase', desc: 'Allow students to be discovered by companies on the platform' },
        { name: 'internshipParticipation', label: '💼 Internship Participation', desc: 'Enable internship opportunities and listings for your students' },
        { name: 'eventsParticipation', label: '🏆 Events & Hackathons', desc: 'Participate in platform-hosted events and hackathons' },
    ];
    return (
        <div className="space-y-5">
            <div className="text-center mb-4">
                <h3 className="font-bold text-text-heading text-xl">Platform Preferences</h3>
                <p className="text-sm text-text-muted">Choose how your college participates on Odyssey</p>
            </div>
            {prefs.map(pref => (
                <div
                    key={pref.name}
                    className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                        ${data[pref.name] ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-primary-500/40 hover:bg-white/5'}`}
                    onClick={() => onChange({ target: { name: pref.name, type: 'checkbox', checked: !data[pref.name] } })}
                >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                        ${data[pref.name] ? 'bg-primary-600 border-primary-600' : 'border-white/20 bg-transparent'}`}>
                        {data[pref.name] && <span className="text-white text-xs font-black">✓</span>}
                    </div>
                    <div>
                        <p className="font-semibold text-text-heading">{pref.label}</p>
                        <p className="text-sm text-text-muted">{pref.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// -------------------------------------------------------
// STEP 5: Media Upload
// -------------------------------------------------------
function StepMedia({ data, onUpload, uploading }) {
    const MediaUploadBox = ({ type, label, hint, icon }) => (
        <div>
            <label className="label">{label}</label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                ${data[`${type}Url`] ? 'border-primary-500 bg-primary-500/10' : 'border-white/20 hover:border-primary-400 bg-white/5'}`}>
                {data[`${type}Url`] ? (
                    <div className="flex flex-col items-center gap-2">
                        <img src={data[`${type}Url`]} alt={label} className={`rounded-xl object-cover ${type === 'logo' ? 'w-20 h-20' : 'w-full h-24'}`} />
                        <p className="text-xs text-green-600 font-semibold">✓ {label} uploaded</p>
                        <label className="text-xs text-primary-600 underline cursor-pointer">
                            Replace
                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], type)} disabled={uploading === type} />
                        </label>
                    </div>
                ) : (
                    <label className="cursor-pointer block">
                        <div className="text-4xl mb-2">{icon}</div>
                        <p className="text-text-muted text-sm font-medium">
                            {uploading === type ? (
                                <span className="flex items-center justify-center gap-2"><span className="spinner w-4 h-4" /> Uploading...</span>
                            ) : `Click to upload ${label}`}
                        </p>
                        <p className="text-text-muted text-xs mt-1">{hint}</p>
                        <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files[0] && onUpload(e.target.files[0], type)} disabled={!!uploading} />
                    </label>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="font-bold text-text-heading text-xl">College Media</h3>
                <p className="text-sm text-text-muted">Upload your official logo and a banner image</p>
            </div>
            <MediaUploadBox type="logo" label="College Logo *" hint="PNG or JPG — Max 5MB" icon="🏫" />
            <MediaUploadBox type="banner" label="Banner Image (Optional)" hint="PNG or JPG — Recommended 1280×400px, Max 10MB" icon="🖼️" />
        </div>
    );
}

// -------------------------------------------------------
// STEP 6: Terms & Final Submit
// -------------------------------------------------------
function StepTerms({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-4">
                <h3 className="font-bold text-text-heading text-xl">Terms & Submit</h3>
                <p className="text-sm text-text-muted">Review and confirm before submitting</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto leading-relaxed border border-slate-200 dark:border-white/10">
                <p className="font-semibold text-slate-900 dark:text-white mb-2">Odyssey Platform Terms for Institutions</p>
                <p>By registering as a College Administrator on Odyssey, you confirm that:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>All information provided is accurate and verifiable.</li>
                    <li>You are an authorized representative of the stated institution.</li>
                    <li>You agree to our platform's Code of Conduct and Data Privacy Policy.</li>
                    <li>Student data will be handled responsibly and in compliance with applicable laws.</li>
                    <li>Odyssey reserves the right to verify and approve all college registrations before activation.</li>
                </ul>
            </div>
            <div
                className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                onClick={() => onChange({ target: { name: 'termsAccepted', type: 'checkbox', checked: !data.termsAccepted } })}
            >
                <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all
                    ${data.termsAccepted ? 'bg-primary-600 border-primary-600' : 'border-slate-300 dark:border-white/20 bg-transparent'}`}>
                    {data.termsAccepted && <span className="text-white text-xs font-black">✓</span>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 select-none">
                    I have read and agree to the Odyssey <span className="text-primary-600 font-semibold">Terms of Service</span> and <span className="text-primary-600 font-semibold">Privacy Policy</span> for Institutions.
                </p>
            </div>
        </div>
    );
}

// -------------------------------------------------------
// MAIN CollegeForm Component
// -------------------------------------------------------

const STEPS = [
    { label: 'Profile', icon: '🏫' },
    { label: 'Location', icon: '📍' },
    { label: 'Academic', icon: '📚' },
    { label: 'Features', icon: '⚙️' },
    { label: 'Media', icon: '🖼️' },
    { label: 'Submit', icon: '✅' },
];

const INITIAL_DATA = {
    collegeName: '', shortName: '', collegeCode: '',
    establishmentYear: '', universityAffiliation: '', accreditation: '',
    website: '', description: '',
    country: 'India', state: '', city: '', pincode: '',
    adminName: '', adminDesignation: '', contactPhone: '',
    coursesOffered: [], departments: [], totalStudents: '',
    talentShowcase: true, internshipParticipation: true, eventsParticipation: false,
    logoUrl: '', bannerUrl: '',
    termsAccepted: false,
};

export default function CollegeForm({ onComplete, onBack }) {
    const [step, setStep] = useState(0);        // 0-indexed (0 = Basic Info, 5 = Terms)
    const [formData, setFormData] = useState(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(null); // 'logo' | 'banner' | null
    const [isSaving, setIsSaving] = useState(false);

    // Load saved progress on mount (Save & Continue Later)
    useEffect(() => {
        collegeAPI.getMyProfile()
            .then(res => {
                const profile = res.data?.data;
                if (!profile) return;
                setFormData(prev => ({
                    ...prev,
                    collegeName: profile.collegeName || '',
                    shortName: profile.shortName || '',
                    collegeCode: profile.collegeCode || '',
                    establishmentYear: profile.establishmentYear || '',
                    universityAffiliation: profile.universityAffiliation || '',
                    accreditation: profile.accreditation || '',
                    website: profile.website || '',
                    description: profile.description || '',
                    country: profile.country || 'India',
                    state: profile.state || '',
                    city: profile.city || '',
                    pincode: profile.pincode || '',
                    adminName: profile.adminName || '',
                    adminDesignation: profile.adminDesignation || '',
                    contactPhone: profile.contactPhone || '',
                    coursesOffered: profile.coursesOffered || [],
                    departments: profile.departments || [],
                    totalStudents: profile.totalStudents || '',
                    talentShowcase: profile.talentShowcase ?? true,
                    internshipParticipation: profile.internshipParticipation ?? true,
                    eventsParticipation: profile.eventsParticipation ?? false,
                    logoUrl: profile.logoUrl || '',
                    bannerUrl: profile.bannerUrl || '',
                }));
                // Resume at the saved step (backend stores 3-based, frontend: 0-based from step 0)
                // registrationStep 3 = first step (index 0), 4 = index 1, etc.
                if (profile.registrationStep && profile.registrationStep > 3) {
                    setStep(Math.min(profile.registrationStep - 3, STEPS.length - 1));
                }
            })
            .catch(() => { }); // Silently fail on first registration — no profile yet
    }, []);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleListChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const saveProgress = async (targetStep) => {
        setIsSaving(true);
        try {
            await collegeAPI.updateProfile({
                ...formData,
                totalStudents: Number(formData.totalStudents) || 0,
                registrationStep: targetStep + 3 // Map index 0-5 to step 3-8 (Step 0 is Step 3 in DB)
            });
        } catch (err) {
            console.warn('[CollegeForm] Auto-save failed:', err?.response?.data?.message);
            // Non-blocking — user can still proceed
        } finally {
            setIsSaving(false);
        }
        setStep(targetStep);
    };

    const handleNext = () => {
        if (step < STEPS.length - 1) saveProgress(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
        else onBack?.();
    };

    const handleUpload = async (file, type) => {
        setUploading(type);
        try {
            const res = await collegeAPI.uploadMedia(file, type);
            const url = res.data?.data?.url;
            if (url) {
                setFormData(prev => ({ ...prev, [`${type}Url`]: url }));
                toast.success(`${type === 'logo' ? 'Logo' : 'Banner'} uploaded successfully ✓`);
            }
        } catch (err) {
            toast.error(`Failed to upload ${type}: ${err?.response?.data?.message || 'Unknown error'}`);
        } finally {
            setUploading(null);
        }
    };

    const handleFinalSubmit = async () => {
        if (!formData.termsAccepted) {
            return toast.error('Please accept the Terms of Service to continue.');
        }
        setLoading(true);
        try {
            await collegeAPI.updateProfile({
                ...formData,
                totalStudents: Number(formData.totalStudents) || 0,
                registrationStep: 10, // 10 = Fully Complete
                termsAccepted: true,
            });
            toast.success('College registration complete! 🎉 Your account is pending admin verification.');
            onComplete();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isLastStep = step === STEPS.length - 1;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Progress Tracker */}
            <div className="flex items-center justify-between">
                {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                                ${i === step
                                    ? 'bg-primary-600 text-white scale-110 shadow-lg shadow-primary-600/30'
                                    : i < step
                                        ? 'bg-primary-200 text-primary-700'
                                        : 'bg-border text-text-muted'}`}>
                                {i < step ? '✓' : s.icon}
                            </div>
                            <span className={`text-[9px] mt-1 font-semibold tracking-wide
                                ${i === step ? 'text-primary-600' : 'text-text-muted'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all duration-300 ${i < step ? 'bg-primary-500' : 'bg-border'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[320px]">
                {step === 0 && <StepBasicInfo data={formData} onChange={handleChange} />}
                {step === 1 && <StepAddress data={formData} onChange={handleChange} />}
                {step === 2 && <StepAcademic data={formData} onChange={handleChange} onListChange={handleListChange} />}
                {step === 3 && <StepPreferences data={formData} onChange={handleChange} />}
                {step === 4 && <StepMedia data={formData} onUpload={handleUpload} uploading={uploading} />}
                {step === 5 && <StepTerms data={formData} onChange={handleChange} />}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
                <button type="button" onClick={handleBack} className="btn-ghost flex-1 flex items-center justify-center gap-2" disabled={loading}>
                    <ArrowLeft size={20} /> Back
                </button>
                {!isLastStep ? (
                    <button type="button" onClick={handleNext} className="btn-primary flex-1" disabled={isSaving}>
                        {isSaving
                            ? <span className="flex items-center justify-center gap-2"><span className="spinner w-5 h-5 border-white/30" /> Saving...</span>
                            : 'Save & Continue →'}
                    </button>
                ) : (
                    <button
                        type="button" onClick={handleFinalSubmit}
                        className="btn-primary flex-1"
                        disabled={loading || !formData.termsAccepted}>
                        {loading
                            ? <span className="flex items-center justify-center gap-2"><span className="spinner w-5 h-5 border-white/30" /> Submitting...</span>
                            : 'Submit Registration 🚀'}
                    </button>
                )}
            </div>
        </div>
    );
}

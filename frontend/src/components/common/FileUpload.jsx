import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ImageIcon, X } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { fileAPI } from '../../api/api';
import toast from 'react-hot-toast';

export default function FileUpload({ onUploadComplete, type = 'resume', label = 'Upload File', accept = '.pdf,.jpg,.jpeg,.png' }) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [preview, setPreview] = useState(null);
    const fileInput = useRef(null);

    const handleFile = async (srcFile) => {
        if (!srcFile) return;

        // Basic validation
        const ext = '.' + srcFile.name.split('.').pop().toLowerCase();
        const validTypes = accept.split(',').map(t => t.trim().toLowerCase());

        if (!validTypes.includes(ext)) {
            toast.error(`Invalid file type. Please upload ${accept}`);
            return;
        }

        setFile(srcFile);
        if (srcFile.type.startsWith('image/')) {
            setPreview(URL.createObjectURL(srcFile));
        } else {
            setPreview(null);
        }

        // Auto upload
        performUpload(srcFile);
    };

    const performUpload = (f) => {
        setUploading(true);
        setProgress(0);

        const uploadToBackend = async (fileToUpload) => {
            try {
                const interval = setInterval(() => {
                    setProgress(p => Math.min(p + 15, 90));
                }, 100);
                const res = await fileAPI.upload(fileToUpload, type);
                clearInterval(interval);
                setProgress(100);
                onUploadComplete(res.data.data.url);
                toast.success('File uploaded successfully!');
            } catch (err) {
                console.error('Backend file upload failed:', err);
                toast.error('Upload failed on both Firebase and Server.');
                setFile(null);
                setPreview(null);
            } finally {
                setUploading(false);
            }
        };

        if (!storage) {
            uploadToBackend(f);
            return;
        }

        // Path structure: e.g., resumes/timestamp_filename
        const fileRef = ref(storage, `${type}/${Date.now()}_${f.name}`);
        const uploadTask = uploadBytesResumable(fileRef, f);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const pct = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(pct);
            },
            (error) => {
                console.warn('Firebase upload error, trying backend fallback:', error);
                uploadToBackend(f);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onUploadComplete(downloadURL);
                    toast.success('File uploaded successfully!');
                } catch (err) {
                    console.error('Error getting download URL, trying backend fallback:', err);
                    uploadToBackend(f);
                } finally {
                    setUploading(false);
                }
            }
        );
    };

    return (
        <div className="space-y-2 group">
            <label className="label text-text-heading font-bold">{label}</label>
            <div
                className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center cursor-pointer overflow-hidden
                           ${dragging ? 'border-primary-500 bg-primary-50/50 shadow-inner' : 'border-border bg-surface-50 hover:border-primary-300 hover:bg-white'}
                           ${file ? 'border-primary-600 bg-primary-50/10' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => !uploading && fileInput.current.click()}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInput}
                    accept={accept}
                    disabled={uploading}
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {!file ? (
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm group-hover:scale-110 transition-transform">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-heading">Click or drag & drop</p>
                            <p className="text-xs text-text-muted mt-1 uppercase tracking-normal">Supported: {accept}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4 text-left p-2">
                        <div className="relative group/preview">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-border bg-white" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-white border border-border flex items-center justify-center text-3xl text-primary-500">
                                    {file.name.endsWith('.pdf') ? <FileText className="w-8 h-8 text-[#F40F02]" /> : <ImageIcon className="w-8 h-8 text-primary-500" />}
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <div className="spinner w-8 h-8 border-primary-600" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text-heading truncate group-hover:text-primary-700 transition-colors">{file.name}</p>
                            {uploading ? (
                                <div className="w-full mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-primary-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="text-xs text-primary-600 font-bold mt-1 inline-block">{progress}% Uploading...</span>
                                </div>
                            ) : (
                                <p className="text-xs text-text-muted font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.name.split('.').pop().toUpperCase()}
                                </p>
                            )}
                        </div>
                        {!uploading && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                                className="p-3 bg-white hover:bg-danger-50 text-danger-500 rounded-full border border-border transition-all hover:scale-110"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

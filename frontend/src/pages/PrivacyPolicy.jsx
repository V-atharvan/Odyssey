import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import logo from '../assets/logo.jpg';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-primary-500/30 selection:text-primary-300">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 group-hover:border-primary-500/50 transition-colors">
              <img src={logo} alt="Odyssey" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white group-hover:text-primary-400 transition-colors">
              ODYSSEY
            </span>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase mt-1">Last Updated: May 2026</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none space-y-12 text-slate-400 leading-relaxed">
              <section>
                <div className="flex items-center gap-3 text-white font-bold text-xl mb-4">
                  <Eye className="w-5 h-5 text-primary-400" />
                  <h2>Information We Collect</h2>
                </div>
                <p>
                  At Odyssey, we collect information to provide better services to all our users. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>Account Information:</strong> Name, email address, and professional role (Student, College, or Company).</li>
                  <li><strong>Profile Data:</strong> Skills, education history, and employment details you choose to share.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform to improve user experience.</li>
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-3 text-white font-bold text-xl mb-4">
                  <Lock className="w-5 h-5 text-accent-500" />
                  <h2>How We Protect Your Data</h2>
                </div>
                <p>
                  Security is our top priority. We use industry-standard encryption and security protocols to ensure that your personal and professional data remains confidential. 
                  Access to sensitive data is strictly controlled and monitored.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 text-white font-bold text-xl mb-4">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h2>Data Sharing & Disclosure</h2>
                </div>
                <p>
                  We do not sell your personal data to third parties. Data is only shared between Students, Colleges, and Companies within the ecosystem when explicitly authorized by you (e.g., when applying for a job or sharing a verified profile).
                </p>
              </section>

              <section className="p-8 rounded-3xl bg-white/5 border border-white/10">
                <h2 className="text-white font-bold text-xl mb-4">Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your information at any time through your account settings. If you have questions about your data, please contact our privacy team.
                </p>
                <button 
                  onClick={() => navigate('/#contact')}
                  className="mt-6 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20"
                >
                  Contact Privacy Team
                </button>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-600 font-black tracking-[0.2em] uppercase">
          © 2026 ODYSSEY. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Users,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import logo from '../assets/logo.jpg';

import { contactAPI } from '../api/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/common/ThemeToggle';

const LandingPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await contactAPI.sendMessage({ name, email, message });
      toast.success("Message sent successfully!");
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-700 dark:text-slate-300 font-sans transition-colors duration-500 selection:bg-primary-500/30 selection:text-primary-300">

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 dark:bg-[#020617]/80 border-b border-slate-200 dark:border-white/5 px-6 py-4 transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 group-hover:border-primary-500/50 transition-colors">
              <img src={logo} alt="Odyssey" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
              ODYSSEY
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">How it Works</a>
            <a href="#solutions" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Solutions</a>
            <a href="#about" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/10 mx-2" />
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-600/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary-400/8 dark:bg-primary-600/10 blur-[150px] rounded-full -z-10 transition-colors duration-500" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-300/8 dark:bg-accent-500/10 blur-[120px] rounded-full -z-10 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-300/8 dark:bg-emerald-600/10 blur-[100px] rounded-full -z-10 transition-colors duration-500" />

        <div className="max-w-7xl mx-auto text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-bold tracking-widest uppercase mb-10">
              <Zap className="w-3.5 h-3.5 fill-current" />
              The Future of Campus Recruitment
            </span>

            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tight mb-10">
              Embark on Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-emerald-400 to-accent-500">
                Professional Journey
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-14 leading-relaxed">
              Odyssey bridges the gap between talent and opportunity. A premium B2B2C platform
              connecting students, colleges, and top-tier companies in a seamless ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl text-lg transition-all active:scale-95 shadow-xl shadow-primary-600/25 flex items-center justify-center gap-3 group"
              >
                Join the Voyage
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-10 py-5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-bold rounded-2xl text-lg transition-all active:scale-95 backdrop-blur-sm"
              >
                Explore Platform
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Solutions Cards ─── */}
      <section id="solutions" className="py-32 md:py-40 px-6 bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-200 dark:border-white/5 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6">
              Built for <span className="text-primary-500">Everyone</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              Whether you're a student, college, or recruiter — Odyssey has the tools you need to succeed.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8 lg:gap-10"
          >
            {[
              {
                id: "students",
                icon: GraduationCap,
                title: "For Students",
                desc: "Build your premium portfolio, track your growth, and land your dream job with AI-powered discovery.",
                color: "text-primary-500",
                bg: "bg-primary-500/10 dark:bg-primary-500/5",
                borderHover: "hover:border-primary-500/40"
              },
              {
                id: "colleges",
                icon: Users,
                title: "For Colleges",
                desc: "Manage placements effortlessly, track student progress, and invite top recruiters to your campus.",
                color: "text-amber-500 dark:text-accent-500",
                bg: "bg-amber-500/10 dark:bg-accent-500/5",
                borderHover: "hover:border-amber-500/40 dark:hover:border-accent-500/40"
              },
              {
                id: "recruiters",
                icon: Briefcase,
                title: "For Recruiters",
                desc: "Discover verified talent, host recruitment drives, and build your brand within premier institutions.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
                borderHover: "hover:border-emerald-500/40"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                id={feature.id}
                variants={itemVariants}
                className={`group p-10 lg:p-12 rounded-[2.5rem] bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 ${feature.borderHover} transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary-500/5 relative overflow-hidden`}
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-5">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">{feature.desc}</p>

                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-500/5 blur-3xl rounded-full" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How it Works Section ─── */}
      <section id="how-it-works" className="py-32 md:py-40 px-6 bg-white dark:bg-[#020617] border-t border-slate-200 dark:border-white/5 relative transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6">
              How the <span className="text-primary-500">Voyage</span> Works
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              A streamlined process designed to take you from discovery to placement in record time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent -translate-y-1/2 -z-10" />

            {[
              { step: "01", title: "Create & Verify", desc: "Sign up and build your professional profile. Colleges and companies undergo a strict verification process." },
              { step: "02", title: "Discover & Connect", desc: "Use our intelligent discovery engine to find jobs, internships, or campus recruitment drives." },
              { step: "03", title: "Secure Your Future", desc: "Apply directly, track your progress, and get placed with top-tier companies globally." }
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-10 lg:p-12 rounded-[2.5rem] bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/5 text-center shadow-sm dark:shadow-none relative hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-primary-600 text-white font-black text-lg flex items-center justify-center rounded-2xl shadow-lg shadow-primary-600/25">
                  {s.step}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-5">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-base">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Section ─── */}
      <section id="about" className="py-32 md:py-40 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 lg:gap-28 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-10 leading-tight">
              About the <br />
              <span className="text-amber-500 dark:text-accent-500">Odyssey Vision</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-6 leading-relaxed">
              Odyssey was founded on the belief that talent is universal, but opportunity is not. We are building the world's most trusted ecosystem for campus recruitment.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-10 leading-relaxed">
              By bringing Students, Colleges, and Companies under one roof, we eliminate friction, verify authenticity, and accelerate professional growth for everyone involved.
            </p>
            <div className="flex gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">Verified Talent</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-accent-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">Trusted Partners</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { value: "500+", label: "Partner Colleges", color: "from-primary-500 to-emerald-400" },
              { value: "50K+", label: "Active Students", color: "from-amber-400 to-orange-500" },
              { value: "95%", label: "Placement Rate", color: "from-violet-500 to-purple-400" },
              { value: "200+", label: "Top Companies", color: "from-cyan-400 to-blue-500" }
            ].map((stat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 text-center group hover:-translate-y-1">
                <p className={`text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.color} mb-3`}>{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <section id="contact" className="py-32 md:py-40 px-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#020617] transition-colors duration-500">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">Get in Touch</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Have questions? Our team is here to help you navigate your voyage.</p>
        </div>

        <div className="max-w-xl mx-auto p-10 md:p-14 rounded-[2.5rem] bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-500 to-accent-500" />

          <form onSubmit={handleContactSubmit} className="space-y-7">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
              <input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Message</label>
              <textarea rows="5" placeholder="How can we help?" value={message} onChange={e => setMessage(e.target.value)} required className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-5 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 text-lg">
              {loading ? "Sending..." : "Send Message"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* ─── Trust Section ─── */}
      <section className="py-24 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 hover:opacity-70 grayscale hover:grayscale-0 transition-all duration-500 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3 text-2xl font-bold tracking-tighter"><Globe className="w-7 h-7" /> GLOBAL REACH</div>
            <div className="flex items-center gap-3 text-2xl font-bold tracking-tighter"><ShieldCheck className="w-7 h-7" /> VERIFIED TRUST</div>
            <div className="flex items-center gap-3 text-2xl font-bold tracking-tighter"><Rocket className="w-7 h-7" /> RAPID GROWTH</div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-24 border-t border-slate-200 dark:border-white/5 px-6 bg-white dark:bg-[#020617] transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                <img src={logo} alt="Odyssey" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">ODYSSEY</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
              The premier ecosystem for campus recruitment and career development.
              Bridging the gap between ambition and opportunity.
            </p>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-tight uppercase text-xs">Platform</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#how-it-works" className="hover:text-primary-500 transition-colors">How it Works</a></li>
              <li><a href="#students" className="hover:text-primary-500 transition-colors">For Students</a></li>
              <li><a href="#recruiters" className="hover:text-primary-500 transition-colors">For Recruiters</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6 tracking-tight uppercase text-xs">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
              <li><a href="#about" className="hover:text-primary-500 transition-colors">About Us</a></li>
              <li><a href="#contact" className="hover:text-primary-500 transition-colors">Contact</a></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-primary-500 transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-200 dark:border-white/5 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 opacity-60 uppercase tracking-[0.2em] font-black">
          <p>© 2026 ODYSSEY. ALL RIGHTS RESERVED.</p>
          <p className="hidden md:block">BUILT FOR THE FUTURE OF TALENT.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

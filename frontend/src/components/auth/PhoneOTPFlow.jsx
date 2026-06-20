import React, { useState, useRef, useEffect } from 'react';
import { Phone, ArrowLeft, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/api';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1',  flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
];

export default function PhoneOTPFlow({ role, onBack, onVerified }) {
  const { sendPhoneOTP, verifyPhoneOTP, login } = useAuth();
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const recaptchaContainerRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Failed to clear recaptchaVerifier on unmount", e);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOTP = async () => {
    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    if (phoneNumber.replace(/\D/g, '').length < 8) {
      toast.error('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const result = await sendPhoneOTP(fullPhone, 'recaptcha-container');
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(60);
      toast.success(`OTP sent to ${fullPhone}`);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const fbUser = await verifyPhoneOTP(confirmationResult, code);
      const idToken = await fbUser.getIdToken();

      const res = await authAPI.firebaseLogin({ idToken, role });
      const data = res.data.data;

      login(
        { email: data.email, fullName: data.fullName, role: data.role, profileId: data.profileId, userId: data.userId },
        data.token
      );
      toast.success('Phone verification successful! 🎉');
      onVerified(data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          type="button"
          onClick={step === 'otp' ? () => setStep('phone') : onBack}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h3 className="font-bold text-text-heading text-lg">
            {step === 'phone' ? 'Enter Phone Number' : 'Verify OTP'}
          </h3>
          <p className="text-xs text-text-muted">
            {step === 'phone'
              ? `Joining as ${role?.replace('_', ' ')}`
              : `Code sent to ${countryCode} ${phoneNumber}`}
          </p>
        </div>
      </div>

      {/* reCAPTCHA container — Firebase renders here invisibly (placed here to keep it always in DOM) */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden" />

      {step === 'phone' && (
        <>
          {/* Country Code + Phone */}
          <div>
            <label className="label">Phone Number</label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="input w-32 shrink-0 cursor-pointer"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                className="input flex-1"
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
              />
            </div>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || phoneNumber.length < 8}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="spinner w-5 h-5 border-white/30" />
            ) : (
              <><Phone size={18} /> Send OTP</>
            )}
          </button>
        </>
      )}

      {step === 'otp' && (
        <>
          {/* OTP Input Grid */}
          <div>
            <label className="label text-center block mb-4">Enter 6-digit code</label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className={`w-12 h-14 text-center text-xl font-black rounded-xl border transition-all focus:outline-none
                    ${digit
                      ? 'border-primary-500 bg-primary-500/10 text-text-heading'
                      : 'border-border bg-surface-50 text-text-heading focus:border-primary-400'
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Didn't receive it?</span>
            {resendTimer > 0 ? (
              <span className="text-text-muted font-bold">Resend in {resendTimer}s</span>
            ) : (
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="text-primary-500 font-black flex items-center gap-1 hover:text-primary-400 transition-colors"
              >
                <RefreshCw size={12} /> Resend OTP
              </button>
            )}
          </div>

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.join('').length !== 6}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="spinner w-5 h-5 border-white/30" />
            ) : (
              <><Shield size={18} /> Verify &amp; Continue</>
            )}
          </button>
        </>
      )}
    </div>
  );
}

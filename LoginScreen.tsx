import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, User, Lock, Shield, ArrowRight, KeyRound } from 'lucide-react';
import NaradLogo from '../components/NaradLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

type Mode = 'phone' | 'email' | 'guest' | 'officer';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { loginPhone, loginEmail, loginGuest, loginOfficer, verifyOtp, pendingPhone } = useAuth();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [officerCode, setOfficerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'phone') {
        if (step === 'input') {
          if (!phone || !name) { setError('Please enter name and phone'); setLoading(false); return; }
          await loginPhone(phone, name);
          setStep('otp');
        } else {
          await verifyOtp(otp);
          navigate('/dashboard');
        }
      } else if (mode === 'email') {
        if (!email || !password) { setError('Please enter email and password'); setLoading(false); return; }
        await loginEmail(email, password, name);
        navigate('/dashboard');
      } else if (mode === 'guest') {
        await loginGuest();
        navigate('/dashboard');
      } else if (mode === 'officer') {
        if (!officerCode) { setError('Enter officer code'); setLoading(false); return; }
        await loginOfficer(officerCode);
        navigate('/dashboard');
      }
    } catch (e: any) {
      setError(e.message || t('error'));
    }
    setLoading(false);
  }

  const modeButtons: { key: Mode; icon: any; label: string }[] = [
    { key: 'phone', icon: Phone, label: t('phoneLogin') },
    { key: 'email', icon: Mail, label: t('emailLogin') },
    { key: 'guest', icon: User, label: t('guestMode') },
    { key: 'officer', icon: KeyRound, label: t('officerLogin') },
  ];

  return (
    <div className="fixed inset-0 bg-narad-bg grid-bg overflow-y-auto">
      <div className="flex items-center justify-between p-4 safe-top">
        <NaradLogo size={36} />
        <LanguageToggle compact />
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-8">
        <div className="w-full max-w-md">
          {/* Logo and title */}
          <div className="flex flex-col items-center mb-8 animate-scale-in">
            <NaradLogo size={90} animated showText />
            <h1 className="text-2xl font-bold text-narad-text mt-6">{t('loginTitle')}</h1>
            <p className="text-sm text-narad-muted mt-1">{t('loginSubtitle')}</p>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {modeButtons.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  onClick={() => { setMode(m.key); setStep('input'); setError(''); }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    mode === m.key
                      ? 'border-narad-primary bg-narad-primary/10 text-narad-primary'
                      : 'border-narad-border bg-narad-surface text-narad-muted hover:border-narad-primary/30'
                  }`}
                >
                  <Icon size={16} />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div className="glass-strong rounded-2xl p-6 space-y-4 animate-fade-in">
            {mode === 'phone' && step === 'input' && (
              <>
                <div>
                  <label className="text-xs text-narad-muted mb-1.5 block">{t('fullName')}</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
                    <input
                      className="input-field pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rajesh Kumar"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-narad-muted mb-1.5 block">{t('phoneNumber')}</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
                    <input
                      className="input-field pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      inputMode="tel"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'phone' && step === 'otp' && (
              <div className="text-center py-4">
                <Shield className="mx-auto text-narad-primary mb-4" size={40} />
                <p className="text-sm text-narad-muted mb-4">OTP sent to {pendingPhone}</p>
                <input
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  inputMode="numeric"
                  maxLength={6}
                />
                <p className="text-xs text-narad-muted mt-3">Demo: Enter any 6 digits</p>
              </div>
            )}

            {mode === 'email' && (
              <>
                <div>
                  <label className="text-xs text-narad-muted mb-1.5 block">{t('fullName')}</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
                    <input className="input-field pl-10" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rajesh Kumar" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-narad-muted mb-1.5 block">{t('emailAddress')}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
                    <input className="input-field pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rajesh@example.com" type="email" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-narad-muted mb-1.5 block">{t('password')}</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
                    <input className="input-field pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
                  </div>
                </div>
              </>
            )}

            {mode === 'guest' && (
              <div className="text-center py-6">
                <User className="mx-auto text-narad-primary mb-3" size={40} />
                <p className="text-sm text-narad-muted">
                  Explore NARAD with limited features. No registration needed.
                </p>
              </div>
            )}

            {mode === 'officer' && (
              <div>
                <label className="text-xs text-narad-muted mb-1.5 block">{t('officerCode')}</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
                  <input
                    className="input-field pl-10 font-mono"
                    value={officerCode}
                    onChange={(e) => setOfficerCode(e.target.value)}
                    placeholder="NARAD-OFFICER-001"
                  />
                </div>
                <p className="text-xs text-narad-muted mt-2">Demo: Use any code starting with "NARAD-"</p>
              </div>
            )}

            {error && <p className="text-sm text-narad-danger text-center">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? t('loading') : (
                <>
                  {mode === 'phone' && step === 'input' ? t('sendOtp') :
                   mode === 'phone' && step === 'otp' ? t('verifyOtp') :
                   mode === 'guest' ? t('loginAsGuest') :
                   mode === 'officer' ? t('signIn') :
                   t('signIn')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-narad-muted mt-6">
            By continuing, you agree to NARAD's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

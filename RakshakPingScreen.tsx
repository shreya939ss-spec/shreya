import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, User, Phone, Plus, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, X, PhoneCall, PhoneOff, MapPin, Bell, Siren, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { saveEmergencyAlert } from '../../lib/hooks';

type DemoState = 'idle' | 'incoming' | 'flagged' | 'countdown' | 'alerting' | 'sent';

export default function RakshakPingScreen() {
  const { user, updateProfile } = useAuth();
  const { t } = useLang();
  const [contactName, setContactName] = useState(user?.emergency_contact_name || '');
  const [contactPhone, setContactPhone] = useState(user?.emergency_contact_phone || '');
  const [showAddForm, setShowAddForm] = useState(!user?.emergency_contact_phone);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [demoState, setDemoState] = useState<DemoState>('idle');
  const [saving, setSaving] = useState(false);
  const [ringProgress, setRingProgress] = useState(0);
  const ringIntervalRef = useRef<number | null>(null);

  const hasContact = !!(user?.emergency_contact_phone || contactPhone);
  const scamNumber = '+91 98765 43210';
  const scamType = 'Digital Arrest Scam';

  // Countdown timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setDemoState('alerting');
      setTimeout(() => sendAlert(), 1500);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Ring animation for incoming call
  useEffect(() => {
    if (demoState !== 'incoming') {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      return;
    }
    ringIntervalRef.current = window.setInterval(() => {
      setRingProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 50);
    // Auto-advance after 4 seconds
    const autoTimer = setTimeout(() => {
      setDemoState('flagged');
    }, 4000);
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      clearTimeout(autoTimer);
    };
  }, [demoState]);

  async function saveContact() {
    if (!contactName || !contactPhone) return;
    setSaving(true);
    try {
      await updateProfile({
        emergency_contact_name: contactName,
        emergency_contact_phone: contactPhone,
      });
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  function startDemo() {
    setDemoState('incoming');
    setRingProgress(0);
  }

  function acceptAndFlag() {
    setDemoState('flagged');
  }

  function startCountdown() {
    setDemoState('countdown');
    setCountdown(180); // 3 minutes
  }

  function cancelAlert() {
    setCountdown(null);
    setDemoState('idle');
  }

  async function sendAlert() {
    setCountdown(null);
    setDemoState('sent');
    if (user?.session_id) {
      await saveEmergencyAlert({
        session_id: user.session_id,
        contact_name: contactName || user?.emergency_contact_name || 'Emergency Contact',
        contact_phone: contactPhone || user?.emergency_contact_phone || '',
        trigger_type: 'AUTO_SCAM_DETECTION',
        status: 'SENT',
      });
    }
    setTimeout(() => setDemoState('idle'), 6000);
  }

  function resetDemo() {
    setDemoState('idle');
    setCountdown(null);
  }

  // ─── INCOMING CALL SCREEN ─────────────────────────────
  if (demoState === 'incoming') {
    return (
      <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col items-center justify-center z-50 animate-fade-in">
        {/* Pulsing rings */}
        <div className="relative flex items-center justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-rose-500/40"
              style={{
                width: `${120 + i * 60}px`,
                height: `${120 + i * 60}px`,
                animation: `ping ${1.5 + i * 0.3}s ease-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-[0_0_40px_rgba(255,59,92,0.5)]">
            <PhoneCall size={40} className="text-white animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-2">
          <p className="text-2xl font-bold text-narad-text font-mono">{scamNumber}</p>
          <p className="text-sm text-narad-muted mt-1">Incoming call...</p>
        </div>

        <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30">
          <Siren size={14} className="text-rose-400" />
          <span className="text-xs text-rose-400 font-medium">NARAD is analyzing this number...</span>
        </div>

        {/* Progress bar showing analysis */}
        <div className="w-64 mt-4">
          <div className="h-1 bg-narad-border rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-100"
              style={{ width: `${ringProgress}%` }}
            />
          </div>
        </div>

        {/* Accept/Reject buttons */}
        <div className="flex gap-12 mt-12">
          <button
            onClick={() => { setDemoState('idle'); }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-narad-border flex items-center justify-center hover:bg-narad-border/70 transition-all">
              <PhoneOff size={24} className="text-narad-text" />
            </div>
            <span className="text-xs text-narad-muted">{t('cancel')}</span>
          </button>
          <button
            onClick={acceptAndFlag}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center hover:bg-rose-400 transition-all active:scale-90 shadow-[0_0_20px_rgba(255,59,92,0.4)]">
              <Phone size={24} className="text-white" />
            </div>
            <span className="text-xs text-narad-muted">Answer</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── FLAGGED SCREEN ────────────────────────────────────
  if (demoState === 'flagged') {
    return (
      <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col items-center justify-center z-50 animate-fade-in p-6">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full animate-scale-in glow-danger">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500">
                <Siren size={40} className="text-rose-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-rose-400">SCAM DETECTED!</h2>
              <p className="text-sm text-narad-muted mt-2">
                NARAD AI has flagged this number as a known scam caller.
              </p>
            </div>

            <div className="w-full space-y-2 mt-4">
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">{t('scamType')}</span>
                <span className="text-sm text-rose-400 font-medium">{scamType}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">{t('riskLevel')}</span>
                <span className="text-sm text-rose-400 font-bold">CRITICAL</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">{t('reportsCount')}</span>
                <span className="text-sm text-narad-text">2,341 reports</span>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <MapPin size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-rose-400">Origin: Jamtara, Jharkhand — Known fraud syndicate hotspot</span>
              </div>
            </div>

            <div className="w-full mt-4 p-4 rounded-xl bg-narad-primary/10 border border-narad-primary/30">
              <p className="text-sm text-narad-text font-medium mb-3">
                Rakshak Ping will auto-notify your emergency contact in 3 minutes unless you cancel.
              </p>
              <div className="flex gap-3">
                <button onClick={resetDemo} className="btn-ghost flex-1 flex items-center justify-center gap-2">
                  <X size={18} /> {t('imSafe')}
                </button>
                <button
                  onClick={startCountdown}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium hover:from-rose-400 hover:to-rose-500 transition-all active:scale-95"
                >
                  <Zap size={18} /> Start Countdown
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── COUNTDOWN SCREEN ──────────────────────────────────
  if (demoState === 'countdown' && countdown !== null) {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return (
      <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col items-center justify-center z-50 animate-fade-in p-6">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full animate-scale-in glow-danger">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30">
              <Siren size={16} className="text-rose-400 animate-pulse" />
              <span className="text-xs text-rose-400 font-mono">ALERT COUNTDOWN ACTIVE</span>
            </div>

            {/* Circular countdown */}
            <div className="relative w-56 h-56 mx-auto my-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#1C2D4A" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r="90" fill="none" stroke="#FF3B5C" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 90}
                  strokeDashoffset={2 * Math.PI * 90 * (1 - countdown / 180)}
                  className="transition-all duration-1000"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255,59,92,0.6))' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold text-rose-400 font-mono">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-narad-muted mt-2">{t('alertCountdown')}</div>
              </div>
            </div>

            <div className="w-full p-4 rounded-xl bg-narad-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <User size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-narad-text">{contactName || user?.emergency_contact_name}</div>
                  <div className="text-xs text-narad-muted">{contactPhone || user?.emergency_contact_phone}</div>
                </div>
                <Bell size={16} className="text-rose-400 animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-narad-muted">
              When timer reaches 0, an alert with your live location will be sent automatically.
            </p>

            <button onClick={cancelAlert} className="btn-ghost w-full flex items-center justify-center gap-2">
              <X size={18} /> {t('imSafe')} — Cancel Alert
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ALERTING (sending) ────────────────────────────────
  if (demoState === 'alerting') {
    return (
      <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col items-center justify-center z-50 animate-fade-in p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500">
              <Bell size={36} className="text-emerald-400 animate-bounce" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-narad-text">Sending Alert...</h2>
            <p className="text-sm text-narad-muted mt-1">Notifying {contactName || user?.emergency_contact_name}</p>
          </div>
          <div className="w-48 h-1.5 bg-narad-border rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  // ─── ALERT SENT ────────────────────────────────────────
  if (demoState === 'sent') {
    return (
      <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col items-center justify-center z-50 animate-fade-in p-6">
        <div className="glass-strong rounded-3xl p-8 max-w-md w-full animate-scale-in glow-success">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-400">{t('alertSent')}</h2>
              <p className="text-sm text-narad-muted mt-2">
                Emergency alert with your live location has been sent to:
              </p>
            </div>
            <div className="w-full p-4 rounded-xl bg-narad-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <User size={20} className="text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-narad-text">{contactName || user?.emergency_contact_name}</div>
                  <div className="text-xs text-narad-muted">{contactPhone || user?.emergency_contact_phone}</div>
                </div>
              </div>
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-narad-surface">
                <MapPin size={14} className="text-emerald-400" />
                <span className="text-xs text-narad-muted">Live location shared: Bengaluru, Karnataka</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-narad-surface">
                <PhoneCall size={14} className="text-emerald-400" />
                <span className="text-xs text-narad-muted">Scam call details attached: {scamNumber}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-narad-surface">
                <Siren size={14} className="text-emerald-400" />
                <span className="text-xs text-narad-muted">Incident type: {scamType}</span>
              </div>
            </div>
            <button onClick={resetDemo} className="btn-ghost w-full flex items-center justify-center gap-2 mt-2">
              <RotateCcw size={18} /> Back to Rakshak Ping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── DEFAULT SCREEN ────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-emerald-400">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-narad-text">{t('rakshakPing')}</h1>
          <p className="text-sm text-narad-muted">{t('featRakshakDesc')}</p>
        </div>
      </div>

      {/* Emergency Contact Setup */}
      {showAddForm && (
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-narad-text flex items-center gap-2">
            <Plus size={20} /> {t('addContact')}
          </h2>
          <div>
            <label className="text-xs text-narad-muted mb-1.5 block">{t('contactName')}</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
              <input className="input-field pl-10" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. My Spouse" />
            </div>
          </div>
          <div>
            <label className="text-xs text-narad-muted mb-1.5 block">{t('contactPhone')}</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
              <input className="input-field pl-10" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" inputMode="tel" />
            </div>
          </div>
          <button onClick={saveContact} disabled={saving || !contactName || !contactPhone} className="btn-primary w-full disabled:opacity-50">
            {saving ? t('loading') : t('saveContact')}
          </button>
        </div>
      )}

      {/* Contact card + trigger */}
      {!showAddForm && hasContact && (
        <>
          <div className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <User size={24} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-narad-text">{contactName || user?.emergency_contact_name}</div>
                <div className="text-xs text-narad-muted">{contactPhone || user?.emergency_contact_phone}</div>
              </div>
              <button onClick={() => setShowAddForm(true)} className="text-xs text-narad-primary hover:underline">
                Edit
              </button>
            </div>
          </div>

          {/* Demo banner */}
          <div className="glass-strong rounded-2xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-narad-text">Live Demo: Scam Call Detection</h3>
            </div>
            <p className="text-xs text-narad-muted mb-4">
              Experience the full Rakshak Ping flow: A simulated scam call comes in, NARAD AI flags it,
              a 3-minute countdown starts, and when it expires your emergency contact is automatically notified.
            </p>
            <button
              onClick={startDemo}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
            >
              <PhoneCall size={20} /> Start Demo: Simulate Scam Call
            </button>
          </div>

          {/* Manual trigger */}
          <div className="glass-strong rounded-2xl p-8 text-center">
            <p className="text-sm text-narad-muted mb-6">
              {t('triggerAlert')}
            </p>
            <button
              onClick={() => { setDemoState('countdown'); setCountdown(180); }}
              className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_50px_rgba(255,59,92,0.4)] hover:shadow-[0_0_70px_rgba(255,59,92,0.6)] transition-all active:scale-95 animate-pulse-glow"
            >
              <div className="flex flex-col items-center gap-2">
                <ShieldAlert size={48} />
                <span className="text-sm">{t('triggerAlert')}</span>
              </div>
            </button>
          </div>
        </>
      )}

      {!hasContact && !showAddForm && (
        <div className="glass rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-narad-accent mx-auto mb-3" />
          <p className="text-sm text-narad-muted mb-4">Add an emergency contact to use Rakshak Ping.</p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary">
            {t('addContact')}
          </button>
        </div>
      )}
    </div>
  );
}

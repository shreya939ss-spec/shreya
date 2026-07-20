import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NaradLogo from '../components/NaradLogo';
import { useLang } from '../context/LanguageContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);
  const [bootStep, setBootStep] = useState(0);

  const bootMessages = [
    'Initializing AI Core...',
    'Loading Fraud Database...',
    'Connecting Cyber Grid...',
    'Calibrating Security Modules...',
    'Activating NARAD Shield...',
  ];

  useEffect(() => {
    const seen = sessionStorage.getItem('narad-splash-seen');
    if (seen) {
      setShow(false);
      navigate('/onboarding', { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          sessionStorage.setItem('narad-splash-seen', '1');
          setTimeout(() => navigate('/onboarding', { replace: true }), 600);
          return 100;
        }
        return p + 1.5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    const step = Math.floor((progress / 100) * bootMessages.length);
    setBootStep(Math.min(step, bootMessages.length - 1));
  }, [progress]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col items-center justify-center overflow-hidden">
      {/* Animated radar sweep */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[600px] h-[600px] max-w-[100vw] max-h-[100vw]">
          {/* Concentric rings */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-cyan-400/10"
              style={{
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
                left: `${(1 - scale) * 50}%`,
                top: `${(1 - scale) * 50}%`,
              }}
            />
          ))}
          {/* Radar sweep */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,229,255,0.08) 30deg, transparent 60deg)',
              animation: 'spin 4s linear infinite',
            }}
          />
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400/20"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-6 animate-scale-in">
        <NaradLogo size={140} animated showText />
        <div className="text-center max-w-xs px-6">
          <p className="text-narad-muted text-sm tracking-wide">{t('appTagline')}</p>
        </div>
      </div>

      {/* Boot sequence + loading bar */}
      <div className="relative z-10 mt-12 w-72 flex flex-col items-center gap-4">
        <div className="w-full h-1 bg-narad-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-cyan-400/80 font-mono tracking-wide">
          {bootMessages[bootStep]}
        </p>
        <p className="text-[10px] text-narad-muted/60 font-mono">{Math.floor(progress)}%</p>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-narad-muted/50 tracking-widest uppercase">Made in India • Digital India Initiative</p>
      </div>
    </div>
  );
}

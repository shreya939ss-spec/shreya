import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ScanLine, PhoneCall, ShieldAlert, MessageSquareWarning,
  Network, Map, ChevronRight, ChevronLeft,
} from 'lucide-react';
import NaradLogo from '../components/NaradLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import { useLang } from '../context/LanguageContext';
import type { TranslationKey } from '../lib/translations';

const features = [
  { icon: Shield, titleKey: 'featKuberTitle' as TranslationKey, descKey: 'featKuberDesc' as TranslationKey, color: 'from-amber-500/20 to-amber-600/5', iconColor: 'text-amber-400' },
  { icon: ScanLine, titleKey: 'featPramaanTitle' as TranslationKey, descKey: 'featPramaanDesc' as TranslationKey, color: 'from-cyan-500/20 to-cyan-600/5', iconColor: 'text-cyan-400' },
  { icon: PhoneCall, titleKey: 'featAakashvaniTitle' as TranslationKey, descKey: 'featAakashvaniDesc' as TranslationKey, color: 'from-rose-500/20 to-rose-600/5', iconColor: 'text-rose-400' },
  { icon: ShieldAlert, titleKey: 'featRakshakTitle' as TranslationKey, descKey: 'featRakshakDesc' as TranslationKey, color: 'from-emerald-500/20 to-emerald-600/5', iconColor: 'text-emerald-400' },
  { icon: MessageSquareWarning, titleKey: 'featTrinetraTitle' as TranslationKey, descKey: 'featTrinetraDesc' as TranslationKey, color: 'from-orange-500/20 to-orange-600/5', iconColor: 'text-orange-400' },
  { icon: Network, titleKey: 'featSutraTitle' as TranslationKey, descKey: 'featSutraDesc' as TranslationKey, color: 'from-blue-500/20 to-blue-600/5', iconColor: 'text-blue-400' },
  { icon: Map, titleKey: 'featCommandTitle' as TranslationKey, descKey: 'featCommandDesc' as TranslationKey, color: 'from-indigo-500/20 to-indigo-600/5', iconColor: 'text-indigo-400' },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < features.length - 1) setCurrent((c) => c + 1);
    else navigate('/login');
  };

  const prev = () => current > 0 && setCurrent((c) => c - 1);
  const skip = () => navigate('/login');

  const feature = features[current];
  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 bg-narad-bg grid-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 safe-top">
        <NaradLogo size={36} />
        <div className="flex items-center gap-3">
          <LanguageToggle compact />
          <button onClick={skip} className="text-sm text-narad-muted hover:text-narad-text transition-colors px-3 py-1.5">
            {t('skip')}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-narad-text mb-2 text-balance">{t('onboardingTitle')}</h1>
          <p className="text-sm text-narad-muted">{t('onboardingSubtitle')}</p>
        </div>

        {/* Feature card */}
        <div
          key={current}
          className={`w-full glass-strong rounded-3xl p-8 animate-scale-in bg-gradient-to-br ${feature.color}`}
        >
          <div className="flex flex-col items-center text-center gap-5">
            <div className={`p-5 rounded-2xl glass ${feature.iconColor}`}>
              <Icon size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-narad-text mb-2 tracking-wide">
                {t(feature.titleKey)}
              </h2>
              <p className="text-sm text-narad-muted leading-relaxed">{t(feature.descKey)}</p>
            </div>
          </div>
        </div>

        {/* Stats banner on first slide */}
        {current === 0 && (
          <div className="grid grid-cols-3 gap-3 mt-6 w-full animate-slide-up">
            <div className="glass rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-narad-primary">1.14M</div>
              <div className="text-[10px] text-narad-muted">{t('statsTotalComplaints')}</div>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-narad-danger">₹1,776Cr</div>
              <div className="text-[10px] text-narad-muted">{t('statsTotalLoss')}</div>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-narad-success">7</div>
              <div className="text-[10px] text-narad-muted">Pillars</div>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-8">
          {features.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-8 bg-narad-primary' : 'w-1.5 bg-narad-border'}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="p-6 flex items-center justify-between gap-4 safe-bottom">
        <button
          onClick={prev}
          disabled={current === 0}
          className="btn-ghost flex items-center gap-1 disabled:opacity-30"
        >
          <ChevronLeft size={18} /> {t('back')}
        </button>
        <button onClick={next} className="btn-primary flex items-center gap-1 flex-1 justify-center max-w-[200px]">
          {current === features.length - 1 ? t('getStarted') : t('next')}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

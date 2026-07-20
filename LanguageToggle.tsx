import { useState } from 'react';
import { Globe, Check, X } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { LANGUAGES } from '../lib/languages';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm hover:border-narad-primary/50 transition-all"
      >
        <Globe size={16} className="text-narad-primary" />
        {!compact && <span className="text-narad-text font-medium">{current?.nativeName}</span>}
        {compact && <span className="text-narad-text font-medium uppercase">{lang}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative glass-strong rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-narad-text">{t('selectLanguage')}</h2>
              <button onClick={() => setOpen(false)} className="text-narad-muted hover:text-narad-text transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                    lang === l.code
                      ? 'border-narad-primary bg-narad-primary/10 text-narad-primary'
                      : 'border-narad-border bg-narad-surface text-narad-text hover:border-narad-primary/40'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{l.nativeName}</div>
                    <div className="text-xs text-narad-muted">{l.name}</div>
                  </div>
                  {lang === l.code && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

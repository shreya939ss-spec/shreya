import { useState } from 'react';
import { PhoneCall, Search, AlertTriangle, CheckCircle2, User, MapPin, Phone, MessageSquare, Flag, RotateCcw, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { useFlaggedNumbers, saveScanResult, type FlaggedNumber } from '../../lib/hooks';
import { analyzePhone, type PhoneResult } from '../../lib/gemini';

export default function AakashvaniScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const { items: flaggedNumbers } = useFlaggedNumbers();
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [dbMatch, setDbMatch] = useState<FlaggedNumber | null>(null);
  const [aiResult, setAiResult] = useState<PhoneResult | null>(null);
  const [error, setError] = useState('');

  function normalizePhone(raw: string): string {
    let p = raw.replace(/[^0-9+]/g, '');
    if (p.startsWith('91') && p.length === 12) p = '+' + p;
    else if (p.startsWith('9') && p.length === 10) p = '+91' + p;
    else if (p.startsWith('091') && p.length === 13) p = '+' + p.slice(1);
    else if (!p.startsWith('+') && p.length === 10) p = '+91' + p;
    return p;
  }

  async function checkNumber() {
    if (!input.trim()) return;
    setAnalyzing(true);
    setDbMatch(null);
    setAiResult(null);
    setError('');

    const normalized = normalizePhone(input);
    const found = flaggedNumbers.find((n) => n.phone_number === normalized) || null;
    setDbMatch(found);

    try {
      const ai = await analyzePhone(normalized, found ? `Database match: ${found.scam_type} - ${found.scam_category}` : undefined);
      setAiResult(ai);

      if (user?.session_id) {
        await saveScanResult({
          session_id: user.session_id,
          pillar: 'aakashvani',
          input_type: 'phone_number',
          input_value: normalized,
          verdict: found ? 'FLAGGED' : ai.verdict,
          confidence_score: found ? 95 : ai.riskScore,
          risk_level: found?.risk_level || ai.riskLevel,
          details: { dbMatch: found, aiAnalysis: ai },
        });
      }
    } catch (e: any) {
      setError(e.message || 'AI analysis failed');
    }

    setAnalyzing(false);
  }

  function reset() {
    setInput('');
    setDbMatch(null);
    setAiResult(null);
    setError('');
  }

  const hasResult = dbMatch || aiResult;
  const isFlagged = !!dbMatch || aiResult?.verdict === 'FLAGGED' || aiResult?.verdict === 'SUSPICIOUS';

  const riskColors: Record<string, string> = {
    CRITICAL: 'text-narad-danger bg-narad-danger/10 border-narad-danger/30',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    MEDIUM: 'text-narad-accent bg-narad-accent/10 border-narad-accent/30',
    LOW: 'text-narad-success bg-narad-success/10 border-narad-success/30',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-rose-400">
          <PhoneCall size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-narad-text">{t('aakashvani')}</h1>
          <p className="text-sm text-narad-muted flex items-center gap-1">
            <Sparkles size={12} className="text-narad-primary" /> Powered by Gemini AI + NARAD Database
          </p>
        </div>
      </div>

      {/* Input */}
      {!hasResult && (
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-narad-muted" />
            <input
              className="input-field pl-10"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('enterPhoneNumber')}
              inputMode="tel"
              onKeyDown={(e) => e.key === 'Enter' && checkNumber()}
            />
          </div>
          <button
            onClick={checkNumber}
            disabled={analyzing || !input}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <><Sparkles size={20} className="animate-spin" /> Gemini AI checking...</>
            ) : (
              <><Search size={20} /> {t('checkThisNumber')}</>
            )}
          </button>
          {error && <p className="text-sm text-narad-danger text-center">{error}</p>}
        </div>
      )}

      {/* Result — Database match */}
      {dbMatch && (
        <div className="glass-strong rounded-2xl p-6 animate-scale-in glow-danger">
          <div className="flex items-center gap-4 mb-5">
            <AlertTriangle size={48} className="text-narad-danger" />
            <div>
              <div className="text-2xl font-bold text-narad-danger">FLAGGED IN DATABASE</div>
              <div className="text-sm text-narad-muted">{normalizePhone(input)}</div>
            </div>
          </div>

          <div className={`badge border ${riskColors[dbMatch.risk_level] || riskColors.MEDIUM} mb-5`}>
            {t('riskLevel')}: {dbMatch.risk_level}
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
              <span className="text-sm text-narad-muted">{t('scamType')}</span>
              <span className="text-sm text-narad-text font-medium">{dbMatch.scam_type}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
              <span className="text-sm text-narad-muted">{t('scamCategory')}</span>
              <span className="text-sm text-narad-text">{dbMatch.scam_category}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
              <span className="text-sm text-narad-muted">{t('reportsCount')}</span>
              <span className="text-sm text-narad-danger font-bold">{dbMatch.reports_count.toLocaleString('en-IN')}</span>
            </div>
            {dbMatch.operator_name && (
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">Operator</span>
                <span className="text-sm text-narad-text">{dbMatch.operator_name}</span>
              </div>
            )}
          </div>

          {/* Suspect profile */}
          {dbMatch.suspect_name && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-narad-text mb-3 flex items-center gap-2">
                <User size={16} /> {t('suspectProfile')}
              </h3>
              <div className="flex gap-4 p-4 rounded-xl bg-narad-surface">
                {dbMatch.suspect_face_url && (
                  <img
                    src={dbMatch.suspect_face_url}
                    alt="Suspect"
                    className="w-20 h-20 rounded-xl object-cover border-2 border-narad-danger/30"
                  />
                )}
                <div className="flex-1 space-y-1.5">
                  <div className="text-sm font-semibold text-narad-text">{dbMatch.suspect_name}</div>
                  {dbMatch.suspect_alias && (
                    <div className="text-xs text-narad-accent">Alias: {dbMatch.suspect_alias}</div>
                  )}
                  {dbMatch.suspect_age && (
                    <div className="text-xs text-narad-muted">{t('suspectAge')}: {dbMatch.suspect_age}</div>
                  )}
                  {dbMatch.last_reported_city && (
                    <div className="text-xs text-narad-muted flex items-center gap-1">
                      <MapPin size={12} /> {dbMatch.last_reported_city}, {dbMatch.last_reported_state}
                    </div>
                  )}
                </div>
              </div>
              {dbMatch.suspect_description && (
                <p className="text-xs text-narad-muted mt-2 p-3 rounded-xl bg-narad-surface">
                  {dbMatch.suspect_description}
                </p>
              )}
            </div>
          )}

          {/* Known scripts */}
          {dbMatch.known_scripts && dbMatch.known_scripts.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-narad-text mb-3 flex items-center gap-2">
                <MessageSquare size={16} /> {t('knownScripts')}
              </h3>
              <div className="space-y-2">
                {dbMatch.known_scripts.map((script, i) => (
                  <div key={i} className="p-3 rounded-xl bg-narad-danger/5 border border-narad-danger/15 text-xs text-narad-text italic">
                    "{script}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis result */}
      {aiResult && (
        <div className={`glass-strong rounded-2xl p-6 animate-scale-in ${isFlagged ? 'border border-narad-danger/30' : 'glow-success'}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-narad-primary" />
            <h3 className="text-sm font-semibold text-narad-text">Gemini AI Analysis</h3>
          </div>

          <div className="flex items-center gap-4 mb-5">
            {isFlagged ? (
              <AlertTriangle size={40} className="text-narad-danger" />
            ) : (
              <CheckCircle2 size={40} className="text-narad-success" />
            )}
            <div>
              <div className={`text-xl font-bold ${isFlagged ? 'text-narad-danger' : 'text-narad-success'}`}>
                {aiResult.verdict}
              </div>
              <div className="text-sm text-narad-muted">Risk Score: {aiResult.riskScore}/100</div>
            </div>
          </div>

          {/* Risk bar */}
          <div className="mb-5">
            <div className="h-2 bg-narad-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  aiResult.riskScore >= 80 ? 'bg-narad-danger' :
                  aiResult.riskScore >= 50 ? 'bg-narad-accent' :
                  aiResult.riskScore >= 25 ? 'bg-orange-400' : 'bg-narad-success'
                }`}
                style={{ width: `${aiResult.riskScore}%` }}
              />
            </div>
          </div>

          {aiResult.possibleScamType && (
            <div className="mb-4 p-3 rounded-xl bg-narad-danger/10 border border-narad-danger/20">
              <span className="text-xs font-semibold text-narad-danger">Possible Scam: </span>
              <span className="text-xs text-narad-text">{aiResult.possibleScamType}</span>
            </div>
          )}

          {aiResult.suspectProfile && (
            <div className="space-y-2 mb-4">
              {aiResult.suspectProfile.likelyOperator && (
                <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                  <span className="text-xs text-narad-muted">Likely Operator</span>
                  <span className="text-xs text-narad-text">{aiResult.suspectProfile.likelyOperator}</span>
                </div>
              )}
              {aiResult.suspectProfile.likelyRegion && (
                <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                  <span className="text-xs text-narad-muted">Likely Region</span>
                  <span className="text-xs text-narad-text">{aiResult.suspectProfile.likelyRegion}</span>
                </div>
              )}
              {aiResult.suspectProfile.knownPatterns && aiResult.suspectProfile.knownPatterns.length > 0 && (
                <div className="p-3 rounded-xl bg-narad-surface">
                  <div className="text-xs text-narad-muted mb-1">Known Patterns:</div>
                  <ul className="text-xs text-narad-text list-disc list-inside space-y-0.5">
                    {aiResult.suspectProfile.knownPatterns.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {aiResult.reasoning && (
            <div className="mb-4 p-3 rounded-xl bg-narad-surface">
              <p className="text-sm text-narad-muted">{aiResult.reasoning}</p>
            </div>
          )}

          {aiResult.recommendation && (
            <div className="p-3 rounded-xl bg-narad-primary/10 border border-narad-primary/20 mb-5">
              <p className="text-xs text-narad-primary">{aiResult.recommendation}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="btn-ghost flex items-center gap-2 flex-1 justify-center">
              <RotateCcw size={18} /> {t('newScan')}
            </button>
            {isFlagged && (
              <button className="btn-primary flex items-center gap-2 flex-1 justify-center bg-gradient-to-r from-rose-500 to-rose-600">
                <Flag size={18} /> {t('reportNumber')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pre-flagged numbers hint */}
      {!hasResult && !analyzing && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-narad-text mb-2">Try a flagged number from our database:</h3>
          <div className="flex flex-wrap gap-2">
            {flaggedNumbers.slice(0, 5).map((n) => (
              <button
                key={n.id}
                onClick={() => setInput(n.phone_number)}
                className="text-xs px-3 py-1.5 rounded-lg bg-narad-surface border border-narad-border text-narad-muted hover:border-narad-primary/40 hover:text-narad-text transition-all font-mono"
              >
                {n.phone_number}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

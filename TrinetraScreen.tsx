import { useState } from 'react';
import { MessageSquareWarning, ScanLine, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Flag, RotateCcw, OctagonAlert as AlertOctagon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { saveScanResult } from '../../lib/hooks';
import { analyzeMessage, type MessageResult } from '../../lib/gemini';

export default function TrinetraScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MessageResult | null>(null);
  const [error, setError] = useState('');

  async function analyze() {
    if (!message.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setError('');

    try {
      const aiResult = await analyzeMessage(message);
      setResult(aiResult);

      if (user?.session_id) {
        await saveScanResult({
          session_id: user.session_id,
          pillar: 'trinetra',
          input_type: 'sms_text',
          input_value: message.slice(0, 200),
          verdict: aiResult.verdict || 'SAFE',
          confidence_score: aiResult.riskScore || 0,
          risk_level: aiResult.riskLevel || 'LOW',
          details: aiResult,
        });
      }
    } catch (e: any) {
      setError(e.message || 'AI analysis failed. Please try again.');
    }

    setAnalyzing(false);
  }

  function reset() {
    setMessage('');
    setResult(null);
    setError('');
  }

  function highlightText(text: string, phrases: string[]) {
    if (!phrases || phrases.length === 0) return text;
    const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    try {
      const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        phrases.some((p) => p.toLowerCase() === part.toLowerCase())
          ? `<mark class="bg-narad-danger/30 text-narad-danger rounded px-1">${part}</mark>`
          : part
      ).join('');
    } catch {
      return text;
    }
  }

  const verdictColors: Record<string, string> = {
    DANGEROUS: 'text-narad-danger',
    SUSPICIOUS: 'text-narad-accent',
    CAUTION: 'text-orange-400',
    SAFE: 'text-narad-success',
  };

  const sampleMessages = [
    'Dear Customer, your SBI account will be blocked. Verify KYC immediately: http://sbi-verify.co.in',
    'Congratulations! You won Rs 25 lakh in KBC Lottery. Pay Rs 2000 processing fee to claim. Call +919001122334',
    'Your Aadhaar linked to 14 mobile numbers in crime case. UIDAI will suspend in 2 hours. Press 1 to speak with officer.',
    'This is CBI headquarters. A warrant has been issued in your name for money laundering. Pay Rs 50,000 to avoid digital arrest.',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-orange-400">
          <MessageSquareWarning size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-narad-text">{t('trinetra')}</h1>
          <p className="text-sm text-narad-muted flex items-center gap-1">
            <Sparkles size={12} className="text-narad-primary" /> Powered by Gemini AI
          </p>
        </div>
      </div>

      {/* Input */}
      {!result && (
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <textarea
            className="input-field min-h-[150px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('pasteMessage')}
          />
          <button
            onClick={analyze}
            disabled={analyzing || !message.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <><Sparkles size={20} className="animate-spin" /> Gemini AI analyzing...</>
            ) : (
              <><Sparkles size={20} /> {t('analyzeMessage')}</>
            )}
          </button>
          {error && <p className="text-sm text-narad-danger text-center">{error}</p>}
        </div>
      )}

      {/* Sample messages */}
      {!result && !analyzing && !message && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-narad-text mb-2">Try a sample message:</h3>
          <div className="space-y-2">
            {sampleMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => setMessage(msg)}
                className="w-full text-left text-xs p-3 rounded-xl bg-narad-surface border border-narad-border text-narad-muted hover:border-narad-primary/40 hover:text-narad-text transition-all"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-strong rounded-2xl p-6 animate-scale-in">
          <div className="flex items-center gap-4 mb-5">
            {result.verdict === 'SAFE' ? (
              <CheckCircle2 size={48} className="text-narad-success" />
            ) : result.verdict === 'DANGEROUS' ? (
              <AlertOctagon size={48} className="text-narad-danger" />
            ) : (
              <AlertTriangle size={48} className={result.verdict === 'SUSPICIOUS' ? 'text-narad-accent' : 'text-orange-400'} />
            )}
            <div>
              <div className={`text-2xl font-bold ${verdictColors[result.verdict] || 'text-narad-text'}`}>{result.verdict}</div>
              <div className="text-sm text-narad-muted">{t('messageRisk')}: {result.riskScore}/100</div>
            </div>
          </div>

          {/* Risk bar */}
          <div className="mb-5">
            <div className="h-2 bg-narad-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  result.riskScore >= 80 ? 'bg-narad-danger' :
                  result.riskScore >= 50 ? 'bg-narad-accent' :
                  result.riskScore >= 25 ? 'bg-orange-400' : 'bg-narad-success'
                }`}
                style={{ width: `${result.riskScore}%` }}
              />
            </div>
          </div>

          {/* Scam type */}
          {result.scamType && (
            <div className="mb-4 p-3 rounded-xl bg-narad-danger/10 border border-narad-danger/20">
              <span className="text-xs font-semibold text-narad-danger">Scam Type: </span>
              <span className="text-xs text-narad-text">{result.scamType}</span>
            </div>
          )}

          {/* Highlighted message */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-narad-text mb-2">Analyzed Message:</h3>
            <div
              className="p-4 rounded-xl bg-narad-surface text-sm text-narad-text leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlightText(message, (result.flaggedPhrases || []).map((f) => f.phrase)),
              }}
            />
          </div>

          {/* Flagged phrases */}
          {result.flaggedPhrases && result.flaggedPhrases.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-narad-text mb-3">{t('flaggedPhrases')}</h3>
              <div className="space-y-2">
                {result.flaggedPhrases.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-narad-danger/5 border border-narad-danger/15">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-narad-text font-medium">{f.phrase}</div>
                      <span className={`badge ${f.risk >= 85 ? 'bg-narad-danger/20 text-narad-danger' : 'bg-narad-accent/20 text-narad-accent'}`}>
                        {f.risk}%
                      </span>
                    </div>
                    <div className="text-xs text-narad-muted">{f.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explanation */}
          {result.explanation && (
            <div className="mb-5 p-3 rounded-xl bg-narad-surface">
              <p className="text-sm text-narad-muted">{result.explanation}</p>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="p-3 rounded-xl bg-narad-primary/10 border border-narad-primary/20 mb-5">
              <p className="text-xs text-narad-primary">{result.recommendation}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="btn-ghost flex items-center gap-2 flex-1 justify-center">
              <RotateCcw size={18} /> {t('newScan')}
            </button>
            {result.verdict !== 'SAFE' && (
              <button className="btn-primary flex items-center gap-2 flex-1 justify-center bg-gradient-to-r from-rose-500 to-rose-600">
                <Flag size={18} /> {t('reportMessage')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { ScanLine, Search, CircleCheck as CheckCircle2, Circle as XCircle, TriangleAlert as AlertTriangle, QrCode, Store, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { useFlaggedMerchants, saveScanResult, type FlaggedMerchant } from '../../lib/hooks';
import { analyzeMerchant, type MerchantResult } from '../../lib/gemini';
import jsQR from 'jsqr';

export default function PramaanScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const { items: merchants } = useFlaggedMerchants();
  const [mode, setMode] = useState<'upi' | 'qr' | 'reg'>('upi');
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [dbMatch, setDbMatch] = useState<FlaggedMerchant | null>(null);
  const [aiResult, setAiResult] = useState<MerchantResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [qrDetected, setQrDetected] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  async function startQrCamera() {
    setError('');
    setCameraReady(false);
    setQrDetected(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
      setCameraActive(true);
    } catch (e) {
      setError(t('cameraPermission'));
    }
  }

  function stopQrCamera() {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
    setQrDetected(false);
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  // Live QR scanning loop
  useEffect(() => {
    if (!cameraActive || !cameraReady) return;

    scanIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Increment scan progress for visual feedback
      setScanProgress((p) => (p >= 100 ? 0 : p + 3));

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        setQrDetected(true);
        setInput(code.data);
        // Vibrate if available
        if (navigator.vibrate) navigator.vibrate(100);
        // Brief pause to show detection, then analyze
        setTimeout(() => {
          stopQrCamera();
          analyze(code.data);
        }, 500);
      }
    }, 150);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraActive, cameraReady]);

  async function analyze(value?: string) {
    const query = (value || input).trim();
    if (!query) return;
    setAnalyzing(true);
    setDbMatch(null);
    setAiResult(null);
    setAiError('');

    let merchant: FlaggedMerchant | undefined;
    if (mode === 'upi' || mode === 'qr') {
      merchant = merchants.find((m) => m.upi_id && m.upi_id.toLowerCase() === query.toLowerCase());
    }
    setDbMatch(merchant || null);

    try {
      const ai = await analyzeMerchant(query, mode);
      setAiResult(ai);

      if (user?.session_id) {
        await saveScanResult({
          session_id: user.session_id,
          pillar: 'pramaan',
          input_type: mode,
          input_value: query,
          verdict: merchant ? merchant.status : ai.verdict,
          confidence_score: merchant ? 100 - (merchant.trust_score || 0) : ai.trustScore,
          risk_level: merchant?.risk_level || ai.riskLevel,
          details: { dbMatch: merchant, aiAnalysis: ai },
        });
      }
    } catch (e: any) {
      setAiError(e.message || 'AI analysis failed');
    }

    setAnalyzing(false);
  }

  function reset() {
    setInput('');
    setDbMatch(null);
    setAiResult(null);
    setError('');
    setAiError('');
  }

  const hasResult = dbMatch || aiResult;
  const statusColors: Record<string, string> = {
    FRAUDULENT: 'text-narad-danger',
    SUSPICIOUS: 'text-narad-accent',
    VERIFIED: 'text-narad-success',
    UNVERIFIED: 'text-narad-muted',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-cyan-400">
          <ScanLine size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-narad-text">{t('pramaan')}</h1>
          <p className="text-sm text-narad-muted flex items-center gap-1">
            <Sparkles size={12} className="text-narad-primary" /> {t('featPramaanDesc')}
          </p>
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border border-narad-danger/30 text-sm text-narad-danger">{error}</div>
      )}
      {aiError && (
        <div className="glass rounded-xl p-4 border border-narad-danger/30 text-sm text-narad-danger">{aiError}</div>
      )}

      {/* Mode tabs */}
      {!hasResult && !cameraActive && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'upi' as const, icon: Search, label: 'UPI ID' },
            { key: 'qr' as const, icon: QrCode, label: t('scanQrCode') },
            { key: 'reg' as const, icon: Store, label: t('enterShopReg') },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-all ${
                  mode === m.key
                    ? 'border-narad-primary bg-narad-primary/10 text-narad-primary'
                    : 'border-narad-border bg-narad-surface text-narad-muted'
                }`}
              >
                <Icon size={18} />
                {m.label}
              </button>
            );
          })}
        </div>
      )}

      {/* QR Camera with live detection */}
      {cameraActive && (
        <div className="relative glass-strong rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full aspect-square object-cover bg-black"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 pointer-events-none">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Clear scan area */}
            <div className="absolute inset-8 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-transparent" style={{ boxShadow: '0 0 0 1000px rgba(5,11,24,0.6)' }} />
              {/* Corner brackets */}
              <div className={`absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 rounded-tl-xl transition-colors ${qrDetected ? 'border-green-400' : 'border-cyan-400'}`} />
              <div className={`absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 rounded-tr-xl transition-colors ${qrDetected ? 'border-green-400' : 'border-cyan-400'}`} />
              <div className={`absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 rounded-bl-xl transition-colors ${qrDetected ? 'border-green-400' : 'border-cyan-400'}`} />
              <div className={`absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 rounded-br-xl transition-colors ${qrDetected ? 'border-green-400' : 'border-cyan-400'}`} />
              {/* Animated scan line */}
              {!qrDetected && (
                <div
                  className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.8)]"
                  style={{ top: `${scanProgress}%`, transition: 'top 0.15s linear' }}
                />
              )}
              {/* Detection flash */}
              {qrDetected && (
                <div className="absolute inset-0 bg-green-400/20 animate-pulse" />
              )}
            </div>
            {/* Status indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${cameraReady ? (qrDetected ? 'bg-green-400' : 'bg-cyan-400 animate-pulse') : 'bg-amber-400'}`} />
              <span className="text-xs text-white font-mono">
                {!cameraReady ? 'LOADING' : qrDetected ? 'QR DETECTED!' : 'SCANNING...'}
              </span>
            </div>
            {/* Progress bar */}
            {!qrDetected && cameraReady && (
              <div className="absolute top-4 right-4 w-24 h-1.5 bg-black/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            )}
          </div>
          <button onClick={stopQrCamera} className="absolute bottom-4 left-0 right-0 mx-auto btn-ghost w-fit">
            {t('cancel')}
          </button>
        </div>
      )}

      {/* Input */}
      {!hasResult && !cameraActive && (
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          {mode === 'qr' ? (
            <button onClick={startQrCamera} className="btn-primary w-full flex items-center justify-center gap-2">
              <QrCode size={20} /> {t('scanQrCode')}
            </button>
          ) : (
            <>
              <input
                className="input-field"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'upi' ? t('enterUpiId') : t('enterShopReg')}
              />
              <button
                onClick={() => analyze()}
                disabled={analyzing || !input}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <><Sparkles size={20} className="animate-spin" /> {t('analyzing')}</>
                ) : (
                  <><Search size={20} /> {t('merchantLookup')}</>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* DB Match */}
      {dbMatch && (
        <div className="glass-strong rounded-2xl p-6 animate-scale-in glow-danger">
          <div className="flex items-center gap-4 mb-5">
            <XCircle size={48} className="text-narad-danger" />
            <div>
              <div className={`text-2xl font-bold ${statusColors[dbMatch.status] || 'text-narad-text'}`}>
                {dbMatch.status === 'FRAUDULENT' ? t('fraudulent') : t('suspicious')}
              </div>
              <div className="text-sm text-narad-muted">{t('trustScore')}: {dbMatch.trust_score}/100</div>
            </div>
          </div>
          <div className="space-y-3 mb-5">
            <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
              <span className="text-sm text-narad-muted">{t('merchantDetails')}</span>
              <span className="text-sm text-narad-text font-medium">{dbMatch.shop_name}</span>
            </div>
            {dbMatch.upi_id && (
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">UPI ID</span>
                <span className="text-sm text-narad-text font-mono">{dbMatch.upi_id}</span>
              </div>
            )}
            {dbMatch.registered_city && (
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">{t('merchantDetails')}</span>
                <span className="text-sm text-narad-text">{dbMatch.registered_city}, {dbMatch.registered_state}</span>
              </div>
            )}
            <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
              <span className="text-sm text-narad-muted">{t('reportsCount')}</span>
              <span className="text-sm text-narad-text">{dbMatch.reports_count}</span>
            </div>
            {dbMatch.fraud_type && (
              <div className="p-3 rounded-xl bg-narad-danger/10 border border-narad-danger/20">
                <span className="text-xs text-narad-danger font-medium">{dbMatch.fraud_type}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Result */}
      {aiResult && (
        <div className={`glass-strong rounded-2xl p-6 animate-scale-in ${
          aiResult.verdict === 'FRAUDULENT' ? 'glow-danger' :
          aiResult.verdict === 'VERIFIED' ? 'glow-success' : ''
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-narad-primary" />
            <h3 className="text-sm font-semibold text-narad-text">Gemini AI</h3>
          </div>
          <div className="flex items-center gap-4 mb-5">
            {aiResult.verdict === 'FRAUDULENT' ? (
              <XCircle size={40} className="text-narad-danger" />
            ) : aiResult.verdict === 'VERIFIED' ? (
              <CheckCircle2 size={40} className="text-narad-success" />
            ) : aiResult.verdict === 'SUSPICIOUS' ? (
              <AlertTriangle size={40} className="text-narad-accent" />
            ) : (
              <AlertTriangle size={40} className="text-narad-muted" />
            )}
            <div>
              <div className={`text-xl font-bold ${statusColors[aiResult.verdict] || 'text-narad-text'}`}>
                {aiResult.verdict}
              </div>
              <div className="text-sm text-narad-muted">{t('trustScore')}: {aiResult.trustScore}/100</div>
            </div>
          </div>
          <div className="mb-5">
            <div className="h-2 bg-narad-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  aiResult.trustScore > 70 ? 'bg-narad-success' :
                  aiResult.trustScore > 40 ? 'bg-narad-accent' : 'bg-narad-danger'
                }`}
                style={{ width: `${aiResult.trustScore}%` }}
              />
            </div>
          </div>
          {aiResult.possibleIssues && aiResult.possibleIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-narad-text mb-2">{t('flaggedPhrases')}:</h4>
              <ul className="space-y-1">
                {aiResult.possibleIssues.map((issue, i) => (
                  <li key={i} className="text-xs text-narad-accent flex items-start gap-2">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" /> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {aiResult.recommendation && (
            <div className="p-3 rounded-xl bg-narad-primary/10 border border-narad-primary/20 mb-5">
              <p className="text-xs text-narad-primary">{aiResult.recommendation}</p>
            </div>
          )}
          <button onClick={reset} className="btn-ghost w-full flex items-center justify-center gap-2">
            <RotateCcw size={18} /> {t('newScan')}
          </button>
        </div>
      )}
    </div>
  );
}

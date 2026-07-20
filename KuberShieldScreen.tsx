import { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, ScanLine, CircleCheck as CheckCircle2, Circle as XCircle, RotateCcw, Shield, Download, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import { saveScanResult } from '../../lib/hooks';
import { analyzeCurrencyImage, dataUrlToBase64, type CurrencyResult } from '../../lib/gemini';

export default function KuberShieldScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLineRef = useRef<HTMLDivElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CurrencyResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  async function startCamera() {
    setError('');
    setCameraReady(false);
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
    } catch (e: any) {
      setError(t('cameraPermission'));
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraReady(false);
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function capturePhoto() {
    if (!videoRef.current || !cameraReady) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageSrc(dataUrl);
      stopCamera();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function analyze() {
    if (!imageSrc) return;
    setAnalyzing(true);
    setResult(null);
    setAiError('');
    setScanProgress(0);

    const progressInterval = setInterval(() => {
      setScanProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 200);

    try {
      const { data, mime } = dataUrlToBase64(imageSrc);
      const aiResult = await analyzeCurrencyImage(data, mime);
      setResult(aiResult);
      setScanProgress(100);

      if (user?.session_id) {
        await saveScanResult({
          session_id: user.session_id,
          pillar: 'kuber_shield',
          input_type: 'currency_photo',
          verdict: aiResult.verdict || 'INCONCLUSIVE',
          confidence_score: aiResult.confidence || 0,
          risk_level: aiResult.riskLevel || 'LOW',
          details: aiResult,
          image_url: imageSrc,
        });
      }
    } catch (e: any) {
      setAiError(e.message || 'AI analysis failed. Please try again.');
    }

    clearInterval(progressInterval);
    setAnalyzing(false);
  }

  function reset() {
    setImageSrc(null);
    setResult(null);
    setError('');
    setAiError('');
    setScanProgress(0);
  }

  const isGenuine = result?.verdict === 'GENUINE';
  const isSuspect = result?.verdict === 'SUSPECT';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-amber-400">
          <Shield size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-narad-text">{t('kuberShield')}</h1>
          <p className="text-sm text-narad-muted flex items-center gap-1">
            <Sparkles size={12} className="text-narad-primary" /> {t('featKuberDesc')}
          </p>
        </div>
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border border-narad-danger/30 text-sm text-narad-danger">
          {error}
        </div>
      )}

      {aiError && (
        <div className="glass rounded-xl p-4 border border-narad-danger/30 text-sm text-narad-danger">
          {aiError}
        </div>
      )}

      {/* Camera view */}
      {cameraActive && (
        <div className="relative glass-strong rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full aspect-[3/4] object-cover bg-black"
            playsInline
            muted
            autoPlay
          />
          {/* Scan frame overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Clear scan area */}
            <div className="absolute inset-x-8 top-[15%] bottom-[15%] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-transparent" style={{ boxShadow: '0 0 0 1000px rgba(5,11,24,0.6)' }} />
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />
              {/* Animated scan line */}
              <div
                ref={scanLineRef}
                className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.8)] animate-scan-line"
                style={{ top: '50%' }}
              />
              {/* Grid lines */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-400" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-cyan-400" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-400" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-cyan-400" />
              </div>
            </div>
            {/* Status indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs text-white font-mono">{cameraReady ? 'LIVE' : 'LOADING'}</span>
            </div>
            {/* Hint text */}
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-xs text-cyan-400 font-mono">Align note in frame</span>
            </div>
          </div>
          {/* Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="relative w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 transition-all flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.5)] active:scale-90"
            >
              <Camera size={24} className="text-white" />
              {cameraReady && <div className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping" />}
            </button>
            <button onClick={stopCamera} className="btn-ghost self-center">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* Image preview */}
      {imageSrc && !cameraActive && (
        <div className="relative glass-strong rounded-2xl overflow-hidden">
          <img src={imageSrc} alt="Scanned note" className="w-full max-h-[400px] object-contain" />
          {analyzing && (
            <div className="absolute inset-0 bg-narad-bg/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              {/* Scanning animation over image */}
              <div className="relative w-full max-w-xs">
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <div
                    className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.8)]"
                    style={{ top: `${scanProgress}%`, transition: 'top 0.2s ease-out' }}
                  />
                </div>
              </div>
              <div className="relative">
                <ScanLine size={48} className="text-cyan-400 animate-pulse" />
              </div>
              <p className="text-cyan-400 font-mono text-sm flex items-center gap-2">
                <Sparkles size={14} className="animate-spin" /> {t('analyzing')}
              </p>
              <div className="w-48 h-1.5 bg-narad-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="text-xs text-narad-muted font-mono">{Math.floor(scanProgress)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`glass-strong rounded-2xl p-6 animate-scale-in ${isGenuine ? 'glow-success' : isSuspect ? 'glow-danger' : ''}`}>
          <div className="flex items-center gap-4 mb-5">
            {isGenuine ? (
              <CheckCircle2 size={48} className="text-narad-success" />
            ) : isSuspect ? (
              <XCircle size={48} className="text-narad-danger" />
            ) : (
              <ScanLine size={48} className="text-narad-accent" />
            )}
            <div>
              <div className="text-2xl font-bold text-narad-text">{result.verdict}</div>
              <div className="text-sm text-narad-muted">{t('confidenceScore')}: {result.confidence}%</div>
              {result.denomination && <div className="text-xs text-narad-primary mt-1">{result.denomination}</div>}
            </div>
          </div>

          {result.notes && (
            <p className="text-sm text-narad-muted mb-5 p-3 rounded-xl bg-narad-surface">{result.notes}</p>
          )}

          {result.securityFeatures && result.securityFeatures.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-narad-text mb-3">{t('securityFeatures')}</h3>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {result.securityFeatures.map((check, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-narad-surface border border-narad-border">
                    <div className="flex items-center gap-2">
                      {check.passed ? (
                        <CheckCircle2 size={16} className="text-narad-success" />
                      ) : (
                        <XCircle size={16} className="text-narad-danger" />
                      )}
                      <span className="text-xs text-narad-text">{check.name}</span>
                    </div>
                    <span className={`text-xs font-mono ${check.passed ? 'text-narad-success' : 'text-narad-danger'}`}>
                      {check.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {result.recommendation && (
            <div className="p-3 rounded-xl bg-narad-primary/10 border border-narad-primary/20 mb-5">
              <p className="text-xs text-narad-primary">{result.recommendation}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={reset} className="btn-ghost flex items-center gap-2 flex-1 justify-center">
              <RotateCcw size={18} /> {t('newScan')}
            </button>
            <button className="btn-primary flex items-center gap-2 flex-1 justify-center">
              <Download size={18} /> {t('downloadReport')}
            </button>
          </div>
        </div>
      )}

      {/* Input options */}
      {!imageSrc && !cameraActive && !result && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={startCamera} className="card flex flex-col items-center gap-3 py-8 hover:border-narad-primary/50">
            <div className="p-4 rounded-2xl glass text-narad-primary">
              <Camera size={32} />
            </div>
            <span className="text-sm font-medium text-narad-text">{t('takePhoto')}</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="card flex flex-col items-center gap-3 py-8 hover:border-narad-primary/50">
            <div className="p-4 rounded-2xl glass text-narad-primary">
              <ImageIcon size={32} />
            </div>
            <span className="text-sm font-medium text-narad-text">{t('selectFromGallery')}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>
      )}

      {imageSrc && !analyzing && !result && (
        <button onClick={analyze} className="btn-primary w-full flex items-center justify-center gap-2">
          <Zap size={20} /> {t('analyze')}
        </button>
      )}
    </div>
  );
}

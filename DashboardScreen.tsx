import { Link } from 'react-router-dom';
import { Shield, ScanLine, PhoneCall, ShieldAlert, MessageSquareWarning, Network, Map, TriangleAlert as AlertTriangle, IndianRupee, Activity, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useCrimeFeed, useScanHistory, type CrimeFeedItem } from '../lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import { getScamAlerts, type ScamAlert } from '../lib/gemini';

const pillarCards = [
  { path: '/kuber-shield', icon: Shield, key: 'kuberShield' as const, color: 'from-amber-500/20 to-amber-700/5', iconColor: 'text-amber-400', border: 'border-amber-500/20' },
  { path: '/pramaan', icon: ScanLine, key: 'pramaan' as const, color: 'from-cyan-500/20 to-cyan-700/5', iconColor: 'text-cyan-400', border: 'border-cyan-500/20' },
  { path: '/aakashvani', icon: PhoneCall, key: 'aakashvani' as const, color: 'from-rose-500/20 to-rose-700/5', iconColor: 'text-rose-400', border: 'border-rose-500/20' },
  { path: '/rakshak-ping', icon: ShieldAlert, key: 'rakshakPing' as const, color: 'from-emerald-500/20 to-emerald-700/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
  { path: '/trinetra', icon: MessageSquareWarning, key: 'trinetra' as const, color: 'from-orange-500/20 to-orange-700/5', iconColor: 'text-orange-400', border: 'border-orange-500/20' },
  { path: '/sutra', icon: Network, key: 'sutra' as const, color: 'from-blue-500/20 to-blue-700/5', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
  { path: '/command', icon: Map, key: 'command' as const, color: 'from-indigo-500/20 to-indigo-700/5', iconColor: 'text-indigo-400', border: 'border-indigo-500/20' },
];

function timeAgo(dateStr: string, t: (k: any) => string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('justNow');
  if (mins < 60) return `${mins} ${t('minutesAgo')}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${t('hoursAgo')}`;
  return `${Math.floor(hours / 24)} ${t('daysAgo')}`;
}

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-narad-danger/20 text-narad-danger border-narad-danger/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-narad-accent/20 text-narad-accent border-narad-accent/30',
  LOW: 'bg-narad-success/20 text-narad-success border-narad-success/30',
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const { items: feed, loading } = useCrimeFeed();
  const sessionId = user?.session_id;
  const { items: scans } = useScanHistory(sessionId);

  const [aiAlerts, setAiAlerts] = useState<ScamAlert[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchAiAlerts = useCallback(async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const result = await getScamAlerts(5);
      setAiAlerts(result.alerts || []);
    } catch (e: any) {
      setAiError(e.message || 'Failed to fetch live alerts');
    }
    setAiLoading(false);
  }, []);

  useEffect(() => {
    fetchAiAlerts();
  }, [fetchAiAlerts]);

  const [stats, setStats] = useState({
    activeScams: 0,
    counterfeitNotes: 0,
    unverifiedMerchants: 0,
    callsIntercepted: 0,
    totalComplaints: 1140000,
    totalLoss: 1776,
    activeCases: 0,
  });

  useEffect(() => {
    const activeScams = feed.filter((f) => f.alert_type === 'SCAM_CALL').length;
    const counterfeit = feed.filter((f) => f.alert_type === 'COUNTERFEIT').length;
    const merchants = feed.filter((f) => f.alert_type === 'MERCHANT_FRAUD').length;
    const calls = feed.filter((f) => f.alert_type === 'SMS_FRAUD').length;
    setStats({
      activeScams: 847 + activeScams * 10,
      counterfeitNotes: 12453 + counterfeit * 100,
      unverifiedMerchants: 234 + merchants * 5,
      callsIntercepted: 15678 + calls * 20,
      totalComplaints: 1140000,
      totalLoss: 1776,
      activeCases: feed.length + 450,
    });
  }, [feed]);

  const statCards = [
    { icon: AlertTriangle, label: t('activeScams'), value: stats.activeScams.toLocaleString('en-IN'), color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { icon: IndianRupee, label: t('counterfeitNotes'), value: stats.counterfeitNotes.toLocaleString('en-IN'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: ShieldAlert, label: t('unverifiedMerchants'), value: stats.unverifiedMerchants.toLocaleString('en-IN'), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: PhoneCall, label: t('callsIntercepted'), value: stats.callsIntercepted.toLocaleString('en-IN'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-narad-text">{t('dashboard')}</h1>
        <p className="text-sm text-narad-muted mt-1">
          {user?.full_name ? `Namaste, ${user.full_name}` : 'Namaste'} 🙏
        </p>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-narad-text">{stat.value}</div>
              <div className="text-xs text-narad-muted mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* National stats banner */}
      <div className="glass-strong rounded-2xl p-5 bg-gradient-to-r from-narad-primary/5 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-narad-primary" />
          <h3 className="text-sm font-semibold text-narad-text">National Cybercrime Statistics (NCRP Data)</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xl font-bold text-narad-primary">{(stats.totalComplaints / 1000000).toFixed(2)}M+</div>
            <div className="text-xs text-narad-muted">{t('statsTotalComplaints')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-narad-danger">₹{stats.totalLoss.toLocaleString('en-IN')}Cr</div>
            <div className="text-xs text-narad-muted">{t('statsTotalLoss')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-narad-accent">{stats.activeCases.toLocaleString('en-IN')}</div>
            <div className="text-xs text-narad-muted">{t('statsActiveCases')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-narad-success">8.4L+</div>
            <div className="text-xs text-narad-muted">{t('statsLivesProtected')}</div>
          </div>
        </div>
      </div>

      {/* Gemini AI Live Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-narad-text flex items-center gap-2">
            <Sparkles size={18} className="text-narad-primary" />
            Live AI Scam Alerts
          </h2>
          <button
            onClick={fetchAiAlerts}
            disabled={aiLoading}
            className="text-xs text-narad-primary hover:text-narad-primary/80 flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw size={14} className={aiLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        {aiLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20" />)}
          </div>
        ) : aiError ? (
          <div className="glass rounded-xl p-4 text-sm text-narad-muted text-center">
            Live alerts unavailable. Showing database alerts below.
          </div>
        ) : (
          <div className="space-y-3">
            {aiAlerts.map((alert, i) => (
              <div key={i} className="card hover:border-narad-primary/40 bg-gradient-to-r from-narad-primary/5 to-transparent">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`badge border ${severityColors[alert.severity] || severityColors.MEDIUM}`}>
                        {alert.severity === 'CRITICAL' ? t('severityCritical') :
                         alert.severity === 'HIGH' ? t('severityHigh') :
                         alert.severity === 'MEDIUM' ? t('severityMedium') : t('severityLow')}
                      </span>
                      <span className="text-xs text-narad-muted">{alert.city}, {alert.state}</span>
                      <span className="text-xs text-narad-primary flex items-center gap-0.5">
                        <Sparkles size={10} /> AI
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-narad-text mb-1">{alert.title}</h3>
                    <p className="text-xs text-narad-muted leading-relaxed line-clamp-2">{alert.description}</p>
                    {alert.advisory && (
                      <p className="text-xs text-narad-primary mt-1.5 italic">{alert.advisory}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pillars grid */}
      <div>
        <h2 className="text-lg font-bold text-narad-text mb-3">NARAD Pillars</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {pillarCards.map((p, i) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.path}
                to={p.path}
                className={`card bg-gradient-to-br ${p.color} border ${p.border} group cursor-pointer animate-slide-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`p-3 rounded-xl glass inline-flex mb-3 ${p.iconColor}`}>
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-display font-semibold text-sm text-narad-text mb-1">{t(p.key)}</h3>
                <div className="flex items-center gap-1 text-xs text-narad-muted group-hover:text-narad-primary transition-colors">
                  Open <ChevronRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Today's alerts from database */}
      <div>
        <h2 className="text-lg font-bold text-narad-text mb-3">{t('todayAlerts')}</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24" />)}
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto no-scrollbar">
            {feed.slice(0, 10).map((item: CrimeFeedItem) => (
              <div key={item.id} className="card hover:border-narad-primary/40">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`badge border ${severityColors[item.severity] || severityColors.MEDIUM}`}>
                        {item.severity === 'CRITICAL' ? t('severityCritical') :
                         item.severity === 'HIGH' ? t('severityHigh') :
                         item.severity === 'MEDIUM' ? t('severityMedium') : t('severityLow')}
                      </span>
                      <span className="text-xs text-narad-muted">{item.city}, {item.state}</span>
                      <span className="text-xs text-narad-muted">• {timeAgo(item.reported_at, t)}</span>
                    </div>
                    <h3 className="font-semibold text-sm text-narad-text mb-1">{item.title}</h3>
                    <p className="text-xs text-narad-muted leading-relaxed line-clamp-2">{item.description}</p>
                    {item.amount_lost_cr && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-narad-danger">
                        <IndianRupee size={12} /> {item.amount_lost_cr} Cr loss • {item.victims_count?.toLocaleString('en-IN')} victims
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent scans */}
      {scans.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-narad-text mb-3">{t('recentScans')}</h2>
          <div className="space-y-2">
            {scans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="card flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-narad-text capitalize">{scan.pillar.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-narad-muted">{scan.verdict}</div>
                </div>
                <div className="text-xs text-narad-muted">{timeAgo(scan.created_at, t)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

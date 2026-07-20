import { useState, useMemo } from 'react';
import { Map, TriangleAlert as AlertTriangle, IndianRupee, TrendingDown, Shield, Download } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useDistrictsHeatmap, type DistrictHeatmap } from '../../lib/hooks';

const priorityColors: Record<string, string> = {
  CRITICAL: '#FF3B5C',
  HIGH: '#FFB800',
  MEDIUM: '#00E5FF',
  LOW: '#00E676',
};

export default function CommandScreen() {
  const { t } = useLang();
  const { items: districts, loading } = useDistrictsHeatmap();
  const [selected, setSelected] = useState<DistrictHeatmap | null>(null);

  const totalAlerts = useMemo(() => districts.reduce((s, d) => s + d.alert_count, 0), [districts]);
  const totalLoss = useMemo(() => districts.reduce((s, d) => s + d.total_loss_cr, 0), [districts]);
  const totalCounterfeit = useMemo(() => districts.reduce((s, d) => s + d.counterfeit_count, 0), [districts]);
  const totalMerchantFlags = useMemo(() => districts.reduce((s, d) => s + d.merchant_flags, 0), [districts]);

  // India map bounds (simplified bounding box)
  const indiaBounds = { minLng: 68, maxLng: 97, minLat: 8, maxLat: 37 };
  const mapW = 500, mapH = 500;

  function project(lat: number, lng: number) {
    const x = ((lng - indiaBounds.minLng) / (indiaBounds.maxLng - indiaBounds.minLng)) * mapW;
    const y = mapH - ((lat - indiaBounds.minLat) / (indiaBounds.maxLat - indiaBounds.minLat)) * mapH;
    return { x, y };
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl glass text-indigo-400"><Map size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-narad-text">{t('commandCenter')}</h1>
            <p className="text-sm text-narad-muted">{t('featCommandDesc')}</p>
          </div>
        </div>
        <div className="skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-indigo-400">
          <Map size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-narad-text">{t('commandCenter')}</h1>
          <p className="text-sm text-narad-muted">{t('featCommandDesc')}</p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm">
          <Download size={16} /> {t('exportEvidence')}
        </button>
      </div>

      {/* Officer badge */}
      <div className="glass-strong rounded-xl p-3 flex items-center gap-3 border border-indigo-500/20">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <Shield size={18} className="text-indigo-400" />
        </div>
        <div>
          <div className="text-sm font-semibold text-narad-text">Officer Mode Active</div>
          <div className="text-xs text-narad-muted">Real-time district intelligence feed</div>
        </div>
      </div>

      {/* National stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card">
          <AlertTriangle size={18} className="text-rose-400 mb-2" />
          <div className="text-xl font-bold text-narad-text">{totalAlerts.toLocaleString('en-IN')}</div>
          <div className="text-xs text-narad-muted">{t('alertCount')}</div>
        </div>
        <div className="card">
          <IndianRupee size={18} className="text-amber-400 mb-2" />
          <div className="text-xl font-bold text-narad-text">{totalLoss.toFixed(1)}Cr</div>
          <div className="text-xs text-narad-muted">{t('totalLoss')}</div>
        </div>
        <div className="card">
          <TrendingDown size={18} className="text-cyan-400 mb-2" />
          <div className="text-xl font-bold text-narad-text">{totalCounterfeit.toLocaleString('en-IN')}</div>
          <div className="text-xs text-narad-muted">Counterfeit</div>
        </div>
        <div className="card">
          <Shield size={18} className="text-emerald-400 mb-2" />
          <div className="text-xl font-bold text-narad-text">{totalMerchantFlags}</div>
          <div className="text-xs text-narad-muted">Merchant Flags</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div>
          <h2 className="text-lg font-bold text-narad-text mb-3">{t('districtHeatmap')}</h2>
          <div className="glass-strong rounded-2xl p-4">
            <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full">
              {/* India outline (simplified) */}
              <path
                d="M80,120 L120,80 L200,70 L280,60 L350,90 L400,130 L410,200 L380,280 L340,350 L280,400 L220,420 L160,380 L100,300 L70,200 Z"
                fill="rgba(0, 229, 255, 0.03)"
                stroke="rgba(0, 229, 255, 0.15)"
                strokeWidth="1"
                strokeDasharray="4 2"
              />

              {/* Heatmap points */}
              {districts.map((d) => {
                const { x, y } = project(d.lat, d.lng);
                const color = priorityColors[d.priority_level] || '#6B7B95';
                const radius = Math.max(8, Math.min(30, d.alert_count / 30));
                return (
                  <g key={d.id} onClick={() => setSelected(d)} className="cursor-pointer">
                    <circle cx={x} cy={y} r={radius} fill={color} fillOpacity={0.15} />
                    <circle cx={x} cy={y} r={radius * 0.5} fill={color} fillOpacity={0.5} />
                    <circle cx={x} cy={y} r={3} fill={color} />
                    {d.priority_level === 'CRITICAL' && (
                      <circle cx={x} cy={y} r={radius} fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                        <animate attributeName="r" from="8" to={radius} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-3 mt-3 justify-center">
              {Object.entries(priorityColors).map(([level, color]) => (
                <div key={level} className="flex items-center gap-1.5 text-xs text-narad-muted">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  {level}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Patrol priority list */}
        <div>
          <h2 className="text-lg font-bold text-narad-text mb-3">{t('patrolPriority')}</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
            {[...districts]
              .sort((a, b) => b.alert_count - a.alert_count)
              .map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className={`card w-full text-left flex items-center gap-3 hover:border-narad-primary/40 ${
                    selected?.id === d.id ? 'border-narad-primary/50' : ''
                  }`}
                >
                  <div className="text-lg font-bold text-narad-muted w-6">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-narad-text">{d.district}</div>
                    <div className="text-xs text-narad-muted">{d.state}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-narad-text">{d.alert_count}</div>
                    <div className="text-xs text-narad-muted">alerts</div>
                  </div>
                  <div className="w-2 h-10 rounded-full" style={{ background: priorityColors[d.priority_level] }} />
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Selected district detail */}
      {selected && (
        <div className="glass-strong rounded-2xl p-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-narad-text">{selected.district}, {selected.state}</h2>
            <span
              className="badge px-3 py-1"
              style={{ background: priorityColors[selected.priority_level] + '20', color: priorityColors[selected.priority_level] }}
            >
              {selected.priority_level}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-narad-surface">
              <div className="text-lg font-bold text-narad-text">{selected.alert_count}</div>
              <div className="text-xs text-narad-muted">{t('alertCount')}</div>
            </div>
            <div className="p-3 rounded-xl bg-narad-surface">
              <div className="text-lg font-bold text-narad-text">{selected.counterfeit_count}</div>
              <div className="text-xs text-narad-muted">Counterfeit</div>
            </div>
            <div className="p-3 rounded-xl bg-narad-surface">
              <div className="text-lg font-bold text-narad-text">{selected.merchant_flags}</div>
              <div className="text-xs text-narad-muted">Merchant Flags</div>
            </div>
            <div className="p-3 rounded-xl bg-narad-surface">
              <div className="text-lg font-bold text-narad-danger">₹{selected.total_loss_cr}Cr</div>
              <div className="text-xs text-narad-muted">{t('totalLoss')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

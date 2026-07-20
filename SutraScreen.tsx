import { useState, useMemo } from 'react';
import { Network, Download, X, Phone, User, MapPin, CreditCard } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { useFraudGraph, type FraudNode } from '../../lib/hooks';

const nodeColors: Record<string, string> = {
  PHONE: '#FF3B5C',
  INDIVIDUAL: '#FFB800',
  UPI: '#00E5FF',
  LOCATION: '#00E676',
};

const nodeIcons: Record<string, any> = {
  PHONE: Phone,
  INDIVIDUAL: User,
  UPI: CreditCard,
  LOCATION: MapPin,
};

export default function SutraScreen() {
  const { t } = useLang();
  const { nodes, edges, loading } = useFraudGraph();
  const [selectedNode, setSelectedNode] = useState<FraudNode | null>(null);

  // Calculate positions in a radial layout
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    const cx = 250, cy = 250;
    const byType: Record<string, FraudNode[]> = {};
    nodes.forEach((n) => {
      if (!byType[n.node_type]) byType[n.node_type] = [];
      byType[n.node_type].push(n);
    });

    const types = Object.keys(byType);
    const result: { node: FraudNode; x: number; y: number }[] = [];

    types.forEach((type, ti) => {
      const groupNodes = byType[type];
      const baseAngle = (ti / types.length) * 2 * Math.PI - Math.PI / 2;
      groupNodes.forEach((node, ni) => {
        const angleOffset = (ni - groupNodes.length / 2) * 0.3;
        const angle = baseAngle + angleOffset;
        const radius = 120 + (ni % 2) * 60;
        result.push({
          node,
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
        });
      });
    });

    return result;
  }, [nodes]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, { node: FraudNode; x: number; y: number }>();
    positionedNodes.forEach((p) => m.set(p.node.id, p));
    return m;
  }, [positionedNodes]);

  const connectedEdges = useMemo(() => {
    return edges.map((e) => {
      const s = nodeMap.get(e.source_node_id);
      const t = nodeMap.get(e.target_node_id);
      return { edge: e, sx: s?.x || 0, sy: s?.y || 0, tx: t?.x || 0, ty: t?.y || 0 };
    }).filter((e) => e.sx && e.tx);
  }, [edges, nodeMap]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl glass text-blue-400"><Network size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-narad-text">{t('fraudNetwork')}</h1>
            <p className="text-sm text-narad-muted">{t('featSutraDesc')}</p>
          </div>
        </div>
        <div className="skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl glass text-blue-400">
          <Network size={28} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-narad-text">{t('fraudNetwork')}</h1>
          <p className="text-sm text-narad-muted">{t('featSutraDesc')}</p>
        </div>
        <button className="btn-ghost flex items-center gap-2 text-sm">
          <Download size={16} /> {t('exportEvidence')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-bold text-narad-primary">{nodes.length}</div>
          <div className="text-xs text-narad-muted">{t('networkNodes')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-narad-accent">{edges.length}</div>
          <div className="text-xs text-narad-muted">{t('networkEdges')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-narad-danger">
            {nodes.filter((n) => n.risk_score >= 90).length}
          </div>
          <div className="text-xs text-narad-muted">Critical Nodes</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(nodeColors).map(([type, color]) => {
          const Icon = nodeIcons[type];
          return (
            <div key={type} className="flex items-center gap-2 text-xs text-narad-muted">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <Icon size={14} />
              {type}
            </div>
          );
        })}
      </div>

      {/* Graph */}
      <div className="glass-strong rounded-2xl p-4 overflow-x-auto">
        <svg viewBox="0 0 500 500" className="w-full max-w-[500px] mx-auto" style={{ minHeight: '400px' }}>
          {/* Edges */}
          {connectedEdges.map((e, i) => (
            <line
              key={i}
              x1={e.sx} y1={e.sy} x2={e.tx} y2={e.ty}
              stroke="rgba(0, 229, 255, 0.15)"
              strokeWidth={Math.max(1, e.edge.strength / 3)}
            />
          ))}

          {/* Nodes */}
          {positionedNodes.map((p) => {
            const color = nodeColors[p.node.node_type] || '#6B7B95';
            const isSelected = selectedNode?.id === p.node.id;
            return (
              <g
                key={p.node.id}
                onClick={() => setSelectedNode(p.node)}
                className="cursor-pointer"
              >
                <circle
                  cx={p.x} cy={p.y}
                  r={isSelected ? 18 : 12 + (p.node.risk_score / 20)}
                  fill={color}
                  fillOpacity={isSelected ? 0.9 : 0.6}
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 1}
                  className="transition-all"
                />
                {p.node.risk_score >= 90 && (
                  <circle cx={p.x} cy={p.y} r={20} fill="none" stroke={color} strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" from="12" to="24" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                <text
                  x={p.x} y={p.y + 28}
                  textAnchor="middle"
                  className="fill-narad-muted text-[8px] font-medium"
                >
                  {p.node.label.length > 20 ? p.node.label.slice(0, 18) + '…' : p.node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node details modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedNode(null)} />
          <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-narad-text">{t('nodeDetails')}</h2>
              <button onClick={() => setSelectedNode(null)} className="text-narad-muted hover:text-narad-text">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-narad-surface">
                <div className="w-4 h-4 rounded-full" style={{ background: nodeColors[selectedNode.node_type] }} />
                <span className="text-sm text-narad-text font-medium">{selectedNode.label}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">Type</span>
                <span className="text-sm text-narad-text">{selectedNode.node_type}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">Identifier</span>
                <span className="text-sm text-narad-text font-mono">{selectedNode.identifier}</span>
              </div>
              {selectedNode.city && (
                <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                  <span className="text-sm text-narad-muted">Location</span>
                  <span className="text-sm text-narad-text">{selectedNode.city}, {selectedNode.state}</span>
                </div>
              )}
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">Risk Score</span>
                <span className={`text-sm font-bold ${selectedNode.risk_score >= 90 ? 'text-narad-danger' : 'text-narad-accent'}`}>
                  {selectedNode.risk_score}/100
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">Connections</span>
                <span className="text-sm text-narad-text">{selectedNode.connections_count}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-narad-surface">
                <span className="text-sm text-narad-muted">Source Pillar</span>
                <span className="text-sm text-narad-text">{selectedNode.pillar_source}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

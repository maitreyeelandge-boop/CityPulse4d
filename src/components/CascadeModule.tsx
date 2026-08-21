import { useState } from 'react';
import { GitBranch, AlertTriangle, Shield, IndianRupee } from 'lucide-react';
import type { Asset } from '@/types';
import { ASSETS, CASCADE_LINKS, assetById } from '@/data';
import { SectionTitle, HealthBadge } from '@/components/ui';
import { healthState, stateColor, formatINR } from '@/lib';

export function CascadeModule({ onSelectAsset }: { onSelectAsset: (a: Asset) => void }) {
  const [hoverLink, setHoverLink] = useState<number | null>(null);

  // Build node positions in a force-layout-ish arrangement
  const nodes = ASSETS.map((a) => ({ ...a }));
  const links = CASCADE_LINKS.map((l, i) => ({ ...l, index: i }));

  // Total downstream cost if top risks ignored
  const topPrevention = CASCADE_LINKS
    .filter((l) => (assetById(l.fromId)?.healthScore ?? 100) < 40)
    .reduce((s, l) => s + l.costIfIgnored, 0);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={GitBranch}
        title="Failure Cascade & Risk Propagation Predictor"
        desc="Causal graph mapping interconnected infrastructure failure consequences"
      />

      {/* Cascade warning banner */}
      <div className="glass-strong relative overflow-hidden border-warn-500/30 p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(255,159,67,0.1),transparent_60%)]" />
        <div className="relative flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 animate-flicker text-warn-400" />
          <div>
            <p className="font-semibold text-warn-400">Preventive Alert</p>
            <p className="mt-1 text-sm text-slate-200">
              Repairing <span className="font-semibold text-white">Drain D-102</span> today (Est. Cost:{' '}
              {formatINR(55000)}) prevents downstream multi-asset repairs estimated at{' '}
              <span className="font-semibold text-alarm-400">{formatINR(topPrevention)}</span>.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Cascade prevention ROI: {(topPrevention / 55000).toFixed(1)}x cost avoidance
            </p>
          </div>
        </div>
      </div>

      {/* Cascade graph */}
      <div className="glass-strong relative overflow-hidden">
        <div className="aspect-[16/9] w-full bg-grid-cyber bg-grid bg-navy-950">
          <svg className="h-full w-full" viewBox="0 0 100 56.25" preserveAspectRatio="xMidYMid meet">
            {/* Links */}
            {links.map((link) => {
              const from = nodes.find((n) => n.id === link.fromId);
              const to = nodes.find((n) => n.id === link.toId);
              if (!from || !to) return null;
              const fx = from.location.x;
              const fy = from.location.y * 0.5625;
              const tx = to.location.x;
              const ty = to.location.y * 0.5625;
              const midX = (fx + tx) / 2;
              const midY = (fy + ty) / 2 - 4;
              const active = hoverLink === link.index;
              return (
                <g key={link.index}>
                  <path
                    d={`M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`}
                    fill="none"
                    stroke={active ? '#ff5252' : '#a55eea'}
                    strokeWidth={active ? 0.6 : 0.3}
                    opacity={active ? 0.9 : 0.4}
                    strokeDasharray="1.5 1"
                    className={active ? 'flow-line' : ''}
                    onMouseEnter={() => setHoverLink(link.index)}
                    onMouseLeave={() => setHoverLink(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  {active && (
                    <>
                      <rect
                        x={midX - 14}
                        y={midY - 3}
                        width="28"
                        height="6"
                        rx="1"
                        fill="#0b0f19"
                        stroke="#ff5252"
                        strokeWidth="0.2"
                      />
                      <text
                        x={midX}
                        y={midY + 1}
                        textAnchor="middle"
                        fontSize="2"
                        fill="#ff5252"
                      >
                        {formatINR(link.costIfIgnored)}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const state = healthState(n.healthScore);
              const color = stateColor[state];
              const isInvolved = hoverLink !== null && (
                links[hoverLink].fromId === n.id || links[hoverLink].toId === n.id
              );
              return (
                <g
                  key={n.id}
                  onClick={() => onSelectAsset(n)}
                  style={{ cursor: 'pointer' }}
                  opacity={hoverLink === null || isInvolved ? 1 : 0.3}
                >
                  {(state === 'critical') && (
                    <circle cx={n.location.x} cy={n.location.y * 0.5625} r="3" fill={color} opacity="0.2">
                      <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={n.location.x}
                    cy={n.location.y * 0.5625}
                    r="1.8"
                    fill={`${color}30`}
                    stroke={color}
                    strokeWidth="0.3"
                  />
                  <text
                    x={n.location.x}
                    y={n.location.y * 0.5625 + 4}
                    textAnchor="middle"
                    fontSize="1.8"
                    fill={color}
                    fontWeight="600"
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Cascade chain detail list */}
      <div className="glass p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
          <Shield className="h-4 w-4 text-alarm-400" /> Cascade Chains &amp; Cost Impact
        </h3>
        <div className="space-y-2">
          {links.map((link, i) => {
            const from = assetById(link.fromId);
            const to = assetById(link.toId);
            if (!from || !to) return null;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-navy-800/40 p-3 transition-all hover:border-quantum-400/30"
                onMouseEnter={() => setHoverLink(i)}
                onMouseLeave={() => setHoverLink(null)}
              >
                <div className="flex items-center gap-2">
                  <HealthBadge state={healthState(from.healthScore)} size="sm" />
                  <span className="text-sm font-medium text-white">{from.name}</span>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <span className="font-mono text-xs text-quantum-400">──▶</span>
                  <span className="flex-1 text-xs text-slate-400">{link.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{to.name}</span>
                  <span className="chip border border-alarm-500/30 bg-alarm-500/10 text-alarm-400">
                    <IndianRupee className="h-3 w-3" />
                    {formatINR(link.costIfIgnored)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

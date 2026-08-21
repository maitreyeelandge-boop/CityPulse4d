import { useState } from 'react';
import {
  Route,
  Car,
  Zap,
  AlertOctagon,
  Spline,
  TrendingDown,
} from 'lucide-react';
import type { Asset } from '@/types';
import { ASSETS } from '@/data';
import { SectionTitle, HealthBadge } from '@/components/ui';
import { healthState, formatINR } from '@/lib';

export function RQIModule({ onSelectAsset }: { onSelectAsset: (a: Asset) => void }) {
  const roads = ASSETS.filter((a) => a.category === 'road');
  const poles = ASSETS.filter((a) => a.category === 'pole');
  const [selectedRoad, setSelectedRoad] = useState<string>(roads[0]?.id ?? '');
  const road = roads.find((r) => r.id === selectedRoad) ?? roads[0];

  const totalNearMiss = poles.reduce((s, p) => s + (p.nearMissEvents ?? 0), 0);
  const totalStrikes = poles.reduce((s, p) => s + (p.poleStrikes ?? 0), 0);

  const rqiColor = (score: number) =>
    score >= 7 ? '#2ecc71' : score >= 5 ? '#ff9f43' : score >= 3 ? '#ff7575' : '#ff5252';

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={Route}
        title="Road Quality Index & Near-Miss Safety Engine"
        desc="10-meter micro-segment RQI heatmap + smart-pole impact & near-miss analytics"
      />

      {/* Near-miss / pole strike summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={AlertOctagon} label="Total Near-Miss Events" value={totalNearMiss} accent="alarm" />
        <SummaryCard icon={Zap} label="Pole-Strike Alerts" value={totalStrikes} accent="warn" />
        <SummaryCard
          icon={Spline}
          label="Avg RQI (City)"
          value={Math.round(
            roads.reduce((s, r) => s + (r.rqiSegments?.reduce((rs, seg) => rs + seg.score, 0) ?? 0) / (r.rqiSegments?.length ?? 1), 0) /
              roads.length
          )}
          accent="cyber"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Critical Segments"
          value={roads.reduce(
            (s, r) => s + (r.rqiSegments?.filter((seg) => seg.score <= 3).length ?? 0),
            0
          )}
          accent="alarm"
        />
      </div>

      {/* Road selector + 10m segment heatmap */}
      <div className="glass p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold text-white">
            10-Meter Micro-Segment Road Mapper
          </h3>
          <div className="flex gap-1.5">
            {roads.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoad(r.id)}
                className={`tab-pill ${
                  selectedRoad === r.id
                    ? 'bg-cyber-400/15 text-cyber-300 border border-cyber-400/30'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {r.id}
              </button>
            ))}
          </div>
        </div>

        {road && (
          <>
            <div className="mb-2 flex items-center gap-3 text-sm">
              <span className="font-semibold text-white">{road.name}</span>
              <span className="text-slate-400">{road.ward}</span>
              <HealthBadge state={healthState(road.healthScore)} size="sm" />
            </div>

            {/* Segment bar */}
            <div className="relative">
              <div className="flex h-12 overflow-hidden rounded-lg border border-white/10">
                {road.rqiSegments?.map((seg, i) => (
                  <div
                    key={i}
                    className="group relative flex flex-1 cursor-default items-center justify-center border-r border-navy-950/50 last:border-0 transition-all hover:brightness-125"
                    style={{ background: rqiColor(seg.score) }}
                    title={`${seg.start}-${seg.end}m • RQI ${seg.score}${seg.defect ? ` • ${seg.defect}` : ''}`}
                  >
                    <span className="font-mono text-xs font-bold text-navy-950">{seg.score}</span>
                    {seg.defect && (
                      <span className="absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy-900 px-2 py-1 text-[10px] text-white group-hover:block">
                        {seg.defect}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Distance markers */}
              <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                {road.rqiSegments?.map((seg) => (
                  <span key={seg.start}>{seg.start}m</span>
                ))}
                <span>{road.rqiSegments?.[road.rqiSegments.length - 1]?.end}m</span>
              </div>
            </div>

            {/* Segment detail table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-2 text-left">Segment</th>
                    <th className="py-2 text-left">RQI</th>
                    <th className="py-2 text-left">Condition</th>
                    <th className="py-2 text-left">Defect</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {road.rqiSegments?.map((seg) => (
                    <tr key={seg.start} className="border-b border-white/5">
                      <td className="py-2 font-mono text-slate-300">
                        {seg.start}–{seg.end}m
                      </td>
                      <td className="py-2">
                        <span
                          className="font-mono font-bold"
                          style={{ color: rqiColor(seg.score) }}
                        >
                          {seg.score}/10
                        </span>
                      </td>
                      <td className="py-2 text-slate-300">
                        {seg.score >= 7 ? 'Good' : seg.score >= 5 ? 'Fair' : seg.score >= 3 ? 'Poor' : 'Critical'}
                      </td>
                      <td className="py-2 text-xs text-warn-400">{seg.defect ?? '—'}</td>
                      <td className="py-2 text-right">
                        {seg.score <= 4 ? (
                          <button
                            onClick={() => onSelectAsset(road)}
                            className="text-xs text-cyber-400 hover:underline"
                          >
                            Inspect →
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">Monitor</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Smart Pole Near-Miss Analytics */}
      <div className="glass p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
          <Car className="h-4 w-4 text-cyber-400" /> Smart Pole Impact &amp; Near-Miss Analytics
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {poles.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-white/5 bg-navy-800/40 p-4 transition-all hover:border-cyber-400/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.ward}</div>
                </div>
                <HealthBadge state={healthState(p.healthScore)} size="sm" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-navy-700/50 p-2">
                  <div className="font-mono text-xl font-bold text-alarm-400">
                    {p.poleStrikes ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Pole Strikes</div>
                </div>
                <div className="rounded-lg bg-navy-700/50 p-2">
                  <div className="font-mono text-xl font-bold text-warn-400">
                    {p.nearMissEvents ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Near-Miss</div>
                </div>
                <div className="rounded-lg bg-navy-700/50 p-2">
                  <div className="font-mono text-xl font-bold text-cyber-400">
                    {p.telemetry.find((t) => t.label === 'Illumination')?.value ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">Light</div>
                </div>
              </div>
              {(p.poleStrikes ?? 0) > 0 && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-alarm-500/10 px-2 py-1 text-xs text-alarm-400">
                  <AlertOctagon className="h-3 w-3 animate-flicker" />
                  Pole-strike alert: instant emergency dispatch triggered.
                </div>
              )}
              <button
                onClick={() => onSelectAsset(p)}
                className="mt-3 w-full rounded-lg bg-white/5 py-1.5 text-xs text-cyber-400 transition-colors hover:bg-white/10"
              >
                View Deep-Dive →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Route;
  label: string;
  value: number | string;
  accent: 'cyber' | 'warn' | 'alarm' | 'finance';
}) {
  const colors = {
    cyber: 'text-cyber-400',
    warn: 'text-warn-400',
    alarm: 'text-alarm-500',
    finance: 'text-finance-400',
  };
  return (
    <div className="metric-card">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${colors[accent]}`} />
        {label}
      </div>
      <div className={`mt-1.5 font-mono text-2xl font-bold ${colors[accent]}`}>{value}</div>
    </div>
  );
}

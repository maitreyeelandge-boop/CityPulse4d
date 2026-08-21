import { useMemo, useState } from 'react';
import { Calendar, Layers, Maximize2, Minus, Plus, Crosshair } from 'lucide-react';
import type { Asset, ModuleKey } from '@/types';
import { ASSETS, CASCADE_LINKS } from '@/data';
import {
  categoryMeta,
  healthStateForDay,
  stateColor,
  projectHealth,
} from '@/lib';

const TIME_MARKERS = [
  { day: 0, label: 'Today' },
  { day: 7, label: '+7 Days' },
  { day: 30, label: 'Pre-Monsoon (+30d)' },
  { day: 90, label: '+90 Days' },
];

const LAYER_LABELS: Record<string, string> = {
  pipe: 'Water Pipes',
  pole: 'Smart Poles',
  bridge: 'Bridges & Barriers',
  road: 'RQI Heatmap',
  drain: 'Drainage & Flood',
};

export function CityDigitalTwin({
  dayOffset,
  setDayOffset,
  onSelectAsset,
  selectedId,
  goToModule,
}: {
  dayOffset: number;
  setDayOffset: (d: number) => void;
  onSelectAsset: (a: Asset) => void;
  selectedId: string | null;
  goToModule: (m: ModuleKey) => void;
}) {
  const [layers, setLayers] = useState<Record<string, boolean>>({
    pipe: true,
    pole: true,
    bridge: true,
    road: true,
    drain: true,
  });
  const [hoverId, setHoverId] = useState<string | null>(null);

  const visibleAssets = ASSETS.filter((a) => layers[a.category]);
  const hoverAsset = hoverId ? ASSETS.find((a) => a.id === hoverId) : null;

  const timeLabel = useMemo(() => {
    const closest = TIME_MARKERS.reduce((p, c) =>
      Math.abs(c.day - dayOffset) < Math.abs(p.day - dayOffset) ? c : p
    );
    return closest.label;
  }, [dayOffset]);

  return (
    <div className="glass-strong relative overflow-hidden">
      {/* Layer toggles */}
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
          <Layers className="h-3 w-3" /> Map Layers
        </div>
        {(Object.keys(LAYER_LABELS) as string[]).map((key) => (
          <button
            key={key}
            onClick={() => setLayers((s) => ({ ...s, [key]: !s[key] }))}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-[11px] transition-all ${
              layers[key]
                ? 'border-cyber-400/30 bg-cyber-400/10 text-cyber-300'
                : 'border-white/5 bg-navy-800/50 text-slate-500'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: categoryMeta[key as Asset['category']].color }}
            />
            {LAYER_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Time / season indicator */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-lg border border-cyber-400/20 bg-navy-900/80 px-3 py-1.5 backdrop-blur-md">
        <Calendar className="h-3.5 w-3.5 text-cyber-400" />
        <span className="text-xs font-medium text-white">{timeLabel}</span>
      </div>

      {/* Hover tooltip */}
      {hoverAsset && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 rounded-lg border border-cyber-400/30 bg-navy-900/95 px-3 py-2 text-xs backdrop-blur-md"
          style={{
            left: `${hoverAsset.location.x}%`,
            top: `${hoverAsset.location.y - 8}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-white">{hoverAsset.name}</div>
          <div className="text-slate-400">{hoverAsset.ward}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-slate-500">Health:</span>
            <span
              className="font-mono font-semibold"
              style={{ color: stateColor[healthStateForDay(hoverAsset, dayOffset)] }}
            >
              {projectHealth(hoverAsset, dayOffset)}/100
            </span>
          </div>
        </div>
      )}

      {/* The map canvas */}
      <div className="relative aspect-[16/10] w-full bg-grid-cyber bg-grid bg-navy-950">
        {/* Subtle radial vignette + river */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_45%,rgba(0,242,254,0.06),transparent_60%)]" />
        <RiverAndTerrain dayOffset={dayOffset} />

        {/* Cascade links */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 62.5" preserveAspectRatio="none">
          {CASCADE_LINKS.filter(
            (l) => layers[ASSETS.find((a) => a.id === l.fromId)?.category ?? 'road'] &&
                   layers[ASSETS.find((a) => a.id === l.toId)?.category ?? 'road']
          ).map((link, i) => {
            const from = ASSETS.find((a) => a.id === link.fromId)!;
            const to = ASSETS.find((a) => a.id === link.toId)!;
            const active = hoverId === link.fromId || hoverId === link.toId || selectedId === link.fromId;
            return (
              <line
                key={i}
                x1={from.location.x}
                y1={from.location.y * 0.625}
                x2={to.location.x}
                y2={to.location.y * 0.625}
                stroke={active ? '#ff5252' : '#a55eea'}
                strokeWidth={active ? 0.5 : 0.25}
                strokeDasharray="1.5 1.5"
                opacity={active ? 0.9 : 0.35}
                className={active ? 'flow-line' : ''}
              />
            );
          })}
        </svg>

        {/* Road heatmap segments (drawn as colored paths) */}
        {layers.road &&
          ASSETS.filter((a) => a.category === 'road').map((road) => (
            <RoadHeatmap key={road.id} road={road} dayOffset={dayOffset} />
          ))}

        {/* Asset nodes */}
        {visibleAssets.map((asset) => (
          <AssetNode
            key={asset.id}
            asset={asset}
            dayOffset={dayOffset}
            selected={selectedId === asset.id}
            onSelect={() => onSelectAsset(asset)}
            onHover={(h) => setHoverId(h ? asset.id : null)}
          />
        ))}

        {/* Scanline overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyber-400/30 to-transparent animate-scan" />
        </div>
      </div>

      {/* 4D Time slider */}
      <div className="flex items-center gap-4 border-t border-white/5 px-5 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Crosshair className="h-3.5 w-3.5 text-cyber-400" />
          4D Time Scrubber
        </div>
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={90}
            step={1}
            value={dayOffset}
            onChange={(e) => setDayOffset(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-finance-500 via-warn-500 to-alarm-500 accent-white"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            {TIME_MARKERS.map((m) => (
              <span key={m.day} className={dayOffset === m.day ? 'text-cyber-400' : ''}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setDayOffset(Math.max(0, dayOffset - 7))} className="btn-ghost px-2 py-1">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-sm text-cyber-400">Day {dayOffset}</span>
          <button onClick={() => setDayOffset(Math.min(90, dayOffset + 7))} className="btn-ghost px-2 py-1">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button onClick={() => goToModule('cascade')} className="btn-ghost text-xs">
          <Maximize2 className="h-3.5 w-3.5" /> Cascade View
        </button>
      </div>
    </div>
  );
}

function AssetNode({
  asset,
  dayOffset,
  selected,
  onSelect,
  onHover,
}: {
  asset: Asset;
  dayOffset: number;
  selected: boolean;
  onSelect: () => void;
  onHover: (h: boolean) => void;
}) {
  const state = healthStateForDay(asset, dayOffset);
  const color = stateColor[state];
  const cat = categoryMeta[asset.category];
  const isEmergency = asset.barrierState === 'emergency';

  const size = asset.category === 'bridge' ? 14 : asset.category === 'road' ? 10 : 9;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:z-10 hover:scale-110"
      style={{ left: `${asset.location.x}%`, top: `${asset.location.y}%` }}
    >
      {/* Pulse ring for critical/emergency */}
      {(state === 'critical' || isEmergency) && (
        <span
          className="absolute inset-0 animate-pulse rounded-full"
          style={{ boxShadow: `0 0 0 4px ${color}40`, background: `${color}20` }}
        />
      )}
      <svg width={size * 2.4} height={size * 2.4} viewBox="0 0 24 24" className="relative">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill={`${color}25`}
          stroke={color}
          strokeWidth={selected ? 2.5 : 1.5}
          opacity={0.9}
        />
        <AssetGlyph category={asset.category} color={color} />
      </svg>
      {selected && (
        <span
          className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-navy-900 px-1.5 py-0.5 font-mono text-[9px] text-white"
        >
          {asset.id}
        </span>
      )}
    </button>
  );
}

function AssetGlyph({ category, color }: { category: Asset['category']; color: string }) {
  switch (category) {
    case 'bridge':
      return (
        <path
          d="M4 14 Q12 8 20 14 M4 14 V18 H20 V14 M8 14 V18 M16 14 V18"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
        />
      );
    case 'pipe':
      return (
        <>
          <circle cx="12" cy="12" r="5" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2" fill={color} />
        </>
      );
    case 'road':
      return (
        <rect x="6" y="10" width="12" height="4" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
      );
    case 'drain':
      return (
        <>
          <rect x="7" y="7" width="10" height="10" rx="1" fill="none" stroke={color} strokeWidth="1.5" />
          <line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth="1" />
          <line x1="12" y1="7" x2="12" y2="17" stroke={color} strokeWidth="1" />
        </>
      );
    case 'pole':
      return (
        <>
          <line x1="12" y1="5" x2="12" y2="18" stroke={color} strokeWidth="1.5" />
          <circle cx="12" cy="6" r="2" fill={color} />
          <line x1="12" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.2" />
        </>
      );
  }
}

function RoadHeatmap({ road, dayOffset }: { road: Asset; dayOffset: number }) {
  if (!road.rqiSegments) return null;
  const baseX = road.location.x - 6;
  const baseY = road.location.y + 2;
  const segWidth = 12 / road.rqiSegments.length;
  return (
    <div
      className="absolute flex overflow-hidden rounded-sm border border-white/5"
      style={{
        left: `${baseX}%`,
        top: `${baseY}%`,
        width: '12%',
        height: '6px',
      }}
    >
      {road.rqiSegments.map((seg, i) => {
        const score = seg.score - dayOffset * 0.03;
        const c = score >= 7 ? '#2ecc71' : score >= 5 ? '#ff9f43' : score >= 3 ? '#ff7575' : '#ff5252';
        return (
          <div
            key={i}
            title={`${seg.start}-${seg.end}m: RQI ${seg.score}${seg.defect ? ` — ${seg.defect}` : ''}`}
            style={{ width: `${segWidth * 8.33}%`, background: c }}
            className="transition-colors duration-500"
          />
        );
      })}
    </div>
  );
}

function RiverAndTerrain({ dayOffset }: { dayOffset: number }) {
  const floodIntensity = Math.min(1, dayOffset / 90);
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 62.5" preserveAspectRatio="none">
      {/* River */}
      <path
        d="M 15 0 Q 25 20 22 35 Q 19 50 28 62.5"
        fill="none"
        stroke={floodIntensity > 0.5 ? '#ff5252' : '#00a8b8'}
        strokeWidth="3"
        opacity="0.3"
        className="flow-line"
      />
      <path
        d="M 15 0 Q 25 20 22 35 Q 19 50 28 62.5"
        fill="none"
        stroke={floodIntensity > 0.5 ? '#ff5252' : '#00a8b8'}
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Secondary paths/roads */}
      <path d="M 0 45 Q 30 42 50 48 Q 75 54 100 40" fill="none" stroke="#27314f" strokeWidth="0.5" opacity="0.6" />
      <path d="M 45 0 Q 48 20 52 35 Q 56 50 50 62.5" fill="none" stroke="#27314f" strokeWidth="0.5" opacity="0.5" />
      <path d="M 0 25 Q 40 28 60 22 Q 85 18 100 28" fill="none" stroke="#27314f" strokeWidth="0.5" opacity="0.4" />
    </svg>
  );
}

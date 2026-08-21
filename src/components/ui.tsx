import { useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Gauge,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { HealthState } from '@/types';
import { stateColor, stateLabel } from '@/lib';

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = 'cyber',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'cyber' | 'warn' | 'alarm' | 'finance' | 'quantum';
}) {
  const accents: Record<string, string> = {
    cyber: 'text-cyber-400',
    warn: 'text-warn-400',
    alarm: 'text-alarm-500',
    finance: 'text-finance-400',
    quantum: 'text-quantum-400',
  };
  return (
    <div className="metric-card group relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 opacity-[0.04] blur-2xl transition-opacity group-hover:opacity-[0.08]">
        <Icon className="h-full w-full" />
      </div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${accents[accent]}`} />
        {label}
      </div>
      <div className={`mt-1.5 font-mono text-2xl font-semibold ${accents[accent]}`}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function HealthBadge({ state, size = 'md' }: { state: HealthState; size?: 'sm' | 'md' }) {
  const color = stateColor[state];
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
  };
  return (
    <span
      className={`chip border ${sizes[size]}`}
      style={{ color, borderColor: `${color}55`, background: `${color}18` }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {stateLabel[state]}
    </span>
  );
}

export function Gauge28({
  value,
  label,
  size = 120,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const r = size / 2 - 10;
  const circ = Math.PI * r; // semicircle
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ - (pct / 100) * circ;
  const color = stateColor[
    pct >= 70 ? 'safe' : pct >= 50 ? 'warning' : pct >= 30 ? 'high' : 'critical'
  ];
  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 14} viewBox={`0 0 ${size} ${size / 2 + 14}`}>
        <path
          d={`M 10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="#1c2440"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M 10 ${size / 2} A ${r} ${r} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s' }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <div className="font-mono text-xl font-bold" style={{ color }}>
          {Math.round(pct)}
        </div>
      </div>
      {label && <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>}
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-2xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full ${width} w-full overflow-y-auto border-l border-cyber-400/20 bg-navy-850/95 backdrop-blur-2xl shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/5 bg-navy-850/95 px-6 py-4 backdrop-blur-xl">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </aside>
    </>
  );
}

export function SectionTitle({
  icon: Icon,
  title,
  desc,
  right,
}: {
  icon: LucideIcon;
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyber-400/10 border border-cyber-400/20 text-cyber-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
          {desc && <p className="text-sm text-slate-400">{desc}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function EmptyState({
  icon: Icon = Activity,
  title,
  desc,
}: {
  icon?: LucideIcon;
  title: string;
  desc?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="mb-3 h-10 w-10 text-slate-600" />
      <p className="text-slate-300">{title}</p>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
    </div>
  );
}

export { AlertTriangle, Gauge, TrendingUp };

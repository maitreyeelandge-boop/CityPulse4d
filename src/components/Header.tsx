import {
  Activity,
  AlertTriangle,
  Waves,
  CalendarClock,
  Cpu,
  Radio,
} from 'lucide-react';
import { Gauge28 } from '@/components/ui';
import { cityHealthIndex, activeBarrierCount, forecastCount, formatINR } from '@/lib';

export function Header({
  budget,
  setBudget,
  allocated,
  activeAlerts,
}: {
  budget: number;
  setBudget: (v: number) => void;
  allocated: number;
  activeAlerts: number;
}) {
  const health = cityHealthIndex();
  const barriers = activeBarrierCount();
  const forecast30 = forecastCount(30);
  const remaining = budget - allocated;
  const spendPct = budget > 0 ? (allocated / budget) * 100 : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-navy-950/80 backdrop-blur-2xl">
      {/* Top brand row */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyber-400 to-quantum-400 shadow-glow">
            <Radio className="h-5 w-5 text-navy-950" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-finance-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-finance-400" />
            </span>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight text-white">
              CityPulse <span className="text-gradient-cyber">4D</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Smart Infrastructure Intelligence &amp; Emergency Platform
            </p>
          </div>
        </div>

        {/* Global indicators */}
        <div className="flex flex-wrap items-center gap-2">
          <IndicatorPill
            icon={<Gauge28 value={health} size={44} />}
            label="City Health"
            value={`${health}`}
          />
          <AlertPill count={barriers} label="Active Barriers" />
          <AlertPill count={activeAlerts} label="Safety Alerts" variant="alarm" />
          <IndicatorPill
            icon={<CalendarClock className="h-4 w-4 text-warn-400" />}
            label="30-Day Failures"
            value={forecast30}
            variant="warn"
          />
          <div className="flex items-center gap-1.5 rounded-lg border border-finance-500/30 bg-finance-500/10 px-3 py-1.5">
            <Cpu className="h-3.5 w-3.5 text-finance-400" />
            <span className="text-[11px] font-medium text-finance-400">Quantum Opt Active</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-cyber-400/30 bg-cyber-400/10 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-cyber-400" />
            <span className="text-[11px] font-medium text-cyber-400">Live IoT Telemetry</span>
            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-400" />
          </div>
        </div>
      </div>

      {/* Budget allocator row */}
      <div className="flex flex-wrap items-center gap-4 border-t border-white/5 px-5 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <Waves className="h-4 w-4 text-finance-400" />
          <span className="text-slate-300">Monthly Budget:</span>
          <input
            type="range"
            min={500000}
            max={10000000}
            step={50000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="h-1.5 w-40 cursor-pointer appearance-none rounded-full bg-navy-700 accent-finance-500"
          />
          <input
            type="number"
            value={budget}
            min={0}
            onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
            className="w-28 rounded-md border border-white/10 bg-navy-800 px-2 py-1 font-mono text-sm text-finance-400 outline-none focus:border-finance-500/50"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              Allocated: <span className="font-mono text-warn-400">{formatINR(allocated)}</span>
            </span>
            <span className="text-slate-400">
              Remaining:{' '}
              <span className={`font-mono ${remaining < 0 ? 'text-alarm-500' : 'text-finance-400'}`}>
                {formatINR(Math.abs(remaining))}
                {remaining < 0 ? ' over' : ''}
              </span>
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-navy-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spendPct > 100 ? 'bg-alarm-500' : spendPct > 80 ? 'bg-warn-500' : 'bg-finance-500'
              }`}
              style={{ width: `${Math.min(100, spendPct)}%` }}
            />
            {spendPct > 0 && (
              <div className="absolute inset-0 animate-sweep bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function IndicatorPill({
  icon,
  label,
  value,
  variant = 'cyber',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  variant?: 'cyber' | 'warn';
}) {
  const colors = {
    cyber: 'border-cyber-400/30 bg-cyber-400/10',
    warn: 'border-warn-500/30 bg-warn-500/10',
  };
  return (
    <div className={`flex items-center gap-2 rounded-lg border ${colors[variant]} px-3 py-1.5`}>
      {icon && typeof icon === 'object' && 'props' in icon ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : (
        icon
      )}
      <div className="leading-tight">
        <div className="font-mono text-sm font-semibold text-white">{value}</div>
        <div className="text-[10px] text-slate-400">{label}</div>
      </div>
    </div>
  );
}

function AlertPill({
  count,
  label,
  variant = 'warn',
}: {
  count: number;
  label: string;
  variant?: 'warn' | 'alarm';
}) {
  const colors =
    variant === 'alarm'
      ? 'border-alarm-500/40 bg-alarm-500/15 text-alarm-400'
      : 'border-warn-500/40 bg-warn-500/15 text-warn-400';
  return (
    <div className={`flex items-center gap-2 rounded-lg border ${colors} px-3 py-1.5`}>
      <AlertTriangle className="h-3.5 w-3.5 animate-flicker" />
      <div className="leading-tight">
        <div className="font-mono text-sm font-semibold">{count}</div>
        <div className="text-[10px] opacity-80">{label}</div>
      </div>
    </div>
  );
}

import {
  Droplets,
  ShieldAlert,
  Waves,
  Gauge,
  Wind,
  CalendarClock,
  CircleCheck,
} from 'lucide-react';
import type { Asset } from '@/types';
import { ASSETS } from '@/data';
import { SectionTitle, HealthBadge } from '@/components/ui';
import { healthState, formatINR } from '@/lib';

export function DrainageModule({ onSelectAsset }: { onSelectAsset: (a: Asset) => void }) {
  const drains = ASSETS.filter((a) => a.category === 'drain');
  const bridges = ASSETS.filter((a) => a.category === 'bridge');

  const emergencyBarriers = [...drains, ...bridges].filter(
    (a) => a.barrierState === 'emergency'
  );
  const loweredBarriers = [...drains, ...bridges].filter(
    (a) => a.barrierState === 'lowered'
  );

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={Droplets}
        title="Smart Drainage, Leak & Flood Prevention"
        desc="Multi-sensor health matrix, automated safety barriers, pre-monsoon jetting scheduler"
      />

      {/* Barrier status banner */}
      <div className="glass-strong p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-alarm-400" />
          <h3 className="font-display text-base font-semibold text-white">
            Automated Safety Barrier Control Center
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <BarrierStat
            label="Normal"
            count={[...drains, ...bridges].filter((a) => a.barrierState === 'normal').length}
            color="#2ecc71"
            icon={CircleCheck}
          />
          <BarrierStat
            label="Lowered"
            count={loweredBarriers.length}
            color="#ff9f43"
            icon={ShieldAlert}
          />
          <BarrierStat
            label="Emergency Active"
            count={emergencyBarriers.length}
            color="#ff5252"
            icon={ShieldAlert}
            pulse
          />
        </div>
        {emergencyBarriers.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-alarm-500/40 bg-alarm-500/10 p-3">
            <ShieldAlert className="h-5 w-5 animate-flicker text-alarm-500" />
            <span className="text-sm text-alarm-400">
              {emergencyBarriers.map((b) => b.name).join(', ')} — barriers lowered + red lights
              active on all approach roads.
            </span>
          </div>
        )}
      </div>

      {/* Multi-sensor health matrix */}
      <div className="glass p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
          <Gauge className="h-4 w-4 text-cyber-400" /> Multi-Sensor Health Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2 text-left">Drain</th>
                <th className="py-2 text-center">Water Level</th>
                <th className="py-2 text-center">Flow Rate</th>
                <th className="py-2 text-center">Turbidity</th>
                <th className="py-2 text-center">Gas</th>
                <th className="py-2 text-center">Sediment</th>
                <th className="py-2 text-center">Health</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {drains.map((d) => (
                <tr
                  key={d.id}
                  className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/5"
                  onClick={() => onSelectAsset(d)}
                >
                  <td className="py-2.5">
                    <div className="font-medium text-white">{d.name}</div>
                    <div className="text-[10px] text-slate-500">{d.ward}</div>
                  </td>
                  {d.telemetry.slice(0, 5).map((t) => (
                    <td key={t.label} className="py-2.5 text-center">
                      <span
                        className={`font-mono text-xs ${
                          t.status === 'critical'
                            ? 'text-alarm-500'
                            : t.status === 'elevated'
                            ? 'text-warn-400'
                            : 'text-finance-400'
                        }`}
                      >
                        {t.value}
                      </span>
                    </td>
                  ))}
                  <td className="py-2.5 text-center">
                    <HealthBadge state={healthState(d.healthScore)} size="sm" />
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="text-xs text-cyber-400">Inspect →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sediment & pre-monsoon jetting scheduler */}
      <div className="glass p-5">
        <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-white">
          <CalendarClock className="h-4 w-4 text-warn-400" /> Sediment Accumulation &amp; Pre-Monsoon Jetting Scheduler
        </h3>
        <div className="space-y-3">
          {drains.map((d) => {
            const sediment = d.telemetry.find((t) => t.label === 'Sediment');
            const sedPct = parseInt(sediment?.value ?? '0');
            const jettingCost = d.costBreakdown.reduce((s, c) => s + c.amount, 0);
            const daysToMonsoon = 30;
            const needsJetting = sedPct > 50;
            return (
              <div
                key={d.id}
                className="rounded-xl border border-white/5 bg-navy-800/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="h-4 w-4 text-cyber-400" />
                    <span className="font-medium text-white">{d.name}</span>
                    <span className="text-xs text-slate-400">{d.ward}</span>
                  </div>
                  {needsJetting && (
                    <span className="chip border border-warn-500/30 bg-warn-500/10 text-warn-400">
                      <Wind className="h-3 w-3" /> Jetting Dispatch
                    </span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Sediment</div>
                    <div
                      className={`font-mono text-lg font-bold ${
                        sedPct > 70 ? 'text-alarm-500' : sedPct > 50 ? 'text-warn-400' : 'text-finance-400'
                      }`}
                    >
                      {sedPct}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Build-up Rate</div>
                    <div className="font-mono text-lg font-bold text-slate-200">
                      {(sedPct / 30).toFixed(1)}%/wk
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Days to Monsoon</div>
                    <div className="font-mono text-lg font-bold text-warn-400">{daysToMonsoon}d</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-slate-500">Jetting Cost</div>
                    <div className="font-mono text-lg font-bold text-finance-400">
                      {formatINR(jettingCost)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sedPct > 70 ? 'bg-alarm-500' : sedPct > 50 ? 'bg-warn-500' : 'bg-finance-500'
                    }`}
                    style={{ width: `${sedPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BarrierStat({
  label,
  count,
  color,
  icon: Icon,
  pulse,
}: {
  label: string;
  count: number;
  color: string;
  icon: typeof ShieldAlert;
  pulse?: boolean;
}) {
  return (
    <div
      className="relative flex flex-col items-center rounded-xl border p-4"
      style={{ borderColor: `${color}40`, background: `${color}10` }}
    >
      {pulse && count > 0 && (
        <span
          className="absolute inset-0 animate-pulse rounded-xl"
          style={{ boxShadow: `0 0 20px ${color}40` }}
        />
      )}
      <Icon className="h-6 w-6" style={{ color }} />
      <div className="mt-2 font-mono text-3xl font-bold" style={{ color }}>
        {count}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

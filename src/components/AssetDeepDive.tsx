import {
  Activity,
  Clock,
  Users,
  Wrench,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';
import type { Asset } from '@/types';
import { Drawer, HealthBadge, Gauge28, MiniBar } from '@/components/ui';
import {
  categoryMeta,
  healthState,
  safeWindowDays,
  formatINR,
  formatINRFull,
} from '@/lib';
import { totalCostOf } from '@/data';

export function AssetDeepDive({
  asset,
  open,
  onClose,
}: {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!asset) return null;
  const state = healthState(asset.healthScore);
  const cat = categoryMeta[asset.category];
  const totalRepair = totalCostOf(asset);
  const safeDays = safeWindowDays(asset);
  const repairOpt = asset.repairReplace.find((r) => r.mode === 'repair')!;
  const replaceOpt = asset.repairReplace.find((r) => r.mode === 'replace')!;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={asset.name}
      subtitle={`${cat.label} • ${asset.ward} • ID ${asset.id}`}
      width="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top: health + critical metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass flex flex-col items-center justify-center p-4">
            <Gauge28 value={asset.healthScore} label="Health" size={110} />
            <div className="mt-1">
              <HealthBadge state={state} size="sm" />
            </div>
          </div>
          <div className="glass p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
              <Clock className="h-3.5 w-3.5 text-warn-400" /> Safe Window
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-warn-400">{safeDays}d</div>
            <p className="mt-1 text-xs text-slate-400">
              Intervene within {safeDays} days. Predicted failure in{' '}
              <span className="text-alarm-400">
                {asset.failureRiskDays[0]}–{asset.failureRiskDays[1]} days
              </span>
              .
            </p>
          </div>
          <div className="glass p-4">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
              <Users className="h-3.5 w-3.5 text-cyber-400" /> Affected
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-cyber-400">
              {asset.populationAffected.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-400">residents directly impacted</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="glass p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <Activity className="h-4 w-4 text-cyber-400" /> Metadata &amp; Telemetry
          </h3>
          <div className="mb-3 grid grid-cols-4 gap-2 text-xs">
            <Meta label="Age" value={`${asset.ageYears} yrs`} />
            <Meta label="Material" value={asset.material} />
            <Meta label="Installed" value={String(asset.installedYear)} />
            <Meta label="Seasonal Risk" value={`${asset.seasonalRiskScore}/100`} />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {asset.telemetry.map((t) => (
              <div
                key={t.label}
                className={`rounded-lg border p-2.5 ${
                  t.status === 'critical'
                    ? 'border-alarm-500/30 bg-alarm-500/10'
                    : t.status === 'elevated'
                    ? 'border-warn-500/30 bg-warn-500/10'
                    : 'border-white/5 bg-navy-800/50'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{t.label}</div>
                <div className="mt-0.5 font-mono text-lg font-semibold text-white">
                  {t.value}
                  <span className="ml-0.5 text-xs text-slate-400">{t.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Barrier state for drains/bridges */}
        {asset.barrierState && (
          <div
            className={`glass flex items-center gap-3 p-4 ${
              asset.barrierState === 'emergency'
                ? 'border-alarm-500/40 shadow-glow-alarm'
                : asset.barrierState === 'lowered'
                ? 'border-warn-500/40'
                : ''
            }`}
          >
            <ShieldAlert
              className={`h-8 w-8 ${
                asset.barrierState === 'emergency'
                  ? 'text-alarm-500'
                  : asset.barrierState === 'lowered'
                  ? 'text-warn-400'
                  : 'text-finance-400'
              }`}
            />
            <div>
              <div className="text-sm font-semibold text-white">
                Automated Safety Barrier:{' '}
                <span
                  className={
                    asset.barrierState === 'emergency'
                      ? 'text-alarm-500'
                      : asset.barrierState === 'lowered'
                      ? 'text-warn-400'
                      : 'text-finance-400'
                  }
                >
                  {asset.barrierState === 'emergency'
                    ? 'EMERGENCY ACTIVE'
                    : asset.barrierState === 'lowered'
                    ? 'Lowered'
                    : 'Normal'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {asset.barrierState === 'emergency'
                  ? 'Barriers lowered + red lights triggered on all approach roads.'
                  : asset.barrierState === 'lowered'
                  ? 'Approach barriers lowered. Traffic rerouted.'
                  : 'All barriers raised. Normal traffic flow.'}
              </p>
            </div>
          </div>
        )}

        {/* AI Itemized Cost Estimator */}
        <div className="glass p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <IndianRupee className="h-4 w-4 text-finance-400" /> AI Itemized Cost Estimator
            <span className="chip border border-finance-500/30 bg-finance-500/10 text-finance-400">
              Bill of Quantities
            </span>
          </h3>
          <table className="w-full text-sm">
            <tbody>
              {asset.costBreakdown.map((c) => (
                <tr key={c.label} className="border-b border-white/5 last:border-0">
                  <td className="py-2 text-slate-300">{c.label}</td>
                  <td className="py-2 text-right font-mono text-slate-200">
                    {formatINRFull(c.amount)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-cyber-400/20">
                <td className="py-2.5 font-semibold text-white">Estimated Total</td>
                <td className="py-2.5 text-right font-mono text-lg font-bold text-finance-400">
                  {formatINR(totalRepair)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Repair-or-Replace Decision Engine */}
        <div className="glass p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <RefreshCw className="h-4 w-4 text-quantum-400" /> Repair-or-Replace AI Decision
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-cyber-400/20 bg-cyber-400/5 p-3">
              <div className="flex items-center gap-2 text-cyber-400">
                <Wrench className="h-4 w-4" />
                <span className="text-sm font-semibold">Repair</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-white">
                {formatINR(repairOpt.cost)}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Useful life extension: <span className="text-finance-400">{repairOpt.lifeExtension}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{repairOpt.notes}</p>
            </div>
            <div className="rounded-xl border border-quantum-400/20 bg-quantum-400/5 p-3">
              <div className="flex items-center gap-2 text-quantum-400">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-semibold">Replace</span>
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-white">
                {formatINR(replaceOpt.cost)}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Useful life extension: <span className="text-finance-400">{replaceOpt.lifeExtension}</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{replaceOpt.notes}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-quantum-400/30 bg-quantum-400/10 p-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-quantum-400" />
            <span className="text-sm text-white">
              <span className="font-semibold text-quantum-300">AI Verdict:</span> {asset.verdict}
            </span>
          </div>
        </div>

        {/* Affected population impact */}
        <div className="glass p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <AlertTriangle className="h-4 w-4 text-alarm-400" /> Risk Impact &amp; Population
          </h3>
          <div className="space-y-2">
            <ImpactRow label="Population Affected" value={asset.populationAffected} max={10000} color="#00f2fe" suffix=" residents" />
            <ImpactRow label="Seasonal Flood Risk" value={asset.seasonalRiskScore} max={100} color="#ff9f43" suffix="/100" />
            <ImpactRow label="Urgency Score" value={asset.urgency} max={10} color="#ff5252" suffix="/10" />
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-800/50 p-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-200">{value}</div>
    </div>
  );
}

function ImpactRow({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-semibold text-white">
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <MiniBar value={value} max={max} color={color} />
    </div>
  );
}

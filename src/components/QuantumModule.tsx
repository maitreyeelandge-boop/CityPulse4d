import { useState } from 'react';
import { Atom, Play, TrendingUp, IndianRupee, Target, Zap } from 'lucide-react';
import type { OptimizationResult } from '@/types';
import { runQuantumOptimization, formatINR, priorityScore } from '@/lib';
import { ASSETS } from '@/data';
import { SectionTitle } from '@/components/ui';

export function QuantumModule({ budget }: { budget: number }) {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [iter, setIter] = useState(0);

  const run = () => {
    setRunning(true);
    setResult(null);
    let step = 0;
    const animate = setInterval(() => {
      step += 200;
      setIter(step);
      if (step >= 4000) {
        clearInterval(animate);
        setResult(runQuantumOptimization(budget));
        setRunning(false);
      }
    }, 30);
  };

  const allSorted = [...ASSETS].sort((a, b) => priorityScore(b) - priorityScore(a));
  const selectedIds = new Set(result?.selected.map((p) => p.assetId));

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={Atom}
        title="Quantum-AI Priority & Budget Optimization Engine"
        desc="Quantum-inspired annealing for mathematically optimal repair subset selection"
        right={
          <button onClick={run} disabled={running} className="btn-quantum">
            <Zap className="h-4 w-4" />
            {running ? `Annealing... ${iter}/4000` : 'Run Quantum Optimization'}
          </button>
        }
      />

      {/* Formula display */}
      <div className="glass p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Target className="h-4 w-4 text-quantum-400" /> Constraint-Based Priority Formula
        </div>
        <div className="mt-3 overflow-x-auto rounded-lg border border-white/10 bg-navy-950/60 p-4">
          <p className="font-mono text-sm text-cyber-300">
            Priority = <span className="text-warn-400">(Failure Risk × Impact × Population × Urgency × Seasonal)</span> ÷{' '}
            <span className="text-finance-400">Total Cost</span>
          </p>
        </div>
      </div>

      {/* Running visualization */}
      {running && (
        <div className="glass-strong relative overflow-hidden p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(165,94,234,0.15),transparent_70%)]" />
          <div className="relative flex flex-col items-center">
            <div className="relative h-24 w-24">
              <div className="radar-sweep" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Atom className="h-8 w-8 animate-spin text-quantum-400" />
              </div>
            </div>
            <p className="mt-4 font-mono text-sm text-quantum-300">
              Quantum Annealing in progress... evaluating 10,000+ repair combinations
            </p>
            <div className="mt-2 h-1.5 w-64 overflow-hidden rounded-full bg-navy-700">
              <div
                className="h-full bg-gradient-to-r from-quantum-400 to-cyber-400 transition-all"
                style={{ width: `${(iter / 4000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !running && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultCard
              icon={IndianRupee}
              label="Budget"
              value={formatINR(result.budget)}
              accent="finance"
            />
            <ResultCard
              icon={TrendingUp}
              label="Optimized Spend"
              value={formatINR(result.totalCost)}
              sub={`Remaining: ${formatINR(result.budget - result.totalCost)}`}
              accent="cyber"
            />
            <ResultCard
              icon={Target}
              label="Risk Reduction"
              value={`${result.totalRiskReduction} pts`}
              accent="warn"
            />
            <ResultCard
              icon={Atom}
              label="Convergence"
              value={`${result.convergenceScore}%`}
              sub={`${result.iterations} iterations`}
              accent="quantum"
            />
          </div>

          {/* Budget bar */}
          <div className="glass p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Budget Utilization</span>
              <span className="font-mono text-finance-400">
                {((result.totalCost / result.budget) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-navy-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-finance-500 via-cyber-400 to-quantum-400 transition-all duration-1000"
                style={{ width: `${Math.min(100, (result.totalCost / result.budget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Selected projects table */}
          <div className="glass p-5">
            <h3 className="mb-3 font-display text-base font-semibold text-white">
              Optimal Repair Subset ({result.selected.length} projects selected)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-2 text-left">Asset</th>
                    <th className="py-2 text-left">Mode</th>
                    <th className="py-2 text-right">Cost</th>
                    <th className="py-2 text-right">Risk Reduction</th>
                    <th className="py-2 text-right">ROI (pts/₹L)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.selected.map((p) => (
                    <tr key={p.assetId} className="border-b border-white/5">
                      <td className="py-2.5 font-medium text-white">{p.name}</td>
                      <td className="py-2.5">
                        <span
                          className={`chip border ${
                            p.mode === 'replace'
                              ? 'border-quantum-400/30 bg-quantum-400/10 text-quantum-300'
                              : 'border-cyber-400/30 bg-cyber-400/10 text-cyber-300'
                          }`}
                        >
                          {p.mode}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-finance-400">
                        {formatINR(p.cost)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-cyber-400">
                        {p.riskReduction}
                      </td>
                      <td className="py-2.5 text-right font-mono text-warn-400">
                        {(p.riskReduction / (p.cost / 100000)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Full priority ranking (always visible) */}
      {!result && !running && (
        <div className="glass p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-white">
            Priority Ranking — All Assets (awaiting optimization)
          </h3>
          <div className="space-y-2">
            {allSorted.map((a, i) => {
              const score = priorityScore(a);
              const maxScore = priorityScore(allSorted[0]);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg bg-navy-800/40 p-3"
                >
                  <div className="font-mono text-sm text-slate-500">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{a.name}</span>
                      <span className="font-mono text-xs text-quantum-400">
                        {score.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-quantum-400 to-cyber-400"
                        style={{ width: `${(score / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show selected highlight when result exists */}
      {result && (
        <div className="glass p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-white">
            Full Asset Ranking (selected highlighted)
          </h3>
          <div className="space-y-1.5">
            {allSorted.map((a, i) => {
              const selected = selectedIds.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-lg p-2.5 transition-all ${
                    selected
                      ? 'border border-quantum-400/30 bg-quantum-400/10'
                      : 'bg-navy-800/30'
                  }`}
                >
                  <div className="font-mono text-xs text-slate-500">#{i + 1}</div>
                  <span className={`flex-1 text-sm ${selected ? 'text-white' : 'text-slate-400'}`}>
                    {a.name}
                  </span>
                  {selected && (
                    <span className="chip border border-quantum-400/30 bg-quantum-400/10 text-quantum-300">
                      <Atom className="h-3 w-3" /> Selected
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Atom;
  label: string;
  value: string;
  sub?: string;
  accent: 'cyber' | 'warn' | 'finance' | 'quantum';
}) {
  const colors = {
    cyber: 'text-cyber-400',
    warn: 'text-warn-400',
    finance: 'text-finance-400',
    quantum: 'text-quantum-400',
  };
  return (
    <div className="metric-card">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
        <Icon className={`h-3.5 w-3.5 ${colors[accent]}`} />
        {label}
      </div>
      <div className={`mt-1.5 font-mono text-xl font-bold ${colors[accent]}`}>{value}</div>
      {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

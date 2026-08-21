import type { Asset, HealthState, OptimizationResult, OptimizedProject } from '@/types';
import { ASSETS, cheapestOption } from '@/data';

export function healthState(score: number): HealthState {
  if (score >= 70) return 'safe';
  if (score >= 50) return 'warning';
  if (score >= 30) return 'high';
  return 'critical';
}

export const stateColor: Record<HealthState, string> = {
  safe: '#2ecc71',
  warning: '#ff9f43',
  high: '#ff7575',
  critical: '#ff5252',
};

export const stateBg: Record<HealthState, string> = {
  safe: 'bg-finance-500/15 text-finance-400 border-finance-500/30',
  warning: 'bg-warn-500/15 text-warn-400 border-warn-500/30',
  high: 'bg-alarm-500/15 text-alarm-400 border-alarm-500/30',
  critical: 'bg-alarm-500/25 text-alarm-500 border-alarm-500/40',
};

export const stateLabel: Record<HealthState, string> = {
  safe: 'Safe',
  warning: 'Warning',
  high: 'High Risk',
  critical: 'Imminent Failure',
};

export const categoryMeta: Record<
  Asset['category'],
  { label: string; icon: string; color: string }
> = {
  bridge: { label: 'Bridge', icon: 'bridge', color: '#a55eea' },
  pipe: { label: 'Pipeline', icon: 'pipe', color: '#00f2fe' },
  road: { label: 'Road', icon: 'road', color: '#ff9f43' },
  drain: { label: 'Drain', icon: 'drain', color: '#2ecc71' },
  pole: { label: 'Smart Pole', icon: 'pole', color: '#f5d442' },
};

// Days remaining within "safe maintenance window" — use min failure risk.
export function safeWindowDays(asset: Asset): number {
  return asset.failureRiskDays[0];
}

// Priority score used by quantum optimizer:
// (FailureRisk × Impact × Population × Urgency × SeasonalFactor) ÷ TotalCost
export function priorityScore(asset: Asset): number {
  const risk = 100 - asset.healthScore;
  const impact = asset.populationAffected / 1000;
  const cost = cheapestOption(asset) / 100000;
  const seasonal = 1 + asset.seasonalRiskScore / 100;
  return (risk * impact * asset.urgency * seasonal) / Math.max(cost, 0.1);
}

// Risk reduction if repaired/replaced (0-100 scale, weighted by population)
export function riskReduction(asset: Asset, mode: 'repair' | 'replace'): number {
  const opt = asset.repairReplace.find((r) => r.mode === mode)!;
  const base = 100 - asset.healthScore;
  const lifeWeight = mode === 'replace' ? 1.0 : 0.4;
  return Math.round(base * lifeWeight * (1 + asset.populationAffected / 8000) * 10) / 10;
}

export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount}`;
}

export function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// Quantum-inspired simulated annealing optimizer.
// Selects optimal subset of repairs within budget to maximize risk reduction.
export function runQuantumOptimization(
  budget: number,
  iterations = 4000
): OptimizationResult {
  const projects: OptimizedProject[] = ASSETS.map((a) => {
    const repairOpt = a.repairReplace.find((r) => r.mode === 'repair')!;
    const replaceOpt = a.repairReplace.find((r) => r.mode === 'replace')!;
    // pick the option with better risk-reduction-per-rupee, but bias to repair for low risk
    const repairRR = riskReduction(a, 'repair') / repairOpt.cost;
    const replaceRR = riskReduction(a, 'replace') / replaceOpt.cost;
    const mode = replaceRR > repairRR * 1.3 ? 'replace' : 'repair';
    const opt = mode === 'replace' ? replaceOpt : repairOpt;
    return {
      assetId: a.id,
      name: a.name,
      category: a.category,
      cost: opt.cost,
      riskReduction: riskReduction(a, mode as 'repair' | 'replace'),
      mode: mode as 'repair' | 'replace',
    };
  });

  let best: string[] = [];
  let bestScore = 0;
  let current: string[] = [];
  let currentCost = 0;
  let currentScore = 0;
  let temp = 1.0;
  const cooling = 0.9995;

  const all = projects.map((p) => p.assetId);
  const byId = new Map(projects.map((p) => [p.assetId, p]));

  for (let i = 0; i < iterations; i++) {
    // neighbor: toggle a random project
    const candidate = [...current];
    const target = all[Math.floor(Math.random() * all.length)];
    const idx = candidate.indexOf(target);
    if (idx >= 0) {
      candidate.splice(idx, 1);
    } else {
      candidate.push(target);
    }
    let cost = 0;
    let score = 0;
    for (const id of candidate) {
      const p = byId.get(id)!;
      cost += p.cost;
      score += p.riskReduction;
    }
    // hard budget constraint with penalty
    if (cost > budget) score *= 0.05;

    const delta = score - currentScore;
    if (delta > 0 || Math.random() < Math.exp(delta / Math.max(temp, 0.001))) {
      current = candidate;
      currentCost = cost;
      currentScore = score;
      if (score > bestScore && cost <= budget) {
        best = [...candidate];
        bestScore = score;
      }
    }
    temp *= cooling;
  }

  const selected = best
    .map((id) => byId.get(id)!)
    .sort((a, b) => b.riskReduction - a.riskReduction);
  const totalCost = selected.reduce((s, p) => s + p.cost, 0);

  return {
    selected,
    totalCost,
    totalRiskReduction: Math.round(bestScore * 10) / 10,
    budget,
    iterations,
    convergenceScore: Math.min(100, Math.round((bestScore / (projects.reduce((s, p) => s + p.riskReduction, 0) || 1)) * 100)),
  };
}

// City Health Index: weighted average of asset health scores, weighted by population impact.
export function cityHealthIndex(): number {
  const totalPop = ASSETS.reduce((s, a) => s + a.populationAffected, 0);
  const weighted = ASSETS.reduce((s, a) => s + a.healthScore * a.populationAffected, 0);
  return Math.round(weighted / totalPop);
}

export function activeBarrierCount(): number {
  return ASSETS.filter((a) => a.barrierState && a.barrierState !== 'normal').length;
}

export function forecastCount(days: number): number {
  return ASSETS.filter((a) => a.failureRiskDays[0] <= days).length;
}

// Simulate health decay over time for the 4D slider.
export function projectHealth(asset: Asset, dayOffset: number): number {
  const base = asset.healthScore;
  const decayRate = (100 - base) / Math.max(asset.failureRiskDays[1], 10);
  const projected = base - decayRate * dayOffset;
  const seasonalBoost =
    dayOffset >= 20 ? asset.seasonalRiskScore * 0.08 * (dayOffset / 90) : 0;
  return Math.max(0, Math.min(100, Math.round(projected - seasonalBoost)));
}

export function healthStateForDay(asset: Asset, dayOffset: number): HealthState {
  return healthState(projectHealth(asset, dayOffset));
}

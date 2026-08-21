// CityPulse 4D — Domain types

export type AssetCategory =
  | 'bridge'
  | 'pipe'
  | 'road'
  | 'drain'
  | 'pole';

export type HealthState = 'safe' | 'warning' | 'high' | 'critical';

export type BarrierState = 'normal' | 'lowered' | 'emergency';

export interface Telemetry {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'elevated' | 'critical';
}

export interface CostItem {
  label: string;
  amount: number; // INR
}

export interface RepairReplaceOption {
  mode: 'repair' | 'replace';
  cost: number;
  lifeExtension: string;
  notes: string;
}

export interface CascadeLink {
  fromId: string;
  toId: string;
  label: string;
  costIfIgnored: number;
}

export interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  ward: string;
  location: { x: number; y: number }; // 0-100 grid coords
  ageYears: number;
  material: string;
  installedYear: number;
  healthScore: number; // 0-100
  failureRiskDays: [number, number]; // min, max days to predicted failure
  seasonalRiskScore: number; // 0-100
  populationAffected: number;
  urgency: number; // 1-10
  dependencies: string[]; // ids this asset affects
  telemetry: Telemetry[];
  costBreakdown: CostItem[];
  repairReplace: RepairReplaceOption[];
  verdict: string;
  barrierState?: BarrierState;
  rqiSegments?: { start: number; end: number; score: number; defect?: string }[];
  nearMissEvents?: number;
  poleStrikes?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

export interface OptimizedProject {
  assetId: string;
  name: string;
  category: AssetCategory;
  cost: number;
  riskReduction: number;
  mode: 'repair' | 'replace';
}

export interface OptimizationResult {
  selected: OptimizedProject[];
  totalCost: number;
  totalRiskReduction: number;
  budget: number;
  iterations: number;
  convergenceScore: number;
}

export interface CVDefect {
  id: string;
  type: string;
  confidence: number;
  bbox: { x: number; y: number; w: number; h: number };
  severity: 'low' | 'medium' | 'high';
  estDimensions?: string;
}

export type ModuleKey =
  | 'twin'
  | 'rqi'
  | 'drainage'
  | 'assistant'
  | 'quantum'
  | 'cascade'
  | 'cv';

import { useState } from 'react';
import {
  Boxes,
  Route,
  Droplets,
  Bot,
  Atom,
  GitBranch,
  ScanEye,
  type LucideIcon,
} from 'lucide-react';
import type { Asset, ModuleKey } from '@/types';
import { ASSETS } from '@/data';
import { activeBarrierCount, formatINR } from '@/lib';
import { cheapestOption } from '@/data';
import { Header } from '@/components/Header';
import { CityDigitalTwin } from '@/components/CityDigitalTwin';
import { AssetDeepDive } from '@/components/AssetDeepDive';
import { RQIModule } from '@/components/RQIModule';
import { DrainageModule } from '@/components/DrainageModule';
import { AssistantModule } from '@/components/AssistantModule';
import { QuantumModule } from '@/components/QuantumModule';
import { CascadeModule } from '@/components/CascadeModule';
import { CVModule } from '@/components/CVModule';

const TABS: { key: ModuleKey; label: string; icon: LucideIcon }[] = [
  { key: 'twin', label: '4D City Twin', icon: Boxes },
  { key: 'rqi', label: 'RQI & Safety', icon: Route },
  { key: 'drainage', label: 'Drainage & Flood', icon: Droplets },
  { key: 'assistant', label: 'AI Assistant', icon: Bot },
  { key: 'quantum', label: 'Quantum Optimizer', icon: Atom },
  { key: 'cascade', label: 'Failure Cascade', icon: GitBranch },
  { key: 'cv', label: 'Edge CV Inspection', icon: ScanEye },
];

function App() {
  const [activeTab, setActiveTab] = useState<ModuleKey>('twin');
  const [budget, setBudget] = useState(5000000); // ₹50 Lakh default
  const [dayOffset, setDayOffset] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // "Allocated" = sum of cheapest option for all assets below health 70
  const allocated = ASSETS.filter((a) => a.healthScore < 70).reduce(
    (s, a) => s + cheapestOption(a),
    0
  );
  const activeAlerts = activeBarrierCount();

  const selectAsset = (a: Asset) => {
    setSelectedAsset(a);
    setDrawerOpen(true);
  };

  const goToModule = (m: ModuleKey) => setActiveTab(m);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <Header
        budget={budget}
        setBudget={setBudget}
        allocated={allocated}
        activeAlerts={activeAlerts}
      />

      {/* Tab bar */}
      <nav className="sticky top-[105px] z-20 border-b border-white/5 bg-navy-950/90 backdrop-blur-xl">
        <div className="flex gap-1 overflow-x-auto px-5 py-2">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`tab-pill flex items-center gap-2 ${
                  active
                    ? 'bg-cyber-400/15 text-cyber-300 border border-cyber-400/30 shadow-glow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-[1600px] px-5 py-5">
        {activeTab === 'twin' && (
          <div className="space-y-4">
            <CityDigitalTwin
              dayOffset={dayOffset}
              setDayOffset={setDayOffset}
              onSelectAsset={selectAsset}
              selectedId={selectedAsset?.id ?? null}
              goToModule={goToModule}
            />
            {/* Quick asset grid below twin */}
            <QuickAssetGrid onSelectAsset={selectAsset} />
          </div>
        )}
        {activeTab === 'rqi' && <RQIModule onSelectAsset={selectAsset} />}
        {activeTab === 'drainage' && <DrainageModule onSelectAsset={selectAsset} />}
        {activeTab === 'assistant' && <AssistantModule budget={budget} />}
        {activeTab === 'quantum' && <QuantumModule budget={budget} />}
        {activeTab === 'cascade' && <CascadeModule onSelectAsset={selectAsset} />}
        {activeTab === 'cv' && <CVModule />}
      </main>

      <AssetDeepDive
        asset={selectedAsset}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Footer status bar */}
      <footer className="border-t border-white/5 bg-navy-950 px-5 py-3 text-center text-xs text-slate-500">
        CityPulse 4D · Smart Infrastructure Intelligence &amp; Emergency Platform ·{' '}
        <span className="text-finance-400">All systems operational</span> ·{' '}
        Monitoring {ASSETS.length} assets across 5 categories
      </footer>
    </div>
  );
}

function QuickAssetGrid({ onSelectAsset }: { onSelectAsset: (a: Asset) => void }) {
  const sorted = [...ASSETS].sort((a, b) => a.healthScore - b.healthScore);
  return (
    <div className="glass p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">Asset Registry — Click to inspect</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {sorted.map((a) => {
          const color =
            a.healthScore >= 70 ? '#2ecc71' : a.healthScore >= 50 ? '#ff9f43' : a.healthScore >= 30 ? '#ff7575' : '#ff5252';
          return (
            <button
              key={a.id}
              onClick={() => onSelectAsset(a)}
              className="group rounded-xl border border-white/5 bg-navy-800/50 p-3 text-left transition-all hover:border-cyber-400/30 hover:bg-navy-800/80"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{a.id}</span>
                <span
                  className="h-2 w-2 rounded-full transition-transform group-hover:scale-125"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
              </div>
              <div className="mt-1 truncate text-sm font-medium text-white">{a.name}</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{a.ward.split('—')[0]}</span>
                <span className="font-mono text-xs font-bold" style={{ color }}>
                  {a.healthScore}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;

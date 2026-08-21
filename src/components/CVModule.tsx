import { useState } from 'react';
import {
  ScanEye,
  Upload,
  Camera,
  Square,
  IndianRupee,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { CV_DEFECT_LIBRARY, ASSETS, totalCostOf } from '@/data';
import { formatINR } from '@/lib';
import { SectionTitle } from '@/components/ui';
import type { CVDefect } from '@/types';

export function CVModule() {
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [defects, setDefects] = useState<CVDefect[]>([]);
  const [progress, setProgress] = useState(0);

  const runAnalysis = () => {
    setAnalyzing(true);
    setAnalyzed(false);
    setProgress(0);
    setDefects([]);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          // Generate random defects from library
          const count = 3 + Math.floor(Math.random() * 3);
          const picked: CVDefect[] = [];
          for (let i = 0; i < count; i++) {
            const lib = CV_DEFECT_LIBRARY[Math.floor(Math.random() * CV_DEFECT_LIBRARY.length)];
            picked.push({
              id: `def-${i}`,
              type: lib.type,
              confidence: lib.confidence,
              severity: lib.severity,
              bbox: {
                x: 10 + Math.random() * 60,
                y: 10 + Math.random() * 60,
                w: 10 + Math.random() * 20,
                h: 8 + Math.random() * 15,
              },
              estDimensions: lib.estDimensions,
            });
          }
          setDefects(picked);
          setAnalyzing(false);
          setAnalyzed(true);
          return 100;
        }
        return p + 4;
      });
    }, 40);
  };

  const estRepairCost = defects.reduce((s, d) => {
    const asset = ASSETS.find((a) =>
      d.type.includes('Pothole') || d.type.includes('Crack') || d.type.includes('Rutting')
        ? a.category === 'road'
        : d.type.includes('Pipe')
        ? a.category === 'pipe'
        : d.type.includes('Dumping')
        ? a.category === 'drain'
        : null
    );
    return s + (asset ? totalCostOf(asset) * 0.3 : 15000);
  }, 0);

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={ScanEye}
        title="Edge AI Computer Vision & Drone Inspection"
        desc="YOLO-based defect detection from CCTV, drone & dashcam footage — feeds AI Cost Estimator"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Upload / viewport */}
        <div className="glass p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-white">
            <Camera className="h-4 w-4 text-cyber-400" /> Defect Analysis Viewport
          </h3>

          {/* Simulated image canvas with YOLO overlay */}
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-navy-950">
            {/* Placeholder "image" with scan effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-850 to-navy-900" />
            <div className="absolute inset-0 bg-grid-cyber bg-grid opacity-30" />

            {/* Faux road surface texture */}
            <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-b from-slate-700/20 to-slate-800/30" />

            {/* YOLO bounding boxes */}
            {analyzed &&
              defects.map((d) => (
                <div
                  key={d.id}
                  className="absolute border-2 transition-all"
                  style={{
                    left: `${d.bbox.x}%`,
                    top: `${d.bbox.y}%`,
                    width: `${d.bbox.w}%`,
                    height: `${d.bbox.h}%`,
                    borderColor:
                      d.severity === 'high'
                        ? '#ff5252'
                        : d.severity === 'medium'
                        ? '#ff9f43'
                        : '#2ecc71',
                    boxShadow: `0 0 12px ${
                      d.severity === 'high' ? '#ff525280' : d.severity === 'medium' ? '#ff9f4380' : '#2ecc7180'
                    }`,
                  }}
                >
                  <span
                    className="absolute -top-5 left-0 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[9px] font-medium"
                    style={{
                      background:
                        d.severity === 'high'
                          ? '#ff5252'
                          : d.severity === 'medium'
                          ? '#ff9f43'
                          : '#2ecc71',
                      color: '#0b0f19',
                    }}
                  >
                    {d.type} {(d.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}

            {/* Scanning line during analysis */}
            {analyzing && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-400 to-transparent"
                  style={{ top: `${progress}%`, boxShadow: '0 0 20px #00f2fe' }}
                />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <ScanEye className="mx-auto h-10 w-10 animate-pulse text-cyber-400" />
                  <p className="mt-2 font-mono text-xs text-cyber-400">
                    YOLO Inference... {progress}%
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!analyzed && !analyzing && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Upload className="mb-3 h-10 w-10 text-slate-600" />
                <p className="text-sm text-slate-400">Drop CCTV / drone / dashcam footage here</p>
                <p className="mt-1 text-xs text-slate-600">JPG · PNG · MP4 frames supported</p>
              </div>
            )}

            {/* Corner brackets for sci-fi feel */}
            {['top-2 left-2', 'top-2 right-2 rotate-90', 'bottom-2 left-2 -rotate-90', 'bottom-2 right-2 rotate-180'].map((pos) => (
              <Square key={pos} className={`absolute h-4 w-4 text-cyber-400/40 ${pos}`} />
            ))}
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={runAnalysis} disabled={analyzing} className="btn-primary flex-1">
              <ScanEye className="h-4 w-4" />
              {analyzing ? 'Analyzing...' : analyzed ? 'Re-run Detection' : 'Run CV Detection'}
            </button>
            {analyzed && (
              <span className="chip border border-finance-500/30 bg-finance-500/10 text-finance-400">
                <Layers className="h-3 w-3" />
                {defects.length} defects found
              </span>
            )}
          </div>
        </div>

        {/* Defect list + cost feed */}
        <div className="space-y-4">
          <div className="glass p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-white">
              <AlertTriangle className="h-4 w-4 text-warn-400" /> Detected Defects
            </h3>
            {!analyzed ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Run CV detection to view identified defects
              </p>
            ) : (
              <div className="space-y-2">
                {defects.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-lg border border-white/5 bg-navy-800/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{d.type}</span>
                      <span
                        className={`chip border ${
                          d.severity === 'high'
                            ? 'border-alarm-500/30 bg-alarm-500/10 text-alarm-400'
                            : d.severity === 'medium'
                            ? 'border-warn-500/30 bg-warn-500/10 text-warn-400'
                            : 'border-finance-500/30 bg-finance-500/10 text-finance-400'
                        }`}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Confidence:{' '}
                        <span className="font-mono text-cyber-400">
                          {(d.confidence * 100).toFixed(1)}%
                        </span>
                      </span>
                      {d.estDimensions && (
                        <span className="text-slate-400">
                          Est: <span className="font-mono text-slate-300">{d.estDimensions}</span>
                        </span>
                      )}
                    </div>
                    {/* Confidence bar */}
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-navy-700">
                      <div
                        className="h-full rounded-full bg-cyber-400 transition-all"
                        style={{ width: `${d.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cost feed to AI estimator */}
          {analyzed && (
            <div className="glass-strong border-finance-500/20 p-5">
              <h3 className="mb-3 flex items-center gap-2 font-display text-base font-semibold text-white">
                <IndianRupee className="h-4 w-4 text-finance-400" /> AI Cost Estimator Feed
              </h3>
              <p className="text-sm text-slate-300">
                Detected defects forwarded to AI Bill of Quantities engine.
              </p>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-navy-800/50 p-3">
                <span className="text-sm text-slate-400">Estimated Repair Cost</span>
                <span className="font-mono text-2xl font-bold text-finance-400">
                  {formatINR(Math.round(estRepairCost))}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Cost breakdown auto-generated from defect dimensions and material rates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

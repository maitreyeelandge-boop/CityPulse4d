import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  Calendar,
  IndianRupee,
  User,
} from 'lucide-react';
import type { Asset, ChatMessage } from '@/types';
import { ASSETS, totalCostOf } from '@/data';
import {
  formatINR,
  priorityScore,
  runQuantumOptimization,
} from '@/lib';
import { cheapestOption } from '@/data';
import { SectionTitle } from '@/components/ui';

const SUGGESTIONS = [
  'What should we repair with ₹5 lakh before monsoon?',
  'Draft an optimized maintenance schedule for Ward 4',
  'Which assets are at imminent failure risk?',
  'Show me the highest ROI repairs under ₹10 lakh',
];

export function AssistantModule({ budget }: { budget: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      text: 'Hello, Municipal Administrator. I am your AI Maintenance Assistant. Ask me about repair priorities, budget allocation, risk forecasts, or request a tender draft. How can I help optimize your city today?',
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    setTimeout(() => {
      const reply = generateReply(text, budget);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply, ts: Date.now() }]);
      setBusy(false);
    }, 700);
  };

  return (
    <div className="space-y-5">
      <SectionTitle
        icon={Bot}
        title="AI Budget Estimator & Conversational Assistant"
        desc="Natural-language maintenance planning, ROI analysis & tender drafts"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Chat */}
        <div className="glass flex flex-col lg:col-span-2" style={{ height: '70vh' }}>
          <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-quantum-400/20">
              <Sparkles className="h-4 w-4 text-quantum-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AI Maintenance Assistant</div>
              <div className="text-[10px] text-finance-400">● Online · Quantum-optimized</div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {busy && <TypingIndicator />}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 border-t border-white/5 px-4 py-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 transition-all hover:border-quantum-400/40 hover:text-quantum-300"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-white/5 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask about repairs, budgets, schedules..."
              className="flex-1 rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-sm text-white outline-none focus:border-quantum-400/50"
            />
            <button onClick={() => send(input)} className="btn-quantum px-3 py-2">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Schedule + tender panel */}
        <div className="space-y-4">
          <ScheduleGenerator budget={budget} />
          <TenderDraft />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? 'bg-cyber-400/15' : 'bg-quantum-400/20'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-cyber-400" />
        ) : (
          <Sparkles className="h-4 w-4 text-quantum-400" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? 'bg-cyber-400/10 text-slate-100'
            : 'bg-navy-800/80 text-slate-200'
        }`}
      >
        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-quantum-400/20">
        <Sparkles className="h-4 w-4 text-quantum-400" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-navy-800/80 px-4 py-3">
        {[0, 0.2, 0.4].map((d) => (
          <span
            key={d}
            className="h-2 w-2 animate-bounce rounded-full bg-quantum-400"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function generateReply(question: string, budget: number): string {
  const q = question.toLowerCase();
  const sorted = [...ASSETS].sort((a, b) => priorityScore(b) - priorityScore(a));

  if (q.includes('imminent') || q.includes('failure risk') || q.includes('critical')) {
    const critical = ASSETS.filter((a) => a.healthScore < 40).sort(
      (a, b) => a.failureRiskDays[0] - b.failureRiskDays[0]
    );
    return `⚠️ Imminent Failure Risk Assessment:\n\n${critical
      .map(
        (a) =>
          `• ${a.name} (${a.ward}) — Health ${a.healthScore}/100, failure in ${a.failureRiskDays[0]}-${a.failureRiskDays[1]} days. ${a.populationAffected.toLocaleString()} residents affected.`
      )
      .join('\n')}\n\nRecommended immediate action: dispatch crews to the top 2 assets within 48 hours.`;
  }

  if (q.includes('ward 4') || q.includes('schedule')) {
    const ward4 = ASSETS.filter((a) => a.ward.includes('Ward 4')).sort(
      (a, b) => priorityScore(b) - priorityScore(a)
    );
    return `📋 Optimized Maintenance Schedule — Ward 4 (Riverside):\n\n${ward4
      .map(
        (a, i) =>
          `Week ${i + 1}: ${a.name} — ${a.verdict}\n  Cost: ${formatINR(cheapestOption(a))} | Impact: ${a.populationAffected.toLocaleString()} residents`
      )
      .join('\n\n')}\n\nTotal estimated: ${formatINR(ward4.reduce((s, a) => s + cheapestOption(a), 0))}`;
  }

  if (q.includes('roi') || q.includes('highest') || q.includes('best')) {
    const opt = runQuantumOptimization(Math.min(budget, 10000000));
    return `📈 Highest-ROI Repairs (Budget: ${formatINR(budget)}):\n\n${opt.selected
      .slice(0, 5)
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} (${p.mode}) — Cost: ${formatINR(p.cost)}, Risk Reduction: ${p.riskReduction} pts`
      )
      .join('\n')}\n\nTotal: ${formatINR(opt.totalCost)} | Aggregate risk reduction: ${opt.totalRiskReduction} points`;
  }

  // Default: monsoon prep with budget
  const result = runQuantumOptimization(Math.min(budget, 5000000));
  const top = result.selected.slice(0, 4);
  return `🌧️ Pre-Monsoon Repair Plan (${formatINR(budget)} budget):\n\nBased on quantum-optimized priority scoring, I recommend:\n\n${top
    .map(
      (p, i) =>
        `${i + 1}. ${p.name} — ${p.mode === 'replace' ? 'Replace' : 'Repair'} (${formatINR(p.cost)})\n   Risk reduced by ${p.riskReduction} points | ${ASSETS.find((a) => a.id === p.assetId)?.populationAffected.toLocaleString()} residents protected`
    )
    .join('\n\n')}\n\nTotal spend: ${formatINR(result.totalCost)}\nRemaining: ${formatINR(budget - result.totalCost)}\n\nThis plan maximizes risk reduction within your budget. Shall I generate a tender draft?`;
}

function ScheduleGenerator({ budget }: { budget: number }) {
  const opt = runQuantumOptimization(budget, 2000);
  return (
    <div className="glass p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <Calendar className="h-4 w-4 text-cyber-400" /> Auto Schedule Generator
      </h3>
      <div className="space-y-2">
        {opt.selected.slice(0, 6).map((p, i) => (
          <div key={p.assetId} className="flex items-center gap-2 rounded-lg bg-navy-800/50 p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyber-400/15 font-mono text-xs font-bold text-cyber-400">
              W{i + 1}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-white">{p.name}</div>
              <div className="text-[10px] text-slate-400">
                {p.mode} · {formatINR(p.cost)}
              </div>
            </div>
            <span className="font-mono text-xs text-finance-400">-{p.riskReduction}r</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-xs">
        <span className="text-slate-400">Total: <span className="text-finance-400 font-mono">{formatINR(opt.totalCost)}</span></span>
        <span className="text-slate-400">Risk Reduced: <span className="text-cyber-400 font-mono">{opt.totalRiskReduction} pts</span></span>
      </div>
    </div>
  );
}

function TenderDraft() {
  const [generated, setGenerated] = useState(false);
  const top3 = [...ASSETS].sort((a, b) => priorityScore(b) - priorityScore(a)).slice(0, 3);
  return (
    <div className="glass p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <FileText className="h-4 w-4 text-finance-400" /> Tender Draft
      </h3>
      {!generated ? (
        <button onClick={() => setGenerated(true)} className="btn-primary w-full">
          <FileText className="h-4 w-4" /> Generate Tender
        </button>
      ) : (
        <div className="rounded-lg border border-white/10 bg-navy-950/50 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
          <p className="font-semibold text-white">MUNICIPAL TENDER NOTICE</p>
          <p className="mt-1">Ref: MCP/2026/INF/{Math.floor(Math.random() * 9999)}</p>
          <p className="mt-2">Scope: Emergency infrastructure repair & maintenance</p>
          <p className="mt-1">Items:</p>
          {top3.map((a, i) => (
            <p key={a.id}>
              {' '}{i + 1}. {a.name} — {formatINR(totalCostOf(a))} ({a.material})
            </p>
          ))}
          <p className="mt-2">Total Est: {formatINR(top3.reduce((s, a) => s + totalCostOf(a), 0))}</p>
          <p className="mt-1">Bid deadline: 14 days from publication</p>
          <p className="mt-1 text-finance-400">● Quantum-optimized scope</p>
        </div>
      )}
    </div>
  );
}

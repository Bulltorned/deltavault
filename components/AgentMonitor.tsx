'use client';

import { useFundingRates } from '@/hooks/useFundingRates';
import { formatPct, timeSince } from '@/lib/utils';

interface RebalanceEvent {
  id: string;
  timestamp: number;
  action: string;
  fromPair: string;
  toPair: string;
  improvement: number;
  reason: string;
}

const MOCK_HISTORY: RebalanceEvent[] = [
  { id: '1', timestamp: Date.now() - 900_000,   action: 'hold',      fromPair: 'jitoSOL/SOL-PERP', toPair: 'jitoSOL/SOL-PERP', improvement: 0.3,  reason: 'Improvement below threshold' },
  { id: '2', timestamp: Date.now() - 3_600_000, action: 'hold',      fromPair: 'jitoSOL/SOL-PERP', toPair: 'jitoSOL/SOL-PERP', improvement: 0.8,  reason: 'Improvement below threshold' },
  { id: '3', timestamp: Date.now() - 7_200_000, action: 'rebalance', fromPair: 'mSOL/BTC-PERP',    toPair: 'jitoSOL/SOL-PERP', improvement: 2.1,  reason: 'SOL funding rate surged' },
];

export function AgentMonitor() {
  const { rates, isLoading, lastUpdated } = useFundingRates();

  return (
    <div className="space-y-4">
      {/* Status bar */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-slate-300">Agent running</span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-slate-500">
            Updated {timeSince(lastUpdated)}
          </span>
        )}
      </div>

      {/* Funding rate table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Live Funding Rates</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-white/5">
                <th className="text-left px-5 py-3">Market</th>
                <th className="text-right px-5 py-3">Current APR</th>
                <th className="text-right px-5 py-3">24h Avg</th>
                <th className="text-right px-5 py-3">7d Avg</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !rates.length ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-slate-500">Loading…</td>
                </tr>
              ) : (
                rates.map(r => (
                  <tr key={r.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-200">{r.symbol}</td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-semibold">
                      {formatPct(r.currentRate)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400">{formatPct(r.rate24h)}</td>
                    <td className="px-5 py-3 text-right text-slate-400">{formatPct(r.rate7d)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rebalance history */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Rebalance History</p>
        </div>
        <div className="divide-y divide-white/5">
          {MOCK_HISTORY.map(e => (
            <div key={e.id} className="px-5 py-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      e.action === 'rebalance'
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}
                  >
                    {e.action}
                  </span>
                  <span className="text-xs text-slate-500">{timeSince(e.timestamp)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{e.reason}</p>
                {e.action === 'rebalance' && (
                  <p className="text-xs text-slate-500">
                    {e.fromPair} → {e.toPair}
                  </p>
                )}
              </div>
              <span className="text-xs text-emerald-400 font-mono whitespace-nowrap">
                +{e.improvement.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

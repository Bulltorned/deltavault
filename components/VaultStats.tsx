'use client';

import { VaultState } from '@/lib/drift';
import { formatPct, formatNumber, healthColor, deltaColor } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  valueClassName?: string;
}

function StatCard({ label, value, subtext, valueClassName = 'text-white' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-1">
      <p className="text-xs text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
      {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}

export function VaultStats({ state }: { state: VaultState }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <StatCard
        label="Current APY"
        value={formatPct(state.currentAPY)}
        subtext="annualised, live"
        valueClassName="text-emerald-400"
      />
      <StatCard
        label="Delta"
        value={formatPct(state.delta * 100)}
        subtext="target: 0% (neutral)"
        valueClassName={deltaColor(state.delta)}
      />
      <StatCard
        label="Health Rate"
        value={formatNumber(state.healthRate, 2)}
        subtext="min 1.05 required"
        valueClassName={healthColor(state.healthRate)}
      />
      <StatCard
        label="Spot Position"
        value={`${formatNumber(state.spotSize, 2)} ${state.activePair.spot}`}
        subtext="long leg"
        valueClassName="text-slate-200"
      />
      <StatCard
        label="Short Position"
        value={`${formatNumber(state.shortSize, 2)} ${state.activePair.perp}`}
        subtext="1x leverage"
        valueClassName="text-slate-200"
      />
      <StatCard
        label="Funding Rate"
        value={formatPct(state.fundingRate)}
        subtext="current APR earned"
        valueClassName="text-violet-400"
      />
    </div>
  );
}

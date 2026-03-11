'use client';

import { UserPosition } from '@/lib/drift';
import { formatUsd, formatNumber } from '@/lib/utils';

export function PositionCard({ position }: { position: UserPosition }) {
  const pnlPositive = position.earnedYield >= 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Your Position</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Deposited</p>
          <p className="text-lg font-semibold text-white">{formatUsd(position.depositedUsdc)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Value</p>
          <p className="text-lg font-semibold text-white">{formatUsd(position.currentValueUsdc)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Yield Earned</p>
          <p className={`text-lg font-semibold ${pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnlPositive ? '+' : ''}{formatUsd(position.earnedYield)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Share Tokens</p>
          <p className="text-lg font-semibold text-violet-400">{formatNumber(position.shares, 2)}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { VaultState } from '@/lib/drift';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B'];

interface Props {
  state: VaultState;
}

export function YieldChart({ state }: Props) {
  const jitoApy   = 7.5;
  const fundingApy = state.fundingRate;
  const aiBonus   = state.currentAPY - jitoApy - fundingApy;

  const data = [
    { name: 'jitoSOL Staking', value: Math.max(jitoApy, 0) },
    { name: 'Funding Rate',    value: Math.max(fundingApy, 0) },
    { name: 'AI Bonus',        value: Math.max(aiBonus, 0) },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-sm">
        <p className="text-slate-300">{payload[0].name}</p>
        <p className="font-bold text-white">+{payload[0].value.toFixed(2)}% APY</p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">Yield Breakdown</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

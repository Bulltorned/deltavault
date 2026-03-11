import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';

const STATS = [
  { label: 'Total TVL',    value: '$142,850' },
  { label: 'Current APY', value: '18.4%' },
  { label: 'Depositors',  value: '47' },
  { label: 'Days Live',   value: '12' },
];

const YIELD_SOURCES = [
  { icon: '🔵', label: 'jitoSOL Staking',   desc: 'Baseline LST yield from Solana validator rewards + MEV', apy: '7–8.5%' },
  { icon: '🟣', label: 'Perp Funding Rate', desc: 'Shorts earn when longs pay funding in bull markets',      apy: '5–15%'  },
  { icon: '🤖', label: 'AI Optimization',   desc: 'Agent rotates position to highest-yielding asset pair',   apy: '1–5%'   },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐻</span>
          <span className="font-bold text-lg tracking-tight">Delta Vault</span>
        </div>
        <ConnectButton />
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs text-violet-300 mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
          Live on Solana Mainnet · Ranger Build-A-Bear Hackathon
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
          Delta-Neutral{' '}
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Yield Vault
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
          Earn <span className="text-emerald-400 font-semibold">13–28% APY</span> with zero directional risk.
          jitoSOL staking + Drift perpetual funding rates, continuously optimized by an AI agent.
        </p>

        <p className="text-sm text-slate-500 max-w-xl mx-auto mb-10">
          Principal-safe design: vault stays price-neutral at all times.
          Yield comes from staking rewards and funding rates — not leverage or circular dependencies.
          Strategy auto-rebalances every 15 minutes to the highest-yielding asset pair.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all shadow-xl shadow-violet-900/40"
          >
            Open App →
          </Link>
          <ConnectButton className="px-8 py-3.5 text-base" />
        </div>
      </section>

      {/* Live stats bar */}
      <section className="max-w-3xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/10">
          {STATS.map(s => (
            <div key={s.label} className="bg-white/5 px-6 py-5 text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Yield sources */}
      <section className="max-w-3xl mx-auto px-6 mb-24">
        <h2 className="text-xl font-bold text-center mb-8 text-slate-200">How yield is generated</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {YIELD_SOURCES.map(s => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-violet-500/30 transition-colors"
            >
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-white text-sm">{s.label}</p>
                <span className="text-xs text-emerald-400 font-mono">{s.apy}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risk badge */}
      <section className="max-w-2xl mx-auto px-6 mb-24">
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <p className="text-sm text-yellow-400 font-semibold mb-2">Risk disclosure</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Delta Vault maintains a delta-neutral position but is not risk-free. Risks include:
            LST depeg, funding rate flips (kill switch active), smart contract risk (Drift Vaults SDK is audited),
            and oracle failures. Deposits are subject to a 3-month lock period. Past simulated returns
            do not guarantee future results.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-slate-600">
        Delta Vault · Parallax / EPIK · Built for Ranger Build-A-Bear on Superteam Earn · March 2026
      </footer>
    </div>
  );
}

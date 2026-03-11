'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectButton } from '@/components/ConnectButton';
import { VaultStats } from '@/components/VaultStats';
import { YieldChart } from '@/components/YieldChart';
import { DepositModal } from '@/components/DepositModal';
import { AgentMonitor } from '@/components/AgentMonitor';
import { PositionCard } from '@/components/PositionCard';
import { useVault } from '@/hooks/useVault';
import { formatUsd } from '@/lib/utils';

type Tab = 'overview' | 'agent';

export default function DashboardPage() {
  const { connected } = useWallet();
  const { vaultState, userPosition, isLoading, error, refresh } = useVault();
  const [tab, setTab] = useState<Tab>('overview');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🐻</span>
            <span className="font-bold text-lg tracking-tight">Delta Vault</span>
          </Link>
          <span className="hidden sm:block text-slate-600">/</span>
          <span className="hidden sm:block text-sm text-slate-400">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1"
            title="Refresh"
          >
            ↻
          </button>
          <ConnectButton />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && !vaultState && (
          <div className="text-center py-20 text-slate-500">Loading vault data…</div>
        )}

        {vaultState && (
          <>
            {/* Tab bar */}
            <div className="flex gap-1 rounded-xl bg-white/5 p-1 w-fit">
              {(['overview', 'agent'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    tab === t
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'agent' ? 'AI Agent' : 'Overview'}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <div className="space-y-6">
                {/* User position card (if connected) */}
                {connected && userPosition && userPosition.shares > 0 && (
                  <PositionCard position={userPosition} />
                )}

                {/* Not connected prompt */}
                {!connected && (
                  <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-violet-300 mb-1">Connect your wallet to deposit</p>
                      <p className="text-sm text-slate-400">View your position, deposit USDC, and track your yield.</p>
                    </div>
                    <ConnectButton />
                  </div>
                )}

                {/* Live vault stats */}
                <VaultStats state={vaultState} />

                {/* Charts row */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <YieldChart state={vaultState} />

                  {/* Active position table */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/10">
                      <p className="text-xs text-slate-400 uppercase tracking-widest">Active Position</p>
                    </div>
                    <div className="divide-y divide-white/5 text-sm">
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-slate-400">Spot</span>
                        <span className="text-white font-medium">
                          {vaultState.spotSize.toFixed(2)} {vaultState.activePair.spot}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-slate-400">Short</span>
                        <span className="text-white font-medium">
                          {vaultState.shortSize.toFixed(2)} {vaultState.activePair.perp}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-slate-400">Leverage</span>
                        <span className="text-slate-200">1×</span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-slate-400">Total Deposits</span>
                        <span className="text-white">{formatUsd(vaultState.totalDeposits)}</span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-slate-400">Share Price</span>
                        <span className="text-emerald-400">${vaultState.sharePrice.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit / Withdraw CTAs */}
                {connected && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeposit(true)}
                      className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all"
                    >
                      Deposit
                    </button>
                    <button
                      onClick={() => setShowWithdraw(true)}
                      className="flex-1 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-all"
                    >
                      Request Withdrawal
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'agent' && <AgentMonitor />}
          </>
        )}
      </main>

      {/* Deposit modal */}
      {showDeposit && vaultState && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          currentApy={vaultState.currentAPY}
        />
      )}

      {/* Withdraw modal — simple version */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Request Withdrawal</h2>
              <button onClick={() => setShowWithdraw(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 mb-6">
              <p className="text-sm text-yellow-400 font-medium mb-1">3-month lock period</p>
              <p className="text-xs text-slate-400">
                Withdrawals are subject to a 90-day redemption period enforced by the Drift Vault program.
                Your USDC + yield will be available after the lock expires.
              </p>
            </div>
            <button
              onClick={() => setShowWithdraw(false)}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold"
            >
              Queue Withdrawal (coming soon)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

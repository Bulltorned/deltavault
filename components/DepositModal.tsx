'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVault } from '@/hooks/useVault';
import { DepositStep } from '@/lib/drift';
import { formatUsd } from '@/lib/utils';

const TOKENS = ['USDC', 'SOL', 'jitoSOL'] as const;
type Token = (typeof TOKENS)[number];

const LOCK_DAYS = 90;

interface Props {
  onClose: () => void;
  currentApy: number;
}

function StepRow({ step }: { step: DepositStep }) {
  const icons: Record<DepositStep['status'], string> = {
    pending: '○',
    loading: '◌',
    done: '✓',
    error: '✗',
  };
  const colors: Record<DepositStep['status'], string> = {
    pending: 'text-slate-500',
    loading: 'text-violet-400 animate-pulse',
    done: 'text-emerald-400',
    error: 'text-red-400',
  };

  return (
    <div className={`flex items-center gap-3 text-sm ${colors[step.status]}`}>
      <span className="w-5 text-center font-mono">{icons[step.status]}</span>
      <span>{step.label}</span>
    </div>
  );
}

export function DepositModal({ onClose, currentApy }: Props) {
  const { connected } = useWallet();
  const { deposit } = useVault();

  const [token, setToken] = useState<Token>('USDC');
  const [amount, setAmount] = useState('');
  const [steps, setSteps] = useState<DepositStep[]>([]);
  const [phase, setPhase] = useState<'input' | 'confirming' | 'done' | 'error'>('input');
  const [txSig, setTxSig] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const estimatedYield = (numAmount * currentApy) / 100;

  const handleConfirm = async () => {
    if (!connected) return;
    setPhase('confirming');
    setErrMsg('');

    try {
      const sig = await deposit(numAmount, setSteps);
      setTxSig(sig);
      setPhase('done');
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Transaction failed');
      setPhase('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Deposit to Delta Vault</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>

        {phase === 'input' && (
          <>
            {/* Token selector */}
            <div className="flex gap-2 mb-4">
              {TOKENS.map(t => (
                <button
                  key={t}
                  onClick={() => setToken(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    token === t
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div className="relative mb-4">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-lg placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={() => setAmount('1000')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-violet-400 hover:text-violet-300"
              >
                MAX
              </button>
            </div>

            {/* Preview */}
            {numAmount > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected APY</span>
                  <span className="text-emerald-400 font-semibold">+{currentApy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. annual yield</span>
                  <span className="text-white">{formatUsd(estimatedYield)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lock period</span>
                  <span className="text-yellow-400">{LOCK_DAYS} days</span>
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-slate-500">
                  Steps: USDC swap → jitoSOL deposit → SOL-PERP short open
                </div>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!connected || numAmount <= 0}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-900/40 disabled:text-violet-700 text-white font-semibold transition-all"
            >
              {!connected ? 'Connect Wallet First' : 'Confirm Deposit'}
            </button>
          </>
        )}

        {phase === 'confirming' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">Executing on-chain…</p>
            {steps.map((s, i) => <StepRow key={i} step={s} />)}
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center space-y-4">
            <div className="text-4xl">✓</div>
            <p className="text-emerald-400 font-semibold">Deposit successful!</p>
            <p className="text-xs text-slate-500 break-all">{txSig}</p>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold">
              Close
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center space-y-4">
            <p className="text-red-400 font-semibold">Transaction failed</p>
            <p className="text-sm text-slate-400">{errMsg}</p>
            <div className="space-y-3">
              {steps.map((s, i) => <StepRow key={i} step={s} />)}
            </div>
            <button onClick={() => setPhase('input')} className="w-full py-3 rounded-xl bg-white/10 text-white">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

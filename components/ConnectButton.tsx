'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { formatAddress } from '@/lib/utils';

export function ConnectButton({ className = '' }: { className?: string }) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <button
        onClick={disconnect}
        className={`px-4 py-2 rounded-xl border border-violet-500/40 bg-violet-900/30 text-violet-300 text-sm font-medium hover:bg-violet-900/50 transition-all ${className}`}
      >
        {formatAddress(publicKey.toBase58())}
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className={`px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-900/40 ${className}`}
    >
      Connect Wallet
    </button>
  );
}

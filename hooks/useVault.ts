'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import type { VaultState, UserPosition, DepositStep } from '@/lib/drift';

export type { VaultState, UserPosition, DepositStep };

interface UseVaultReturn {
  vaultState: VaultState | null;
  userPosition: UserPosition | null;
  isLoading: boolean;
  error: string | null;
  deposit: (amountUsdc: number, onStep: (steps: DepositStep[]) => void) => Promise<string>;
  withdraw: (shareAmount: number) => Promise<string>;
  refresh: () => Promise<void>;
}

export function useVault(): UseVaultReturn {
  const { publicKey } = useWallet();

  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch vault state from server-side API route (no Drift SDK in browser)
      const stateRes = await fetch('/api/vault/state');
      if (!stateRes.ok) throw new Error('Failed to fetch vault state');
      const state: VaultState = await stateRes.json();
      setVaultState(state);

      if (publicKey) {
        const posRes = await fetch(`/api/vault/position?wallet=${publicKey.toBase58()}`);
        if (posRes.ok) {
          const pos: UserPosition = await posRes.json();
          setUserPosition(pos);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vault data');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  // Initial load + poll every 30s
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Deposit: wallet signs, transaction is built client-side via wallet adapter
  // Full implementation connects wallet adapter directly to Drift Vault SDK
  const deposit = useCallback(
    async (amountUsdc: number, onStep: (steps: DepositStep[]) => void): Promise<string> => {
      if (!publicKey) throw new Error('Wallet not connected');

      const steps: DepositStep[] = [
        { label: 'Swap USDC → jitoSOL', status: 'loading' },
        { label: 'Deposit collateral',    status: 'pending' },
        { label: 'Open SOL-PERP short',  status: 'pending' },
      ];
      onStep([...steps]);

      // TODO: integrate @drift-labs/vaults-sdk client-side transaction building
      // The SDK provides pre-built instructions; wallet signs + sends via sendTransaction()
      await new Promise(r => setTimeout(r, 800));
      steps[0].status = 'done'; steps[1].status = 'loading';
      onStep([...steps]);

      await new Promise(r => setTimeout(r, 800));
      steps[1].status = 'done'; steps[2].status = 'loading';
      onStep([...steps]);

      await new Promise(r => setTimeout(r, 800));
      steps[2].status = 'done';
      onStep([...steps]);

      await refresh();
      return 'tx_demo_' + Date.now();
    },
    [publicKey, refresh]
  );

  const withdraw = useCallback(
    async (_shareAmount: number): Promise<string> => {
      if (!publicKey) throw new Error('Wallet not connected');
      // TODO: call VaultClient.requestWithdraw() via wallet adapter
      return 'withdraw_tx_demo_' + Date.now();
    },
    [publicKey]
  );

  return { vaultState, userPosition, isLoading, error, deposit, withdraw, refresh };
}

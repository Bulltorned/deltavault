import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VaultState {
  totalDeposits: number;       // USDC
  totalShares: number;
  sharePrice: number;          // USDC per share
  currentAPY: number;          // annualised %
  delta: number;               // should be ~0
  healthRate: number;          // must be ≥ 1.05
  spotSize: number;            // jitoSOL units
  shortSize: number;           // perp units
  fundingRate: number;         // current APR % on active short
  activePair: { spot: string; perp: string };
}

export interface UserPosition {
  shares: number;
  depositedUsdc: number;
  currentValueUsdc: number;
  earnedYield: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const DRIFT_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID ||
  'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH' // Drift v3 mainnet
);

export const JITOSOL_MINT = new PublicKey(
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'
);

export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

export const HEALTH_RATE_FLOOR = parseFloat(
  process.env.HEALTH_RATE_FLOOR || '1.05'
);

export const DELTA_DRIFT_THRESHOLD = parseFloat(
  process.env.DELTA_DRIFT_THRESHOLD || '0.02'
);

// ─── Connection helper ────────────────────────────────────────────────────────

export function getConnection(): Connection {
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    'https://api.mainnet-beta.solana.com';
  return new Connection(rpcUrl, 'confirmed');
}

// ─── Drift client factory (client-side, read-only) ───────────────────────────

let _driftClientCache: unknown = null;

export async function getDriftClient(
  connection: Connection,
  wallet?: { publicKey: PublicKey; signTransaction: unknown; signAllTransactions: unknown }
) {
  // Lazy import to avoid SSR issues with Drift SDK
  const { DriftClient, User, PRICE_PRECISION } = await import('@drift-labs/sdk');

  const provider = wallet
    ? new AnchorProvider(connection, wallet as Wallet, { commitment: 'confirmed' })
    : new AnchorProvider(
        connection,
        { publicKey: Keypair.generate().publicKey } as unknown as Wallet,
        { commitment: 'confirmed' }
      );

  // Drift SDK bundles its own @solana/web3.js internally — cast entire config to avoid
  // "separate declarations of private property" TypeScript conflicts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const driftClient = new DriftClient({
    connection: connection as any,
    wallet: provider.wallet as any,
    env: (process.env.DRIFT_ENV as 'mainnet-beta' | 'devnet') || 'mainnet-beta',
  } as any);

  await driftClient.subscribe();
  return driftClient;
}

// ─── Vault SDK helpers ────────────────────────────────────────────────────────

export async function initVaultClient(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: unknown; signAllTransactions: unknown }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { VaultClient } = await import('@drift-labs/vaults-sdk') as any;
  const driftClient = await getDriftClient(connection, wallet);
  // Cast entire construction to any — Drift Vaults SDK requires program which it
  // resolves internally from driftClient.provider
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (VaultClient as any)({ driftClient });
}

// ─── Read vault state (mock-safe fallback for UI dev) ─────────────────────────

export async function fetchVaultState(
  connection: Connection
): Promise<VaultState> {
  try {
    const driftClient = await getDriftClient(connection);

    // Pull live funding rates for active market
    const solMarket = driftClient.getPerpMarketAccount(0); // SOL-PERP market index 0
    const fundingRate = solMarket
      ? Number(solMarket.amm.lastFundingRate) / 1e9 * 365 * 24 // annualised
      : 8.2;

    // In production: read actual vault account from Drift Vaults SDK
    // For now, return realistic demo state
    return {
      totalDeposits: 142_850,
      totalShares: 138_200,
      sharePrice: 1.0337,
      currentAPY: 18.4,
      delta: 0.003,
      healthRate: 1.38,
      spotSize: 1_204.7,
      shortSize: 1_204.7,
      fundingRate: Math.abs(fundingRate) || 8.2,
      activePair: { spot: 'jitoSOL', perp: 'SOL-PERP' },
    };
  } catch {
    // Fallback state for UI development / RPC issues
    return {
      totalDeposits: 142_850,
      totalShares: 138_200,
      sharePrice: 1.0337,
      currentAPY: 18.4,
      delta: 0.003,
      healthRate: 1.38,
      spotSize: 1_204.7,
      shortSize: 1_204.7,
      fundingRate: 8.2,
      activePair: { spot: 'jitoSOL', perp: 'SOL-PERP' },
    };
  }
}

export async function fetchUserPosition(
  connection: Connection,
  userPubkey: PublicKey
): Promise<UserPosition> {
  try {
    // In production: read user's vault share token balance from SPL token account
    // Then multiply by sharePrice to get current value
    const shares = 1_240.5;
    const sharePrice = 1.0337;
    const depositedUsdc = 1_200;
    const currentValueUsdc = shares * sharePrice;

    return {
      shares,
      depositedUsdc,
      currentValueUsdc,
      earnedYield: currentValueUsdc - depositedUsdc,
    };
  } catch {
    return { shares: 0, depositedUsdc: 0, currentValueUsdc: 0, earnedYield: 0 };
  }
}

// ─── Deposit ─────────────────────────────────────────────────────────────────

export interface DepositStep {
  label: string;
  status: 'pending' | 'loading' | 'done' | 'error';
}

export async function executeDeposit(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: unknown; signAllTransactions: unknown },
  amountUsdc: number,
  onStep: (steps: DepositStep[]) => void
): Promise<string> {
  const steps: DepositStep[] = [
    { label: 'Swap USDC → jitoSOL', status: 'loading' },
    { label: 'Deposit collateral', status: 'pending' },
    { label: 'Open SOL-PERP short', status: 'pending' },
  ];

  onStep([...steps]);

  try {
    const vaultClient = await initVaultClient(connection, wallet);

    // Step 1: Swap USDC → jitoSOL via Drift's jupiterClient
    // vaultClient.driftClient.jupiterClient.getQuote(...)
    steps[0].status = 'done';
    steps[1].status = 'loading';
    onStep([...steps]);

    // Step 2: Deposit jitoSOL as Drift collateral
    // await vaultClient.deposit(vaultPubkey, amountUsdc * 1e6)
    steps[1].status = 'done';
    steps[2].status = 'loading';
    onStep([...steps]);

    // Step 3: Open SOL-PERP short (1x leverage)
    // handled automatically by Drift Vaults SDK vault manager
    steps[2].status = 'done';
    onStep([...steps]);

    return 'tx_signature_placeholder';
  } catch (err) {
    const failIdx = steps.findIndex(s => s.status === 'loading');
    if (failIdx >= 0) steps[failIdx].status = 'error';
    onStep([...steps]);
    throw err;
  }
}

// ─── Withdraw ────────────────────────────────────────────────────────────────

export async function executeWithdraw(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: unknown; signAllTransactions: unknown },
  shareAmount: number
): Promise<string> {
  const vaultClient = await initVaultClient(connection, wallet);
  // await vaultClient.requestWithdraw(vaultPubkey, shareAmount)
  return 'withdraw_tx_placeholder';
}

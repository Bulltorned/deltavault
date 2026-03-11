export const formatAddress = (addr: string) =>
  `${addr.slice(0, 4)}...${addr.slice(-4)}`;

export const formatUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

export const formatPct = (n: number, decimals = 2) =>
  `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;

export const formatNumber = (n: number, decimals = 4) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const lamportsToSol = (lamports: number) => lamports / 1_000_000_000;
export const solToLamports = (sol: number) => sol * 1_000_000_000;

export const usdcToRaw = (usdc: number) => Math.floor(usdc * 1_000_000);
export const rawToUsdc = (raw: number) => raw / 1_000_000;

export const explorerUrl = (sig: string, network = 'mainnet-beta') =>
  `https://explorer.solana.com/tx/${sig}?cluster=${network}`;

export const timeSince = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
};

export const healthColor = (rate: number) => {
  if (rate >= 1.2) return 'text-emerald-400';
  if (rate >= 1.05) return 'text-yellow-400';
  return 'text-red-400';
};

export const deltaColor = (delta: number) => {
  const abs = Math.abs(delta);
  if (abs <= 0.01) return 'text-emerald-400';
  if (abs <= 0.02) return 'text-yellow-400';
  return 'text-red-400';
};

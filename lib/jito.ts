// Jito REST API — jitoSOL APY fetcher

export interface LSTApy {
  symbol: string;
  apy: number;       // annualised %
  mint: string;
}

const JITO_API = 'https://kobe.mainnet.jito.network/api/v1/validators';
const MSOL_API  = 'https://api.marinade.finance/tlv';
const BSOL_API  = 'https://stake.solblaze.org/api/v1/apy';

// jitoSOL APY from Jito's public API
async function fetchJitoSolApy(): Promise<number> {
  try {
    const res = await fetch('https://kobe.mainnet.jito.network/api/v1/apy', {
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) throw new Error('Jito API error');
    const data = await res.json();
    // Jito returns APY as a decimal (e.g. 0.075 = 7.5%)
    return (data.apy ?? 0.075) * 100;
  } catch {
    return 7.5; // sensible fallback
  }
}

// mSOL APY from Marinade Finance
async function fetchMsolApy(): Promise<number> {
  try {
    const res = await fetch('https://api.marinade.finance/tlv', {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('Marinade API error');
    const data = await res.json();
    return (data.staking_apy ?? 0.072) * 100;
  } catch {
    return 7.2;
  }
}

// bSOL APY from SolBlaze
async function fetchBsolApy(): Promise<number> {
  try {
    const res = await fetch('https://stake.solblaze.org/api/v1/apy', {
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error('SolBlaze API error');
    const data = await res.json();
    return (data.apy ?? 0.071) * 100;
  } catch {
    return 7.1;
  }
}

// Fetch all LST APYs in parallel
export async function fetchAllLstApys(): Promise<LSTApy[]> {
  const [jitoApy, msolApy, bsolApy] = await Promise.all([
    fetchJitoSolApy(),
    fetchMsolApy(),
    fetchBsolApy(),
  ]);

  return [
    { symbol: 'jitoSOL', apy: jitoApy, mint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn' },
    { symbol: 'mSOL',    apy: msolApy, mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' },
    { symbol: 'bSOL',    apy: bsolApy, mint: 'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1' },
  ];
}

export async function fetchJitoSolApyOnly(): Promise<number> {
  return fetchJitoSolApy();
}

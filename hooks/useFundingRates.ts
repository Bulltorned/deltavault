'use client';

import { useEffect, useState } from 'react';
import type { FundingRate } from '@/lib/agent';

export type { FundingRate };

interface UseFundingRatesReturn {
  rates: FundingRate[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useFundingRates(pollIntervalMs = 60_000): UseFundingRatesReturn {
  const [rates, setRates] = useState<FundingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const load = async () => {
    setError(null);
    try {
      const res = await fetch('/api/funding-rates');
      if (!res.ok) throw new Error('Failed to fetch funding rates');
      const data: FundingRate[] = await res.json();
      setRates(data);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch funding rates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, pollIntervalMs);
    return () => clearInterval(interval);
  }, [pollIntervalMs]);

  return { rates, isLoading, error, lastUpdated };
}

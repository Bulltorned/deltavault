import { NextResponse } from 'next/server';
import { fetchFundingRates } from '@/lib/agent';

export async function GET() {
  try {
    const rates = await fetchFundingRates();
    return NextResponse.json(rates);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch funding rates' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getConnection, fetchVaultState } from '@/lib/drift';

export async function GET() {
  try {
    const connection = getConnection();
    const state = await fetchVaultState(connection);
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch vault state' },
      { status: 500 }
    );
  }
}

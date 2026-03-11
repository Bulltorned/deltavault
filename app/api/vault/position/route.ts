import { NextResponse, NextRequest } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { getConnection, fetchUserPosition } from '@/lib/drift';

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet');
  if (!wallet) {
    return NextResponse.json({ error: 'wallet param required' }, { status: 400 });
  }

  try {
    const connection = getConnection();
    const pubkey = new PublicKey(wallet);
    const position = await fetchUserPosition(connection, pubkey);
    return NextResponse.json(position);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch position' },
      { status: 500 }
    );
  }
}

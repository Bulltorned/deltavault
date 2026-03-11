import { NextResponse } from 'next/server';
import { computeRebalanceDecision, RebalanceLogEntry } from '@/lib/agent';

// Called by Vercel Cron every 15 minutes (see vercel.json)
// Also callable manually: POST /api/agent/rebalance

// In-memory log (replace with Vercel KV for persistence in production)
const decisionLog: RebalanceLogEntry[] = [];

export async function GET() {
  return NextResponse.json({ log: decisionLog.slice(-10) });
}

export async function POST() {
  const startedAt = Date.now();

  try {
    // Determine current active pair from last log entry
    const lastEntry = decisionLog[decisionLog.length - 1];
    const currentPerpSymbol = lastEntry?.toPair?.split('/')[1] || 'SOL-PERP';

    // Run the AI decision engine
    const decision = await computeRebalanceDecision(currentPerpSymbol);

    const entry: RebalanceLogEntry = {
      id: `${startedAt}`,
      timestamp: startedAt,
      action: decision.killSwitch ? 'kill_switch' : decision.shouldRebalance ? 'rebalance' : 'hold',
      fromPair: `${decision.currentPair.spot}/${decision.currentPair.perp}`,
      toPair: `${decision.bestPair.spot}/${decision.bestPair.perp}`,
      improvement: decision.improvement,
      reason: decision.reason,
    };

    decisionLog.push(entry);

    // Keep log bounded
    if (decisionLog.length > 500) decisionLog.shift();

    if (decision.killSwitch) {
      // TODO: call vault program to close all positions
      console.log('[Agent] KILL SWITCH triggered:', decision.reason);
    } else if (decision.shouldRebalance) {
      console.log('[Agent] Rebalancing:', decision.reason);

      // In production:
      // 1. Sign a RebalanceInstruction with Ed25519 keypair
      // 2. Submit to on-chain validator instruction
      // 3. Validator checks: signature, freshness (<60s), health rate ≥1.05, slippage <1%
      // 4. Execute: close current short → swap spot LST → open new short

      // const { signature, nonce } = await signRebalanceInstruction({
      //   fromPerp: decision.currentPair.perp,
      //   toPerp: decision.bestPair.perp,
      //   timestamp: Date.now(),
      // });
      // await submitRebalance({ signature, nonce, decision });
    } else {
      console.log('[Agent] Holding:', decision.reason);
    }

    return NextResponse.json({
      ok: true,
      action: entry.action,
      decision: {
        currentPair: `${decision.currentPair.spot}/${decision.currentPair.perp}`,
        bestPair: `${decision.bestPair.spot}/${decision.bestPair.perp}`,
        improvement: `+${decision.improvement.toFixed(2)}%`,
        reason: decision.reason,
      },
      latencyMs: Date.now() - startedAt,
    });
  } catch (err) {
    console.error('[Agent] Error:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

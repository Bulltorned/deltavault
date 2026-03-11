# 🐻 Delta Vault

**AI-Driven Delta-Neutral Basis Trade Vault on Solana**

Earn 13–28% APY with zero directional risk. jitoSOL staking + Drift perpetual funding rates, continuously optimized by an AI agent.

Built for the **Ranger Build-A-Bear Hackathon** (Main Track + Drift Side Track).

---

## Strategy

| Component | Details |
|-----------|---------|
| Spot leg  | jitoSOL (7–8.5% APY from Solana staking + MEV) |
| Hedge leg | SOL-PERP short at 1× leverage on Drift Protocol |
| AI agent  | Rotates short to highest-yielding asset every 15 min |
| Net delta | ~0 (price-neutral) |
| Target APY | 13–28% combined |

---

## Stack

- **Framework**: Next.js 14 (App Router) — single repo, no separate backend
- **Wallet**: @solana/wallet-adapter (Phantom, Backpack, Solflare)
- **Vault program**: @drift-labs/vaults-sdk (audited, no custom Rust needed)
- **Perp exchange**: @drift-labs/sdk (Drift Protocol v3)
- **LST**: jitoSOL via Jito REST API
- **Swap**: Jupiter (bundled inside Drift SDK)
- **AI Agent**: Next.js API Route + Vercel Cron (every 15 min)
- **RPC**: Helius
- **Hosting**: Vercel

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your Helius RPC URL and agent private key
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

```bash
vercel deploy --prod
```

The AI agent cron is automatically configured via `vercel.json` to run every 15 minutes.

---

## Project Structure

```
app/
  page.tsx                        # Landing page
  dashboard/page.tsx              # Main vault dashboard
  api/agent/rebalance/route.ts    # AI agent (Vercel Cron, every 15 min)
lib/
  drift.ts                        # Drift SDK wrapper
  jito.ts                         # jitoSOL APY fetcher
  agent.ts                        # Rebalance decision logic + Ed25519 signing
  utils.ts                        # Formatting helpers
hooks/
  useVault.ts                     # Vault state + deposit/withdraw
  useFundingRates.ts              # Live funding rate polling
components/
  WalletProvider.tsx              # Solana wallet context
  ConnectButton.tsx               # Wallet connect/disconnect button
  VaultStats.tsx                  # APY, delta, health rate cards
  YieldChart.tsx                  # Donut chart (recharts)
  DepositModal.tsx                # Multi-step deposit flow
  AgentMonitor.tsx                # Live funding rates + rebalance history
  PositionCard.tsx                # User position summary
vercel.json                       # Cron: /api/agent/rebalance every 15 min
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `mainnet-beta` |
| `NEXT_PUBLIC_RPC_URL` | Helius RPC endpoint |
| `NEXT_PUBLIC_VAULT_PROGRAM_ID` | Drift Vault program address |
| `AGENT_PRIVATE_KEY` | Ed25519 key for AI agent signing (**server-side only**) |
| `DRIFT_ENV` | `mainnet-beta` |
| `MIN_SPREAD_IMPROVEMENT` | `0.01` (1% minimum to trigger rebalance) |
| `HEALTH_RATE_FLOOR` | `1.05` (kill switch threshold) |
| `DELTA_DRIFT_THRESHOLD` | `0.02` (2% max delta deviation) |

---

## Hackathon Eligibility

| Requirement | Status |
|-------------|--------|
| 10%+ APY | ✅ Conservative 13%, optimistic 28% |
| 3-month lock | ✅ `redeem_period = 7776000s` in Drift Vault config |
| No circular yield | ✅ Real staking + market funding rates |
| No junior tranche | ✅ jitoSOL collateral, no RLP/jrUSDe exposure |
| No DEX LP | ✅ jitoSOL is LST, not JLP |
| Health rate ≥ 1.05 | ✅ On-chain hard stop enforced |
| Drift Side Track | ✅ Built natively on Drift v3 |

---

Delta Vault · Parallax / EPIK · March 2026

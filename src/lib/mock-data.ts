// Mock data shaped like a Graph subgraph response. Swap with real queries later.
import { TOKENS } from "@/config/tokens";

export interface TokenRow {
  address: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  tvl: number;
}

export interface PoolRow {
  address: string;
  token0: string;
  token1: string;
  feeTier: number;
  tvl: number;
  volume24h: number;
  apr: number;
}

export interface TxRow {
  hash: string;
  type: "swap" | "add" | "remove";
  account: string;
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  usd: number;
  timestamp: number;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function topTokens(): TokenRow[] {
  return TOKENS.map((t, i) => ({
    address: t.address,
    symbol: t.symbol,
    name: t.name,
    priceUsd: t.priceUsd ?? 1,
    change24h: rand(-8, 12),
    volume24h: rand(50_000_000, 2_400_000_000) / (i + 1),
    tvl: rand(200_000_000, 8_400_000_000) / (i + 1),
  }));
}

const pairs: [string, string, number][] = [
  ["ETH", "USDC", 500],
  ["WBTC", "ETH", 3000],
  ["ETH", "USDT", 500],
  ["DAI", "USDC", 100],
  ["UNI", "ETH", 3000],
  ["LINK", "ETH", 3000],
  ["MATIC", "USDC", 3000],
  ["ETH", "DAI", 3000],
];

export function topPools(): PoolRow[] {
  return pairs.map(([a, b, fee], i) => ({
    address: `0x${(i + 1).toString(16).padStart(40, "0")}`,
    token0: a,
    token1: b,
    feeTier: fee,
    tvl: rand(40_000_000, 1_200_000_000) / (i + 1),
    volume24h: rand(10_000_000, 800_000_000) / (i + 1),
    apr: rand(2, 42),
  }));
}

export function recentTxs(n = 20): TxRow[] {
  const types: TxRow["type"][] = ["swap", "swap", "swap", "add", "remove"];
  return Array.from({ length: n }, (_, i) => {
    const [a, b] = pairs[i % pairs.length];
    return {
      hash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
      type: types[i % types.length],
      account: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`,
      token0: a,
      token1: b,
      amount0: rand(0.1, 50),
      amount1: rand(100, 200_000),
      usd: rand(500, 850_000),
      timestamp: Date.now() - i * rand(20_000, 220_000),
    };
  });
}

export function priceSeries(days = 90, base = 3000): { time: number; value: number }[] {
  const out: { time: number; value: number }[] = [];
  let v = base;
  const now = Math.floor(Date.now() / 1000);
  for (let i = days; i >= 0; i--) {
    v = Math.max(1, v + (Math.random() - 0.48) * base * 0.04);
    out.push({ time: now - i * 86400, value: +v.toFixed(2) });
  }
  return out;
}

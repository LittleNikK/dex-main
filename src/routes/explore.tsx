import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { topTokens, topPools, recentTxs } from "@/lib/mock-data";
import { fmtNumber, fmtPct, fmtUsd, shortAddress } from "@/lib/format";
import { TokenAvatar } from "@/components/swap/TokenSelectorModal";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — DEX" },
      { name: "description", content: "Live token, pool and transaction analytics across all supported chains." },
    ],
  }),
  component: ExplorePage,
});

const TABS = ["Tokens", "Pools", "Transactions"] as const;
const RANGES = ["1H", "1D", "1W", "1M"] as const;

function ExplorePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Tokens");
  const [range, setRange] = useState<(typeof RANGES)[number]>("1D");

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Hero label="TVL" value="$8.94B" delta={2.4} />
        <Hero label="24h Volume" value="$1.42B" delta={-1.1} />
        <Hero label="24h Fees" value="$4.26M" delta={0.6} />
        <Hero label="Active pairs" value="12,348" delta={3.2} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t ? "bg-surface-elevated text-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === r ? "bg-surface-elevated text-foreground" : "text-muted-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {tab === "Tokens" && <TokensTable />}
      {tab === "Pools" && <PoolsTable />}
      {tab === "Transactions" && <TxTable />}
    </div>
  );
}

function Hero({ label, value, delta }: { label: string; value: string; delta: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className={`mt-1 text-xs font-medium ${delta >= 0 ? "text-success" : "text-destructive"}`}>
        {fmtPct(delta)}
      </div>
    </div>
  );
}

function TokensTable() {
  const { data } = useQuery({ queryKey: ["tokens"], queryFn: () => topTokens(), staleTime: 15_000 });
  const rows = data ?? [];
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Table head={["#", "Token", "Price", "24h", "Volume", "TVL"]}>
        {rows.map((t, i) => (
          <tr key={t.address} className="border-t border-border/40 hover:bg-surface/40">
            <Td>{i + 1}</Td>
            <Td>
              <Link to="/tokens/$address" params={{ address: t.address }} className="flex items-center gap-3">
                <TokenAvatar symbol={t.symbol} />
                <div>
                  <div className="font-medium">{t.symbol}</div>
                  <div className="text-xs text-muted-foreground">{t.name}</div>
                </div>
              </Link>
            </Td>
            <Td>{fmtUsd(t.priceUsd)}</Td>
            <Td className={t.change24h >= 0 ? "text-success" : "text-destructive"}>{fmtPct(t.change24h)}</Td>
            <Td>{fmtUsd(t.volume24h, { compact: true })}</Td>
            <Td>{fmtUsd(t.tvl, { compact: true })}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function PoolsTable() {
  const { data } = useQuery({ queryKey: ["pools"], queryFn: () => topPools(), staleTime: 30_000 });
  const rows = data ?? [];
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Table head={["#", "Pool", "Fee tier", "TVL", "Volume 24h", "APR"]}>
        {rows.map((p, i) => (
          <tr key={p.address} className="border-t border-border/40 hover:bg-surface/40">
            <Td>{i + 1}</Td>
            <Td>
              <Link to="/pools/$address" params={{ address: p.address }} className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <TokenAvatar symbol={p.token0} />
                  <TokenAvatar symbol={p.token1} />
                </div>
                <span className="font-medium">{p.token0} / {p.token1}</span>
              </Link>
            </Td>
            <Td>{(p.feeTier / 10000).toFixed(2)}%</Td>
            <Td>{fmtUsd(p.tvl, { compact: true })}</Td>
            <Td>{fmtUsd(p.volume24h, { compact: true })}</Td>
            <Td className="text-success">{p.apr.toFixed(1)}%</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function TxTable() {
  const { data } = useQuery({ queryKey: ["txs"], queryFn: () => recentTxs(30), refetchInterval: 8000 });
  const rows = data ?? [];
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Table head={["Type", "Pair", "USD", "Account", "Time"]}>
        {rows.map((t) => (
          <tr key={t.hash} className="border-t border-border/40 hover:bg-surface/40">
            <Td>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  t.type === "swap"
                    ? "bg-accent/20 text-accent"
                    : t.type === "add"
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {t.type}
              </span>
            </Td>
            <Td>
              <Link to="/tx/$hash" params={{ hash: t.hash }} className="font-medium hover:text-primary">
                {t.token0} → {t.token1}
              </Link>
            </Td>
            <Td>{fmtUsd(t.usd)}</Td>
            <Td className="font-mono text-xs text-muted-foreground">{shortAddress(t.account, 6)}</Td>
            <Td>{timeAgo(t.timestamp)}</Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

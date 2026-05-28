import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { TOKENS } from "@/config/tokens";
import { priceSeries, recentTxs } from "@/lib/mock-data";
import { PriceChart } from "@/components/charts/PriceChart";
import { TokenAvatar } from "@/components/swap/TokenSelectorModal";
import { fmtNumber, fmtPct, fmtUsd, shortAddress } from "@/lib/format";

export const Route = createFileRoute("/tokens/$address")({
  head: ({ params }) => {
    const token = TOKENS.find((t) => t.address.toLowerCase() === params.address.toLowerCase());
    const name = token?.symbol ?? "Token";
    return {
      meta: [
        { title: `${name} — Lovable DEX` },
        { name: "description", content: `${name} price, volume, liquidity and live trades.` },
      ],
    };
  },
  component: TokenDetail,
});

function TokenDetail() {
  const { address } = Route.useParams();
  const token = TOKENS.find((t) => t.address.toLowerCase() === address.toLowerCase()) ?? TOKENS[0];
  const series = useMemo(() => priceSeries(120, token.priceUsd ?? 1000), [token.address]);
  const txs = useMemo(() => recentTxs(10), []);
  const change = 4.21;

  return (
    <div>
      <Link to="/explore" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to explore
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <TokenAvatar symbol={token.symbol} size={40} />
            <div>
              <h1 className="text-2xl font-semibold">{token.name} <span className="text-muted-foreground">({token.symbol})</span></h1>
              <p className="font-mono text-xs text-muted-foreground">{shortAddress(token.address, 6)}</p>
            </div>
          </div>

          <div className="mb-2 flex items-baseline gap-3">
            <span className="text-4xl font-semibold">{fmtUsd(token.priceUsd ?? 0)}</span>
            <span className={`text-sm font-medium ${change >= 0 ? "text-success" : "text-destructive"}`}>
              {fmtPct(change)} (24h)
            </span>
          </div>

          <div className="glass mt-4 rounded-2xl p-4">
            <PriceChart data={series} height={320} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Market cap" value={fmtUsd((token.priceUsd ?? 0) * 120_000_000, { compact: true })} />
            <Stat label="24h Volume" value={fmtUsd(842_000_000, { compact: true })} />
            <Stat label="TVL" value={fmtUsd(1_240_000_000, { compact: true })} />
          </div>

          <h2 className="mb-3 mt-8 text-lg font-semibold">Recent transactions</h2>
          <div className="glass overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">USD</th>
                  <th className="px-4 py-3 font-medium">{token.symbol}</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.hash} className="border-t border-border/40">
                    <td className="px-4 py-3 capitalize">{t.type}</td>
                    <td className="px-4 py-3">{fmtUsd(t.usd)}</td>
                    <td className="px-4 py-3">{fmtNumber(t.amount0, { max: 4 })}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{shortAddress(t.account, 5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="glass sticky top-20 rounded-3xl p-4">
            <div className="mb-3 text-sm font-semibold">Trade {token.symbol}</div>
            <Link
              to="/"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Open swap
            </Link>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Decimals" value={String(token.decimals)} />
              <Row label="Chain" value="Ethereum" />
              <a
                href={`https://etherscan.io/token/${token.address}`}
                target="_blank"
                rel="noreferrer"
                className="block text-xs text-primary hover:underline"
              >
                View on Etherscan ↗
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

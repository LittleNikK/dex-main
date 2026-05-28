import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { priceSeries, recentTxs } from "@/lib/mock-data";
import { PriceChart } from "@/components/charts/PriceChart";
import { TokenAvatar } from "@/components/swap/TokenSelectorModal";
import { fmtNumber, fmtUsd, shortAddress } from "@/lib/format";

export const Route = createFileRoute("/pools/$address")({
  head: () => ({
    meta: [
      { title: "Pool — Lovable DEX" },
      { name: "description", content: "Pool TVL, volume, fees and live transactions." },
    ],
  }),
  component: PoolDetail,
});

function PoolDetail() {
  const { address } = Route.useParams();
  const series = useMemo(() => priceSeries(90, 1_000_000), []);
  const txs = useMemo(() => recentTxs(12), []);

  return (
    <div>
      <Link to="/explore" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back to explore
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <TokenAvatar symbol="ETH" size={36} />
            <TokenAvatar symbol="USDC" size={36} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">ETH / USDC</h1>
            <p className="text-xs text-muted-foreground">0.30% fee tier • V3 • {shortAddress(address, 6)}</p>
          </div>
        </div>
        <Link
          to="/pool"
          className="rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Add liquidity
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="TVL" value={fmtUsd(420_000_000, { compact: true })} />
        <Stat label="24h Volume" value={fmtUsd(82_000_000, { compact: true })} />
        <Stat label="24h Fees" value={fmtUsd(248_000)} />
        <Stat label="APR" value="18.4%" tone="success" />
      </div>

      <div className="glass mb-6 rounded-2xl p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Volume & TVL</h3>
        <PriceChart data={series} height={280} />
      </div>

      <h2 className="mb-3 text-lg font-semibold">Recent pool transactions</h2>
      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">USD</th>
              <th className="px-4 py-3 font-medium">ETH</th>
              <th className="px-4 py-3 font-medium">USDC</th>
              <th className="px-4 py-3 font-medium">Account</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.hash} className="border-t border-border/40">
                <td className="px-4 py-3 capitalize">{t.type}</td>
                <td className="px-4 py-3">{fmtUsd(t.usd)}</td>
                <td className="px-4 py-3">{fmtNumber(t.amount0, { max: 4 })}</td>
                <td className="px-4 py-3">{fmtNumber(t.amount1, { max: 2 })}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{shortAddress(t.account, 5)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${tone === "success" ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}

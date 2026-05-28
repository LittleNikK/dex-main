import { createFileRoute } from "@tanstack/react-router";
import { SwapCard } from "@/components/swap/SwapCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trade — Lovable DEX" },
      { name: "description", content: "Swap any token across 5 chains with deep liquidity and best-price routing." },
    ],
  }),
  component: TradePage,
});

function TradePage() {
  return (
    <div className="flex flex-col items-center pt-8 sm:pt-16">
      <div className="mb-10 max-w-2xl text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Swap anywhere, <span className="text-gradient">in one click</span>
        </h1>
        <p className="mt-4 text-pretty text-base text-muted-foreground">
          Trade with the best on-chain prices across Ethereum, Base, Arbitrum, Optimism and Polygon.
        </p>
      </div>
      <SwapCard />
      <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="24h volume" value="$1.42B" />
        <Stat label="Total liquidity" value="$8.94B" />
        <Stat label="All-time swaps" value="412M" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

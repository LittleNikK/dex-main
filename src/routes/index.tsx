import { createFileRoute } from "@tanstack/react-router";
import { SwapCard } from "@/components/swap/SwapCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trade — DEX" },
      {
        name: "description",
        content: "Swap any token across 5 chains with deep liquidity and best-price routing.",
      },
    ],
  }),
  component: TradePage,
});

function TradePage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-130 rounded-4xl border border-border/60 bg-white/90 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-4">
        <SwapCard />
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dexswapx")({
  head: () => ({ meta: [{ title: "DEXSwapX — DEX" }] }),
  component: DEXSwapXPage,
});

function DEXSwapXPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-white/90 p-6">
        <h1 className="text-2xl font-semibold">DEXSwapX (Demo)</h1>
        <p className="mt-3 text-sm text-muted-foreground">Demo page for DEXSwapX meta-aggregator.</p>
      </div>
    </div>
  );
}

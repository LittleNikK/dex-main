import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mstchain")({
  head: () => ({ meta: [{ title: "mstchain — DEX" }] }),
  component: MstchainPage,
});

function MstchainPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-white/90 p-6">
        <h1 className="text-2xl font-semibold">mstchain (Demo)</h1>
        <p className="mt-3 text-sm text-muted-foreground">Demo page for the DeFi chain product.</p>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — DEX" }] }),
  component: WalletPage,
});

function WalletPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-white/90 p-6">
        <h1 className="text-2xl font-semibold">Wallet (Demo)</h1>
        <p className="mt-3 text-sm text-muted-foreground">This is a demo page for the Wallet product.</p>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TokenAvatar, TokenSelectorModal } from "@/components/swap/TokenSelectorModal";
import { TOKENS, type Token } from "@/config/tokens";
import { fmtUsd } from "@/lib/format";

export const Route = createFileRoute("/pool")({
  head: () => ({
    meta: [
      { title: "Pool — Lovable DEX" },
      { name: "description", content: "Provide liquidity, manage positions, and earn fees from V3 pools." },
    ],
  }),
  component: PoolPage,
});

const FEE_TIERS = [
  { fee: 100, label: "0.01%", desc: "Best for very stable pairs" },
  { fee: 500, label: "0.05%", desc: "Best for stable pairs" },
  { fee: 3000, label: "0.30%", desc: "Best for most pairs" },
  { fee: 10000, label: "1.00%", desc: "Best for exotic pairs" },
];

function PoolPage() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<"list" | "add">("list");
  const [tokenA, setTokenA] = useState<Token>(TOKENS[0]);
  const [tokenB, setTokenB] = useState<Token>(TOKENS[1]);
  const [fee, setFee] = useState(3000);
  const [picking, setPicking] = useState<"a" | "b" | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [depositA, setDepositA] = useState("");
  const [depositB, setDepositB] = useState("");

  if (step === "add") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Add liquidity</h1>
          <button onClick={() => setStep("list")} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back
          </button>
        </div>
        <div className="glass space-y-6 rounded-3xl p-6">
          {/* Pair */}
          <Section title="Select pair">
            <div className="grid grid-cols-2 gap-3">
              <PickButton token={tokenA} onClick={() => setPicking("a")} />
              <PickButton token={tokenB} onClick={() => setPicking("b")} />
            </div>
          </Section>

          {/* Fee */}
          <Section title="Fee tier">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FEE_TIERS.map((t) => (
                <button
                  key={t.fee}
                  onClick={() => setFee(t.fee)}
                  className={`rounded-2xl border p-3 text-left transition-colors ${
                    fee === t.fee
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface hover:bg-surface-elevated"
                  }`}
                >
                  <div className="text-sm font-semibold">{t.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Range */}
          <Section title="Set price range">
            <div className="grid grid-cols-2 gap-3">
              <RangeInput label="Min price" value={minPrice} onChange={setMinPrice} />
              <RangeInput label="Max price" value={maxPrice} onChange={setMaxPrice} />
            </div>
            <button className="mt-2 text-xs font-semibold text-primary hover:underline">
              Full range
            </button>
          </Section>

          {/* Deposit */}
          <Section title="Deposit amounts">
            <div className="space-y-3">
              <DepositInput token={tokenA} value={depositA} onChange={setDepositA} />
              <DepositInput token={tokenB} value={depositB} onChange={setDepositB} />
            </div>
          </Section>

          {!isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow"
                >
                  Connect wallet
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <button className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow">
              Preview position
            </button>
          )}
        </div>

        <TokenSelectorModal
          open={picking !== null}
          onClose={() => setPicking(null)}
          onSelect={(t) => (picking === "a" ? setTokenA(t) : setTokenB(t))}
          exclude={picking === "a" ? tokenB.symbol : tokenA.symbol}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your positions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage liquidity and earn fees.</p>
        </div>
        <button
          onClick={() => setStep("add")}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          <Plus className="h-4 w-4" /> New position
        </button>
      </div>

      {!isConnected ? (
        <EmptyState title="Connect your wallet" body="View, manage and create liquidity positions.">
          <ConnectButton />
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Link
              key={i}
              to="/pools/$address"
              params={{ address: `0x${i.toString(16).padStart(40, "0")}` }}
              className="glass rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <TokenAvatar symbol={i === 1 ? "ETH" : "WBTC"} />
                    <TokenAvatar symbol={i === 1 ? "USDC" : "ETH"} />
                  </div>
                  <div>
                    <div className="font-semibold">{i === 1 ? "ETH / USDC" : i === 2 ? "WBTC / ETH" : "UNI / ETH"}</div>
                    <div className="text-xs text-muted-foreground">0.30% • V3</div>
                  </div>
                </div>
                <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                  In range
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Liquidity</div>
                  <div className="mt-0.5 font-medium">{fmtUsd(12480 * i)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Unclaimed fees</div>
                  <div className="mt-0.5 font-medium text-success">{fmtUsd(82.13 * i)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function PickButton({ token, onClick }: { token: Token; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 hover:bg-surface-elevated"
    >
      <span className="flex items-center gap-2">
        <TokenAvatar symbol={token.symbol} />
        <span className="font-semibold">{token.symbol}</span>
      </span>
      <span className="text-xs text-muted-foreground">Change</span>
    </button>
  );
}

function RangeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0.0"
        className="mt-1 w-full bg-transparent text-xl font-medium outline-none"
      />
    </div>
  );
}

function DepositInput({ token, value, onChange }: { token: Token; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center gap-3">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0"
          className="min-w-0 flex-1 bg-transparent text-2xl font-medium outline-none"
        />
        <div className="flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5">
          <TokenAvatar symbol={token.symbol} size={20} />
          <span className="text-sm font-semibold">{token.symbol}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-3xl p-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

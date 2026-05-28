import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAccount, useEnsAddress } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { TokenAvatar, TokenSelectorModal } from "@/components/swap/TokenSelectorModal";
import { TOKENS, type Token } from "@/config/tokens";
import { fmtUsd } from "@/lib/format";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Send — Lovable DEX" },
      { name: "description", content: "Send tokens with ENS resolution and gas estimates." },
    ],
  }),
  component: SendPage,
});

function SendPage() {
  const { isConnected } = useAccount();
  const [token, setToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [picking, setPicking] = useState(false);

  const isEns = recipient.endsWith(".eth");
  const { data: ensAddress } = useEnsAddress({
    name: isEns ? recipient : undefined,
    chainId: mainnet.id,
  });

  const usd = (parseFloat(amount) || 0) * (token.priceUsd ?? 0);
  const valid = recipient.length > 0 && parseFloat(amount) > 0;

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Send</h1>
      <div className="glass space-y-4 rounded-3xl p-5">
        <div className="rounded-2xl bg-surface p-4">
          <div className="mb-2 text-xs text-muted-foreground">You're sending</div>
          <div className="flex items-center gap-3">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent text-3xl font-medium outline-none"
            />
            <button
              onClick={() => setPicking(true)}
              className="flex items-center gap-2 rounded-full bg-surface-elevated px-3 py-1.5"
            >
              <TokenAvatar symbol={token.symbol} size={22} />
              <span className="text-sm font-semibold">{token.symbol}</span>
            </button>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{fmtUsd(usd)}</div>
        </div>

        <div className="rounded-2xl bg-surface p-4">
          <div className="mb-2 text-xs text-muted-foreground">To</div>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Wallet address or ENS"
            className="w-full bg-transparent text-base outline-none"
          />
          {isEns && ensAddress && (
            <div className="mt-1 font-mono text-xs text-muted-foreground">{ensAddress}</div>
          )}
        </div>

        <div className="space-y-2 rounded-2xl bg-surface/50 px-4 py-3 text-xs">
          <Row label="Network" value="Ethereum" />
          <Row label="Estimated gas" value={fmtUsd(1.84)} />
        </div>

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
          <button
            disabled={!valid}
            className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow disabled:bg-surface disabled:text-muted-foreground disabled:shadow-none"
          >
            {valid ? "Review & send" : "Enter amount and recipient"}
          </button>
        )}
      </div>

      <TokenSelectorModal
        open={picking}
        onClose={() => setPicking(false)}
        onSelect={(t) => setToken(t)}
      />
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { TokenAvatar } from "@/components/swap/TokenSelectorModal";
import { fmtUsd, shortAddress } from "@/lib/format";

export const Route = createFileRoute("/tx/$hash")({
  head: ({ params }) => ({
    meta: [
      { title: `Transaction ${params.hash.slice(0, 10)}… —  DEX` },
      { name: "description", content: "On-chain transaction details, status and gas." },
    ],
  }),
  component: TxDetail,
});

function TxDetail() {
  const { hash } = Route.useParams();

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/explore" className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground">
        ← Back
      </Link>

      <div className="glass rounded-3xl p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Swap successful</h1>
            <p className="text-xs text-muted-foreground">Confirmed in block 19,482,310</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-surface p-4">
          <div className="text-xs text-muted-foreground">Swapped</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <TokenAvatar symbol="ETH" size={24} /> 1.245 ETH
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="flex items-center gap-2 font-semibold">
              <TokenAvatar symbol="USDC" size={24} /> 4,258.40 USDC
            </span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{fmtUsd(4258.4)}</div>
        </div>

        <dl className="space-y-3 text-sm">
          <Field label="Transaction hash" value={shortAddress(hash, 8)} mono />
          <Field label="From" value="0x742d…35Cc" mono />
          <Field label="To" value="0xE592…1564" mono />
          <Field label="Block" value="19,482,310" />
          <Field label="Timestamp" value="May 27, 2026 09:14:22 UTC" />
          <Field label="Gas used" value="142,318" />
          <Field label="Gas price" value="14.2 gwei" />
          <Field label="Network fee" value={fmtUsd(6.84)} />
          <Field label="Status" value="Success" tone="success" />
        </dl>

        <a
          href={`https://etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          View on Etherscan <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "success";
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`${mono ? "font-mono text-xs" : "font-medium"} ${
          tone === "success" ? "text-success" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

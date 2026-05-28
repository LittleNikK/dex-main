import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArrowDown, ChevronDown, ExternalLink, Loader2, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useSwapStore } from "@/store/swap-store";
import { TokenSelectorModal, TokenAvatar } from "./TokenSelectorModal";
import { SettingsPopover } from "./SettingsPopover";
import { fmtNumber, fmtUsd, shortAddress } from "@/lib/format";
import type { Token } from "@/config/tokens";
import { isNative, SWAP_ROUTER_02 } from "@/config/uniswap";
import { useUniswapQuote } from "@/hooks/use-uniswap-quote";
import {
  useApproveToken,
  useExecuteSwap,
  useTokenAllowance,
} from "@/hooks/use-uniswap-swap";

type Side = "input" | "output";

type SwapState =
  | "disconnected"
  | "unsupported"
  | "empty"
  | "insufficient"
  | "fetching"
  | "no-route"
  | "needs-approval"
  | "approving"
  | "ready"
  | "swapping"
  | "success";

const TABS = ["Swap", "Limit", "Buy"] as const;

export function SwapCard() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { inputToken, outputToken, slippage, deadline, setInputToken, setOutputToken, flip } = useSwapStore();

  const [tab, setTab] = useState<(typeof TABS)[number]>("Swap");
  const [amountIn, setAmountIn] = useState("");
  const [selecting, setSelecting] = useState<Side | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const supportedChain = !!SWAP_ROUTER_02[chainId];

  const { data: inputBalance } = useBalance({
    address,
    token: isNative(inputToken.address) ? undefined : (inputToken.address as `0x${string}`),
    chainId,
  });

  const balanceNum = inputBalance ? parseFloat(inputBalance.formatted) : 0;
  const numAmount = parseFloat(amountIn) || 0;

  // Real Uniswap V3 quote
  const quoteQuery = useUniswapQuote(inputToken, outputToken, amountIn, chainId);
  const quote = quoteQuery.data;

  // Allowance + approval
  const { allowance, refetch: refetchAllowance } = useTokenAllowance(inputToken, chainId);
  const approveCtrl = useApproveToken(inputToken, chainId);

  // Execute swap
  const swapCtrl = useExecuteSwap();

  const amountInWei = useMemo(() => {
    if (!amountIn || Number.isNaN(numAmount) || numAmount <= 0) return 0n;
    try {
      return parseUnits(amountIn, inputToken.decimals);
    } catch {
      return 0n;
    }
  }, [amountIn, inputToken.decimals, numAmount]);

  const needsApproval =
    !isNative(inputToken.address) && amountInWei > 0n && allowance < amountInWei;

  const amountOutMin = useMemo(() => {
    if (!quote) return 0n;
    const bps = BigInt(Math.floor((10000 * slippage) / 100));
    return (quote.amountOut * (10000n - bps)) / 10000n;
  }, [quote, slippage]);

  // Refresh allowance after approval mines
  useEffect(() => {
    if (approveCtrl.isApproved) {
      refetchAllowance();
      toast.success("Approval confirmed");
      approveCtrl.reset();
    }
  }, [approveCtrl.isApproved, refetchAllowance, approveCtrl]);

  // Surface swap success
  useEffect(() => {
    if (swapCtrl.status === "success" && swapCtrl.hash) {
      toast.success("Swap confirmed", {
        description: shortAddress(swapCtrl.hash, 6),
      });
      setAmountIn("");
      // Clear after a moment so the UI returns to ready
      const t = setTimeout(() => swapCtrl.reset(), 4000);
      return () => clearTimeout(t);
    }
    if (swapCtrl.status === "error" && swapCtrl.error) {
      toast.error("Swap failed", { description: swapCtrl.error.message.slice(0, 140) });
      swapCtrl.reset();
    }
  }, [swapCtrl.status, swapCtrl.hash, swapCtrl.error, swapCtrl]);

  const state: SwapState = (() => {
    if (!isConnected) return "disconnected";
    if (!supportedChain) return "unsupported";
    if (!numAmount) return "empty";
    if (numAmount > balanceNum) return "insufficient";
    if (quoteQuery.isFetching && !quote) return "fetching";
    if (!quote || quote.amountOut === 0n) return "no-route";
    if (swapCtrl.status === "submitting" || swapCtrl.status === "mining") return "swapping";
    if (swapCtrl.status === "success") return "success";
    if (approveCtrl.isApproving) return "approving";
    if (needsApproval) return "needs-approval";
    return "ready";
  })();

  function handleSelect(token: Token) {
    if (selecting === "input") {
      if (token.address === outputToken.address) setOutputToken(inputToken);
      setInputToken(token);
    } else if (selecting === "output") {
      if (token.address === inputToken.address) setInputToken(outputToken);
      setOutputToken(token);
    }
  }

  async function handleApprove() {
    try {
      await approveCtrl.approve();
      toast.message(`Approving ${inputToken.symbol}…`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Approval rejected";
      toast.error(msg.slice(0, 140));
    }
  }

  async function handleSwap() {
    if (!quote) return;
    try {
      await swapCtrl.swap({
        input: inputToken,
        output: outputToken,
        amountIn,
        amountOutMin,
        fee: quote.fee,
        chainId,
        deadlineMinutes: deadline,
      });
      toast.message("Confirm in wallet…");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Swap rejected";
      toast.error(msg.slice(0, 140));
    }
  }

  // Derived display values
  const usdIn = numAmount * (inputToken.priceUsd ?? 0);
  const outFormatted = quote ? quote.amountOutFormatted : "";
  const outNumber = quote ? Number(outFormatted) : 0;
  const usdOut = outNumber * (outputToken.priceUsd ?? 0);
  const rate = quote && numAmount > 0 ? outNumber / numAmount : 0;
  const minReceived = quote ? Number(formatUnits(amountOutMin, outputToken.decimals)) : 0;
  const priceImpact = quote && inputToken.priceUsd && outputToken.priceUsd && usdIn > 0
    ? Math.max(0, (1 - usdOut / usdIn) * 100)
    : 0;

  return (
    <div className="relative">
      <div className="glass mx-auto w-full max-w-130 rounded-4xl border border-white/20 bg-white/70 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
              Swap tokens
            </h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Clean pricing, fast routing, and a simple trade flow.
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen((s) => !s)}
            className="rounded-full border border-white/30 bg-white/40 p-2 text-muted-foreground shadow-sm transition-all duration-200 hover:bg-white/60 hover:text-foreground hover:shadow-md"
            aria-label="Settings"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 rounded-full border border-white/25 bg-white/35 p-1 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <TokenInput
          label="You pay"
          token={inputToken}
          value={amountIn}
          onChange={setAmountIn}
          onPickToken={() => setSelecting("input")}
          usd={usdIn}
          balance={balanceNum}
          showMax={isConnected && balanceNum > 0}
          onMax={() => setAmountIn(String(balanceNum))}
        />

        {/* Flip */}
        <div className="relative my-1 flex justify-center">
          <button
            onClick={flip}
            className="absolute -top-3 z-10 rounded-xl border-4 border-card bg-surface p-1.5 text-foreground transition-transform hover:scale-110 hover:bg-surface-elevated"
            aria-label="Flip tokens"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

        {/* Output */}
        <TokenInput
          label="You receive"
          token={outputToken}
          value={outFormatted ? Number(outFormatted).toFixed(6).replace(/\.?0+$/, "") : ""}
          onChange={() => {}}
          onPickToken={() => setSelecting("output")}
          usd={usdOut}
          readOnly
          loading={quoteQuery.isFetching && !!numAmount}
        />

        {/* Route / quote details */}
        <AnimatePresence>
          {quote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="space-y-2 rounded-3xl border border-white/30 bg-white/45 px-4 py-3 text-xs shadow-sm backdrop-blur-xl">
                <Row
                  label="Rate"
                  value={`1 ${inputToken.symbol} = ${fmtNumber(rate, { max: 6 })} ${outputToken.symbol}`}
                />
                <Row
                  label="Price impact"
                  value={`${priceImpact.toFixed(2)}%`}
                  tone={priceImpact > 5 ? "warn" : priceImpact > 2 ? "soft" : "ok"}
                />
                <Row
                  label="Min received"
                  value={`${fmtNumber(minReceived, { max: 6 })} ${outputToken.symbol}`}
                />
                <Row
                  label="Route"
                  value={`${inputToken.symbol} → ${outputToken.symbol} • V3 ${(quote.fee / 10000).toFixed(2)}%`}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tx links */}
        {(approveCtrl.hash || swapCtrl.hash) && (
          <div className="mt-3 space-y-1 text-xs">
            {approveCtrl.hash && (
              <TxLink hash={approveCtrl.hash} label={approveCtrl.isApproved ? "Approval confirmed" : "Approval submitted"} />
            )}
            {swapCtrl.hash && (
              <TxLink hash={swapCtrl.hash} label={swapCtrl.status === "success" ? "Swap confirmed" : "Swap submitted"} />
            )}
          </div>
        )}

        {/* Action */}
        <div className="mt-3">
          <ActionButton
            state={state}
            inputSymbol={inputToken.symbol}
            onApprove={handleApprove}
            onSwap={handleSwap}
          />
        </div>
      </div>

      {settingsOpen && (
        <div className="absolute right-0 top-16 z-20">
          <SettingsPopover onClose={() => setSettingsOpen(false)} />
        </div>
      )}

      <TokenSelectorModal
        open={selecting !== null}
        onClose={() => setSelecting(null)}
        onSelect={handleSelect}
        exclude={selecting === "input" ? outputToken.symbol : inputToken.symbol}
      />
    </div>
  );
}

function TxLink({ hash, label }: { hash: string; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface/50 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <Link
        to="/tx/$hash"
        params={{ hash }}
        className="inline-flex items-center gap-1 font-mono text-primary hover:underline"
      >
        {shortAddress(hash, 6)} <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}

function TokenInput({
  label,
  token,
  value,
  onChange,
  onPickToken,
  usd,
  balance,
  showMax,
  onMax,
  readOnly,
  loading,
}: {
  label: string;
  token: Token;
  value: string;
  onChange: (v: string) => void;
  onPickToken: () => void;
  usd?: number;
  balance?: number;
  showMax?: boolean;
  onMax?: () => void;
  readOnly?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface/70 p-4 transition-colors focus-within:bg-surface">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        {balance !== undefined && (
          <span className="text-xs text-muted-foreground">
            Available: {fmtNumber(balance, { max: 4 })}
            {showMax && (
              <button
                onClick={onMax}
                className="ml-2 text-xs font-semibold text-primary hover:underline"
              >
                MAX
              </button>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            inputMode="decimal"
            placeholder="0"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
            readOnly={readOnly}
            className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40 sm:text-[2.5rem]"
          />
          {loading && (
            <Loader2 className="absolute right-1 top-2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <button
          onClick={onPickToken}
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/30 bg-white/55 px-3 py-2 font-semibold shadow-sm transition-all duration-200 hover:bg-white/75 hover:shadow-md"
        >
          <TokenAvatar symbol={token.symbol} size={24} />
          <span className="text-sm">{token.symbol}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {usd ? fmtUsd(usd) : "$0"}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "soft" | "warn";
}) {
  const color =
    tone === "warn"
      ? "text-destructive"
      : tone === "soft"
      ? "text-warning"
      : tone === "ok"
      ? "text-success"
      : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}

function ActionButton({
  state,
  inputSymbol,
  onApprove,
  onSwap,
}: {
  state: SwapState;
  inputSymbol: string;
  onApprove: () => void;
  onSwap: () => void;
}) {
  if (state === "disconnected") {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <PillButton onClick={openConnectModal}>Connect wallet to swap</PillButton>
        )}
      </ConnectButton.Custom>
    );
  }
  if (state === "unsupported")
    return (
      <PillButton disabled tone="muted">
        Switch to a supported network
      </PillButton>
    );
  if (state === "empty")
    return (
      <PillButton disabled tone="muted">
        Enter an amount to preview
      </PillButton>
    );
  if (state === "insufficient")
    return (
      <PillButton disabled tone="muted">
        Insufficient {inputSymbol} balance
      </PillButton>
    );
  if (state === "fetching")
    return (
      <PillButton disabled tone="muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching best price
      </PillButton>
    );
  if (state === "no-route")
    return (
      <PillButton disabled tone="muted">
        No route available
      </PillButton>
    );
  if (state === "needs-approval")
    return <PillButton onClick={onApprove}>Approve {inputSymbol}</PillButton>;
  if (state === "approving")
    return (
      <PillButton disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving {inputSymbol}…
      </PillButton>
    );
  if (state === "swapping")
    return (
      <PillButton disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming swap…
      </PillButton>
    );
  if (state === "success") return <PillButton tone="success">Swap successful</PillButton>;
  return <PillButton onClick={onSwap}>Review & swap</PillButton>;
}

function PillButton({
  children,
  onClick,
  disabled,
  tone = "primary",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "primary" | "muted" | "success";
}) {
  const styles =
    tone === "muted"
      ? "bg-white/55 text-muted-foreground"
      : tone === "success"
      ? "bg-success text-success-foreground"
      : "bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-glow";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 w-full items-center justify-center rounded-2xl text-base font-semibold transition-opacity disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  );
}
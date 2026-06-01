import { useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { TOKENS, type Token } from "@/config/tokens";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  exclude?: string;
}

const COMMON = ["ETH", "USDC", "USDT", "DAI", "WBTC"];

export function TokenSelectorModal({ open, onClose, onSelect, exclude }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      TOKENS.filter(
        (t) =>
          t.symbol !== exclude &&
          (q === "" ||
            t.symbol.toLowerCase().includes(q.toLowerCase()) ||
            t.name.toLowerCase().includes(q.toLowerCase()) ||
            t.address.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, exclude],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-md rounded-3xl p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Select a token</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or paste address"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {COMMON.filter((s) => s !== exclude).map((sym) => {
            const tok = TOKENS.find((t) => t.symbol === sym);
            if (!tok) return null;
            return (
              <button
                key={sym}
                onClick={() => {
                  onSelect(tok);
                  onClose();
                }}
                className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-surface-elevated"
              >
                <TokenAvatar symbol={sym} size={18} />
                {sym}
              </button>
            );
          })}
        </div>

        <div className="-mx-2 max-h-80 overflow-y-auto">
          {filtered.map((t) => (
            <button
              key={t.address}
              onClick={() => {
                onSelect(t);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface"
            >
              <TokenAvatar symbol={t.symbol} />
              <div className="flex-1">
                <div className="text-sm font-medium">{t.symbol}</div>
                <div className="text-xs text-muted-foreground">{t.name}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No tokens found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function TokenAvatar({ symbol, size = 28 }: { symbol: string; size?: number }) {
  // Deterministic gradient based on symbol hash
  const hash = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue1 = (hash * 47) % 360;
  const hue2 = (hue1 + 60) % 360;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, hsl(${hue1} 70% 55%), hsl(${hue2} 70% 45%))`,
      }}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

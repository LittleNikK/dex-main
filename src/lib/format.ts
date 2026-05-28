export function shortAddress(addr?: string, chars = 4) {
  if (!addr) return "";
  return `${addr.slice(0, 2 + chars)}…${addr.slice(-chars)}`;
}

export function fmtUsd(n: number, opts: { compact?: boolean } = {}) {
  if (!Number.isFinite(n)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: opts.compact ? 2 : n < 1 ? 4 : 2,
  }).format(n);
}

export function fmtNumber(n: number, opts: { compact?: boolean; max?: number } = {}) {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: opts.max ?? 4,
  }).format(n);
}

export function fmtPct(n: number, max = 2) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(max)}%`;
}

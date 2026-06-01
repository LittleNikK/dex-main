import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { SettingsPopover } from "@/components/swap/SettingsPopover";
import { shortAddress } from "@/lib/format";

const NAV = [
  { to: "/", label: "Trade" },
  { to: "/explore", label: "Explore" },
  { to: "/pool", label: "Pool" },
   { to: "/portfolio", label: "Portfolio" },
  { to: "/send", label: "Send" },
];

export function Navbar() {
  const { location } = useRouterState();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const headerRef = useRef<HTMLElement | null>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    // initialize lastY on mount to avoid SSR mismatches
    lastY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const MIN_DELTA = 5; // ignore tiny movements
    const SHOW_AT_TOP = 0; // always show when at very top
    const HIDE_AFTER = 50; // require user scrolled down at least this many px before hiding

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (y <= SHOW_AT_TOP) {
          setVisible(true);
        } else if (Math.abs(delta) >= MIN_DELTA) {
          // scrolling down (positive delta) -> hide, but only after user scrolled past HIDE_AFTER
          if (delta > 0 && y > HIDE_AFTER) setVisible(false);
          // scrolling up (negative delta) -> show
          if (delta < 0) setVisible(true);
          lastY.current = y;
        }

        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isConnected) setWalletMenuOpen(false);
  }, [isConnected]);

  useEffect(() => {
    if (visible) return;
    const activeElement = document.activeElement;
    if (activeElement && headerRef.current?.contains(activeElement)) {
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
    }
  }, [visible]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-2 z-40 w-full transform will-change-transform transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-12 max-w-full items-center justify-between rounded-[1.5rem] border border-white/20 bg-white/10 px-4 shadow-lg shadow-slate-900/10 backdrop-blur-xl transition-colors duration-300 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-primary shadow-glow" />
              <span className="text-lg font-semibold tracking-tight">DEX</span>
            </Link>

            {/* Dropdown trigger placed to the right of the title */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-elevated"
                  aria-label="Open menu"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="start" sideOffset={8} alignOffset={0} className="w-72 p-2">
                <DropdownMenuLabel>Products</DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-2 py-1">
                  <DropdownMenuItem asChild>
                    <Link to="/wallet">Wallet</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dexswapx">DEXSwapX</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/api">API</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/mstchain">mstchain</Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Company</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/about">About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/blog">Blog</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-surface/80 p-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-surface text-foreground shadow-soft ring-1 ring-primary/15"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground hover:shadow-sm"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-surface/80 p-1 shadow-soft">
          <button
            onClick={() => setSettingsOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-surface-elevated hover:text-foreground hover:shadow-sm"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          {isConnected ? (
            <div className="relative">
              <button
                onClick={() => setWalletMenuOpen((open) => !open)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-surface px-4 text-sm font-medium text-foreground transition-all duration-200 hover:bg-surface-elevated hover:shadow-sm"
                aria-label="Wallet menu"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{shortAddress(address ?? "0x")}</span>
              </button>
              {walletMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-40 rounded-2xl border border-border/70 bg-surface p-2 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
                  <button
                    onClick={() => {
                      disconnect();
                      setWalletMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openConnectModal?.()}
              className="inline-flex h-10 items-center rounded-full border border-border/70 bg-surface px-4 text-sm font-medium text-foreground transition-all duration-200 hover:bg-surface-elevated hover:shadow-sm"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </div>
      {settingsOpen && (
        <div className="absolute right-4 top-16 z-50 sm:right-6 lg:right-8">
          <SettingsPopover onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </header>
  );
}

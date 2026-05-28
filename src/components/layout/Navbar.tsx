import { Link, useRouterState } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Settings } from "lucide-react";
import { useState } from "react";
import { SettingsPopover } from "@/components/swap/SettingsPopover";

const NAV = [
  { to: "/", label: "Trade" },
  { to: "/explore", label: "Explore" },
  { to: "/pool", label: "Pool" },
  { to: "/send", label: "Send" },
];

export function Navbar() {
  const { location } = useRouterState();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-primary shadow-glow" />
            <span className="text-lg font-semibold tracking-tight">Lovable DEX</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-surface text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen((s) => !s)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <ConnectButton
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus={{ smallScreen: "icon", largeScreen: "icon" }}
            showBalance={{ smallScreen: false, largeScreen: true }}
          />
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

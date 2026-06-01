export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/15 bg-white/35 backdrop-blur-2xl">
      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-white/25 bg-white/45 px-6 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-8">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr] md:items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow" />
                <div>
                  <div className="text-sm font-semibold tracking-[0.2em] text-foreground">DEX</div>
                  <div className="text-xs text-muted-foreground">Swap with speed and clarity</div>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                A clean decentralized exchange interface for fast swaps, simple liquidity, and a
                better trading flow.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Explore</h3>
              <nav className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <a href="#" className="transition-colors hover:text-foreground">
                  Trade
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Pool
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Explore
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Send
                </a>
              </nav>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Resources</h3>
              <nav className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <a href="#" className="transition-colors hover:text-foreground">
                  Docs
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Blog
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Terms
                </a>
                <a href="#" className="transition-colors hover:text-foreground">
                  Privacy
                </a>
              </nav>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/20 pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 DEX. Built for a smoother trading experience.</span>
            <div className="flex flex-wrap items-center gap-5">
              <a href="#" className="transition-colors hover:text-foreground">
                Twitter
              </a>
              <a href="#" className="transition-colors hover:text-foreground">
                Protocol
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

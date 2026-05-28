export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-gradient-primary" />
          <span>Lovable DEX</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Docs</a>
          <a href="#" className="hover:text-foreground">Blog</a>
          <a href="#" className="hover:text-foreground">Twitter</a>
          <a href="#" className="hover:text-foreground">Protocol</a>
        </nav>
      </div>
    </footer>
  );
}
